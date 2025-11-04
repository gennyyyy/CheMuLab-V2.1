// Update the user status display with the current user's info
async function updateUserStatus() {
    const userStatusText = document.getElementById('userStatusText');
    if (!userStatusText) return;
    
    // Get current Firebase user
    const user = firebase.auth().currentUser;
    if (!user) {
        userStatusText.textContent = 'Sign In';
        return;
    }

    try {
        // First check usernames collection (maps username → uid)
        const userQuery = await firebase.firestore().collection('usernames')
            .where('uid', '==', user.uid)
            .limit(1)
            .get();
        
        if (!userQuery.empty) {
            const usernameDoc = userQuery.docs[0];
            const username = usernameDoc.id;
            userStatusText.textContent = `${username} (Logout)`;
            return;
        }

        // Fallback to users/{uid} profile
        const profileDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (profileDoc.exists) {
            const profile = profileDoc.data();
            const username = profile.username || user.email || 'User';
            userStatusText.textContent = `${username} (Logout)`;
            return;
        }

        // Last resort: show email
        const username = user.email || 'User';
        userStatusText.textContent = `${username} (Logout)`;
    } catch (e) {
        console.warn('Error loading username:', e);
        userStatusText.textContent = user.email;
    }
}

// Listen for auth state changes to update the display
window.addEventListener('firebaseReady', () => {
    firebase.auth().onAuthStateChanged(updateUserStatus);
});

document.addEventListener('DOMContentLoaded', function() {
    const app = document.querySelector('.app-container');
    const btn = document.getElementById('sidebarToggle');
    const userStatus = document.getElementById('userStatus');
    const userStatusText = document.getElementById('userStatusText');
    
    if (userStatus && userStatusText) {
        // Initial update — call now only if Firebase is ready, otherwise wait for firebaseReady
        if (window.firebase && firebase.auth) {
            updateUserStatus();
        } else {
            window.addEventListener('firebaseReady', () => {
                try { updateUserStatus(); } catch (e) { /* ignore */ }
            }, { once: true });
        }
        
        // Handle sign-out button
        userStatus.addEventListener('click', function() {
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

    btn.addEventListener('click', function() {
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
    } catch (e) {}

    // Close sidebar when clicking outside on small screens
    document.addEventListener('click', function(e) {
        if (!app.classList.contains('sidebar-collapsed') && window.matchMedia('(max-width: 900px)').matches) {
            const sidebar = app.querySelector('.sidebar');
            if (sidebar && !sidebar.contains(e.target) && !btn.contains(e.target)) {
                app.classList.add('sidebar-collapsed');
            }
        }
    });
});
