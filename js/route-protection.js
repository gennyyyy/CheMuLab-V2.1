// Route Protection and Authentication Management

document.addEventListener('DOMContentLoaded', function() {
    // Check if this is the sign-in page
    const isSignInPage = window.location.pathname.endsWith('sign_in.html');
    
    // Helper to get the current user (always fresh)
    function getCurrentUser() {
        return AuthService.getCurrentUser();
    }

    // Update user status display (reads current user dynamically)
    function updateUserStatus() {
        const userStatus = document.querySelector('#userStatus');
        const userStatusText = document.querySelector('#userStatusText');
        const user = getCurrentUser();

        if (userStatus && userStatusText) {
            if (user) {
                userStatusText.textContent = `${user.username} (Logout)`;
                userStatus.onclick = () => {
                    AuthService.logout();
                    updateUserStatus();
                    // After logout, redirect to sign-in
                    window.location.href = 'sign_in.html';
                };
            } else {
                userStatusText.textContent = 'Sign In';
                userStatus.onclick = () => {
                    window.location.href = 'sign_in.html';
                };
            }
        }
    }

    // Route protection (use fresh user)
    const nowUser = getCurrentUser();
        // Route protection: defer the decision until auth state is known (prevents flash/redirect loop)
        function evaluateRouteWithUser(user) {
            const nowUser = user || getCurrentUser();
            const isLabPage = window.location.pathname.endsWith('your_lab.html');
            
            // Allow lab page in offline mode, protect other pages
            if (!isSignInPage && !nowUser && !isLabPage) {
                // Redirect to sign in if not authenticated and not on lab page
                window.location.href = 'sign_in.html';
                return;
            } else if (isSignInPage && nowUser) {
                // Redirect to home if already authenticated
                window.location.href = 'index.html';
                return;
            }
            
            // Add offline mode banner for lab page
            if (isLabPage && !nowUser) {
                const offlineBanner = document.createElement('div');
                offlineBanner.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: rgba(255, 193, 7, 0.95);
                    color: #000;
                    text-align: center;
                    padding: 8px;
                    font-size: 14px;
                    z-index: 1000;
                `;
                offlineBanner.innerHTML = `
                    You're in offline mode. <a href="sign_in.html" style="color: #0056b3; text-decoration: underline;">Sign in</a> 
                    to save your discoveries and track progress!
                `;
                document.body.appendChild(offlineBanner);
            }

            // Update user status display
            updateUserStatus();

            // Handle progress tracking for current user
            if (nowUser) {
                // Load user's progress
                const progress = AuthService.getUserProgress(nowUser.username);

                // If we're on the progress tracker page
                if (window.location.pathname.endsWith('progress_tracker.html')) {
                    if (typeof displayUserProgress === 'function') displayUserProgress(progress);
                }

                // If we're on the elements or your lab page
                if (window.location.pathname.endsWith('elements.html') ||
                    window.location.pathname.endsWith('your_lab.html')) {
                    // Update progress when new elements are discovered or combinations are made
                    window.updateProgress = function(newProgress) {
                        AuthService.updateUserProgress(nowUser.username, newProgress);
                    };
                }
            }
        }

        // Wait for firebase/auth to be ready. If firebase isn't present yet, listen for the firebaseReady event.
        function attachAuthListener() {
            if (window.firebase && firebase.auth) {
                // Use onAuthStateChanged to get a reliable user object (may be null). Run once then update UI.
                firebase.auth().onAuthStateChanged((user) => {
                    evaluateRouteWithUser(user ? { uid: user.uid, email: user.email || null, isAnonymous: !!user.isAnonymous } : null);
                });
                return true;
            }
            return false;
        }

        if (!attachAuthListener()) {
            // Firebase not ready yet; wait for our firebaseReady event then attach
            console.info('route-protection: Firebase not ready, waiting for firebaseReady before routing decisions');
            window.addEventListener('firebaseReady', () => {
                console.info('route-protection: firebaseReady received, attaching auth listener');
                attachAuthListener();
            }, { once: true });

            // Do NOT redirect immediately based on a local snapshot — wait a short grace period for auth to initialize.
            // This prevents flash-redirects when auth state is still being established.
            const snapshot = getCurrentUser();
            updateUserStatus();
            // Last-resort fallback: if after 3s auth still hasn't reported, evaluate based on snapshot.
            // IMPORTANT: only redirect if we actually have a non-null snapshot; otherwise
            // wait for firebaseReady/onAuthStateChanged to avoid premature redirect loops.
            setTimeout(() => {
                console.info('route-protection: fallback evaluation after timeout');
                if (snapshot) {
                    evaluateRouteWithUser(snapshot);
                } else {
                    console.info('route-protection: no auth snapshot available after timeout — awaiting firebaseReady/onAuthStateChanged');
                }
            }, 3000);
        }

    // Listen for storage changes (login/logout in other tabs) and update UI
    window.addEventListener('storage', () => updateUserStatus());

    // Handle progress tracking for current user
    if (nowUser) {
        // Load user's progress
        const progress = AuthService.getUserProgress(nowUser.username);

        // If we're on the progress tracker page
        if (window.location.pathname.endsWith('progress_tracker.html')) {
            if (typeof displayUserProgress === 'function') displayUserProgress(progress);
        }

        // If we're on the elements or your lab page
        if (window.location.pathname.endsWith('elements.html') ||
            window.location.pathname.endsWith('your_lab.html')) {
            // Update progress when new elements are discovered or combinations are made
            window.updateProgress = function(newProgress) {
                AuthService.updateUserProgress(nowUser.username, newProgress);
            };
        }
    }
});