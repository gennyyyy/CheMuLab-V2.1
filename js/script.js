// Flag to track if the initial auth state has been determined
window.__authResolved = window.__authResolved || false;

// Update the user status display with the current user's info
async function updateUserStatus() {
    const userStatusText = document.getElementById('userStatusText');
    if (!userStatusText) return;

    // Check for cached username and update sidebar
    const cachedUsername = localStorage.getItem('cachedUsername');
    if (cachedUsername && !userStatusText.dataset.updated) {
        userStatusText.innerHTML = ''; // Clear header profile display
        updateSidebarLogout(true, cachedUsername);
    }

    // Get current Firebase user
    const user = firebase.auth().currentUser;

    if (!user) {
        // Only show "Sign In" if we have received a definitive auth state from Firebase
        if (window.__authResolved) {
            userStatusText.textContent = 'Sign In';
            localStorage.removeItem('cachedUsername');
        }
        return;
    }

    try {
        console.log('[updateUserStatus] Fetching username for user:', user.uid);

        // First check users/{uid} profile for username
        const profileDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        console.log('[updateUserStatus] Profile doc exists:', profileDoc.exists);

        if (profileDoc.exists) {
            const profile = profileDoc.data();
            console.log('[updateUserStatus] Profile data:', profile);

            if (profile.username) {
                console.log('[updateUserStatus] Found username in profile:', profile.username);
                const avatarUrl = profile.photoURL || 'img/default-avatar.png';
                userStatusText.innerHTML = ''; // Clear header profile display
                userStatusText.dataset.updated = "true";
                localStorage.setItem('cachedUsername', profile.username);
                updateSidebarLogout(true, profile.username, avatarUrl, user.emailVerified);
                return;
            }

        }

        // Fallback to usernames collection (maps username → uid)
        console.log('[updateUserStatus] Username not in profile, checking usernames collection');
        const userQuery = await firebase.firestore().collection('usernames')
            .where('uid', '==', user.uid)
            .limit(1)
            .get();

        if (!userQuery.empty) {
            const usernameDoc = userQuery.docs[0];
            const username = usernameDoc.id;
            console.log('[updateUserStatus] Found username in usernames collection:', username);

            // Try to find photoURL in profile for usernames-only fallback
            let avatarUrl = 'img/default-avatar.png';
            if (profileDoc.exists) {
                avatarUrl = profileDoc.data().photoURL || avatarUrl;
            }

            userStatusText.innerHTML = ''; // Clear header profile display
            userStatusText.dataset.updated = "true";
            localStorage.setItem('cachedUsername', username);
            updateSidebarLogout(true, username, avatarUrl, user.emailVerified);
            return;
        }


        // Last resort: show email only if we don't even have a cached one
        console.log('[updateUserStatus] No username found, using email or cache');
        const username = profile && profile.username ? profile.username : (localStorage.getItem('cachedUsername') || user.email || 'User');
        const avatarUrl = (profile && profile.photoURL) || 'img/default-avatar.png';

        userStatusText.innerHTML = ''; // Clear header profile display
        userStatusText.dataset.updated = "true";
        if (username !== user.email) localStorage.setItem('cachedUsername', username);
        updateSidebarLogout(true, username, avatarUrl, user.emailVerified);

    } catch (e) {
        console.warn('[updateUserStatus] Error loading username:', e);
        // Don't overwrite the cached name with an email on error!
        if (!userStatusText.innerHTML && user) {
            userStatusText.textContent = user.email;
        }
    }
}

// Function to update the sidebar logout button visibility
function updateSidebarLogout(isLoggedIn, username = 'Explorer', avatarUrl = 'img/default-avatar.png', isVerified = false) {
    const logoutContainer = document.getElementById('sidebarLogoutContainer');
    if (!logoutContainer) return;

    if (isLoggedIn) {
        logoutContainer.innerHTML = `
            <div class="user-profile-card">
                <a href="profile.html" class="user-profile-info" style="text-decoration: none;">
                    <div class="user-profile-avatar">
                        <img src="${avatarUrl}" alt="Profile">
                    </div>
                    <div class="user-profile-details">
                        <span class="user-profile-name">${username}</span>
                        <span class="user-profile-status">${isVerified ? 'Verified' : 'Explorer'}</span>
                    </div>
                </a>
                <button id="sidebarLogoutBtn" class="user-profile-logout" title="Logout">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        `;
        const btn = document.getElementById('sidebarLogoutBtn');
        if (btn) {
            btn.onclick = (e) => {
                e.preventDefault();
                AuthService.logout();
            };
        }
    } else {
        logoutContainer.innerHTML = '';
    }
}

// Listen for auth state changes to update the display
const setupAuthListener = () => {
    console.log('[script.js] Setting up auth state listener');
    firebase.auth().onAuthStateChanged((user) => {
        console.log('[script.js] Auth state changed, user:', user ? user.uid : 'null');
        window.__authResolved = true; // Mark as resolved on the very first callback
        updateUserStatus();
    });
};

// Set up listener as soon as Firebase is ready
if (window.firebase && firebase.auth) {
    setupAuthListener();
} else {
    window.addEventListener('firebaseReady', setupAuthListener);
}

document.addEventListener('DOMContentLoaded', function () {
    const app = document.querySelector('.app-container');
    const btn = document.getElementById('sidebarToggle');
    const userStatus = document.getElementById('userStatus');
    const userStatusText = document.getElementById('userStatusText');

    if (userStatus && userStatusText) {
        // Initial update — call now only if Firebase is ready
        if (window.firebase && firebase.auth) {
            console.log('[script.js] DOMContentLoaded: Firebase already ready, calling updateUserStatus');
            setTimeout(updateUserStatus, 500);
        } else {
            console.log('[script.js] DOMContentLoaded: Firebase not ready yet, waiting for firebaseReady');
            window.addEventListener('firebaseReady', () => {
                console.log('[script.js] firebaseReady event received in DOMContentLoaded callback');
                setTimeout(updateUserStatus, 500);
            }, { once: true });
        }

        // Handle sign-out button
        userStatus.addEventListener('click', function () {
            const currentUser = AuthService.getCurrentUser();
            if (currentUser) {
                AuthService.logout();
            } else {
                window.location.href = 'sign_in.html';
            }
        });
    }

    // Set active page indicator based on current URL
    const currentPath = window.location.pathname;
    const sidebarItems = document.querySelectorAll('.sidebar-item');

    sidebarItems.forEach(item => {
        // Remove any existing active class first
        item.classList.remove('active');

        // Get the href and compare with current path
        const itemPath = item.getAttribute('href');
        if (itemPath && (currentPath.endsWith(itemPath) ||
            (itemPath === 'index.html' && currentPath.endsWith('/')))) {
            item.classList.add('active');
        }
    });

    if (!btn || !app) return;

    // Initialize state (collapsed on small screens)
    if (window.matchMedia && window.matchMedia('(max-width: 900px)').matches) {
        app.classList.add('sidebar-collapsed');
    }

    btn.addEventListener('click', function () {
        app.classList.toggle('sidebar-collapsed');
        try {
            localStorage.setItem('chemulab_sidebar_collapsed', app.classList.contains('sidebar-collapsed'));
        } catch (e) {
            // ignore storage errors
        }
    });

    // restore preference if exists
    try {
        const isMobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
        const stored = localStorage.getItem('chemulab_sidebar_collapsed');

        if (stored === 'true') {
            app.classList.add('sidebar-collapsed');
        } else if (stored === 'false' && !isMobile) {
            // Only restore "open" state if we're on desktop
            app.classList.remove('sidebar-collapsed');
        } else if (isMobile) {
            // Default for mobile is always collapsed if no specific action taken
            app.classList.add('sidebar-collapsed');
        }
    } catch (e) { }

    // Close sidebar when clicking outside on small screens
    document.addEventListener('click', function (e) {
        if (!app.classList.contains('sidebar-collapsed') && window.matchMedia('(max-width: 900px)').matches) {
            const sidebar = app.querySelector('.sidebar');
            if (sidebar && !sidebar.contains(e.target) && !btn.contains(e.target)) {
                app.classList.add('sidebar-collapsed');
            }
        }
    });

    // Theme Toggle Logic
    const initTheme = () => {
        const storedTheme = localStorage.getItem('chemulab_theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    };

    // Inject toggle button if missing (ensure it exists regardless of auth)
    const headerLeft = document.querySelector('.header-left');
    if (headerLeft && !document.getElementById('themeToggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'themeToggle';
        toggleBtn.className = 'theme-toggle';
        toggleBtn.setAttribute('aria-label', 'Toggle Dark Mode');
        toggleBtn.innerHTML = '<span class="toggle-icon sun">☀️</span><span class="toggle-icon moon">🌙</span>';

        // Append to header-left so it stays grouped with logo and toggle
        headerLeft.appendChild(toggleBtn);
    }

    // Initialize immediately
    initTheme();

    // Re-attach listener for dynamically added toggle button
    document.addEventListener('click', function (e) {
        const toggleBtn = e.target.closest('#themeToggle');
        if (toggleBtn) {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('chemulab_theme', newTheme);
        }
    });
    // --- Scroll Position Retention ---
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    const scrollKey = `chemulab_scroll_pos_${window.location.pathname}`;
    let restoreTimeouts = [];

    const stopRestoration = () => {
        if (restoreTimeouts.length > 0) {
            console.log('[ScrollRestoration] User interacted, stopping snap-back');
            restoreTimeouts.forEach(clearTimeout);
            restoreTimeouts = [];
        }
    };

    // Restore scroll position
    const restoreScroll = () => {
        const savedPos = sessionStorage.getItem(scrollKey);
        if (savedPos) {
            const pos = parseInt(savedPos, 10);
            window.scrollTo(0, pos);

            // Queue up future checks for dynamic content (e.g. Firebase loading)
            // But only if the user hasn't moved away yet
            restoreTimeouts.push(setTimeout(() => {
                if (restoreTimeouts.length > 0) window.scrollTo(0, pos);
            }, 500));

            restoreTimeouts.push(setTimeout(() => {
                if (restoreTimeouts.length > 0) window.scrollTo(0, pos);
                restoreTimeouts = []; // Clear after last check
            }, 1500));
        }
    };

    // Stop automated snap-back if user physically interacts
    ['wheel', 'mousedown', 'keydown', 'touchmove'].forEach(evt => {
        window.addEventListener(evt, stopRestoration, { passive: true });
    });

    // Save scroll position with bounce protection
    let saveTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            sessionStorage.setItem(scrollKey, window.scrollY);
        }, 150);
    }, { passive: true });

    // Initial restoration
    restoreScroll();
    window.addEventListener('load', restoreScroll);
});
