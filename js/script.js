// Flag to track if the initial auth state has been determined
window.__authResolved = window.__authResolved || false;

// Update the user status display with the current user's info
async function updateUserStatus() {
    const userStatusText = document.getElementById('userStatusText');
    if (!userStatusText) return;

    // Check for cached username to show immediately
    const cachedUsername = localStorage.getItem('cachedUsername');
    if (cachedUsername && !userStatusText.dataset.updated) {
        userStatusText.innerHTML = `${cachedUsername} <span class="logout-btn"><span class="logout-icon"><img src="img/logout-icon.png" alt="Logout"></span><span class="logout-text">Logout</span></span>`;
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
                const html = `
                    <div class="header-user">
                        <img src="${avatarUrl}" class="header-avatar" alt="Profile">
                        <span class="header-username">${profile.username}</span>
                        <span class="logout-btn">
                            <span class="logout-icon"><img src="img/logout-icon.png" alt="Logout"></span>
                            <span class="logout-text">Logout</span>
                        </span>
                    </div>
                `;
                userStatusText.innerHTML = html;
                userStatusText.dataset.updated = "true";
                localStorage.setItem('cachedUsername', profile.username);
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

            const html = `
                <div class="header-user">
                    <img src="${avatarUrl}" class="header-avatar" alt="Profile">
                    <span class="header-username">${username}</span>
                    <span class="logout-btn">
                        <span class="logout-icon"><img src="img/logout-icon.png" alt="Logout"></span>
                        <span class="logout-text">Logout</span>
                    </span>
                </div>
            `;
            userStatusText.innerHTML = html;
            userStatusText.dataset.updated = "true";
            localStorage.setItem('cachedUsername', username);
            return;
        }


        // Last resort: show email only if we don't even have a cached one
        console.log('[updateUserStatus] No username found, using email or cache');
        const username = profile && profile.username ? profile.username : (localStorage.getItem('cachedUsername') || user.email || 'User');
        const avatarUrl = (profile && profile.photoURL) || 'img/default-avatar.png';

        const html = `
            <div class="header-user">
                <img src="${avatarUrl}" class="header-avatar" alt="Profile">
                <span class="header-username">${username}</span>
                <span class="logout-btn">
                    <span class="logout-icon"><img src="img/logout-icon.png" alt="Logout"></span>
                    <span class="logout-text">Logout</span>
                </span>
            </div>
        `;
        userStatusText.innerHTML = html;
        userStatusText.dataset.updated = "true";
        if (username !== user.email) localStorage.setItem('cachedUsername', username);

    } catch (e) {
        console.warn('[updateUserStatus] Error loading username:', e);
        // Don't overwrite the cached name with an email on error!
        if (!userStatusText.innerHTML && user) {
            userStatusText.textContent = user.email;
        }
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
        const stored = localStorage.getItem('chemulab_sidebar_collapsed');
        if (stored === 'true') app.classList.add('sidebar-collapsed');
        if (stored === 'false') app.classList.remove('sidebar-collapsed');
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
});
