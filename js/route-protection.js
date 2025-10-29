// Route Protection and Authentication Management

// Wait for Firebase to be ready before initializing route protection
let firebaseReady = false;
window.addEventListener('firebaseReady', () => {
    firebaseReady = true;
    initializeRouteProtection();
});

// Timeout to prevent infinite waiting
setTimeout(() => {
    if (!firebaseReady) {
        console.warn('Firebase initialization timeout - proceeding with route protection');
        initializeRouteProtection();
    }
}, 5000);

function initializeRouteProtection() {
    // Check if this is the sign-in page
    const isSignInPage = window.location.pathname.endsWith('sign_in.html');
    
    // Update user status display using Firebase Auth directly
    function updateUserStatus() {
        const userStatus = document.querySelector('#userStatus');
        const userStatusText = document.querySelector('#userStatusText');
        const user = firebase.auth().currentUser;

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

    // Route protection with Firebase Auth
    function evaluateRoute(user) {
        // Store the intended destination if we need to redirect
        if (!isSignInPage && !user) {
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = 'sign_in.html';
            return;
        } else if (isSignInPage && user) {
            // After login, redirect to stored destination or home
            const redirectPath = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectPath;
            return;
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
            // Last-resort fallback: if after 3s auth still hasn't reported, evaluate based on snapshot (avoids stuck pages)
            setTimeout(() => {
                console.info('route-protection: fallback evaluation after timeout');
                evaluateRouteWithUser(snapshot);
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