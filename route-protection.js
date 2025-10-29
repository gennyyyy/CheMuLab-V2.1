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
    if (!isSignInPage && !nowUser) {
        // Redirect to sign in if not authenticated
        window.location.href = 'sign_in.html';
    } else if (isSignInPage && nowUser) {
        // Redirect to home if already authenticated
        window.location.href = 'index.html';
    }

    // Update user status display
    updateUserStatus();

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