// Update the user status display with the current user's info
function updateUserStatus() {
    const userStatusText = document.getElementById('userStatusText');
    const currentUser = AuthService.getCurrentUser();
    
    if (currentUser) {
        // Show username if available, fall back to email, then uid
        const displayName = currentUser.username || currentUser.email || currentUser.uid;
        userStatusText.textContent = displayName + (currentUser.isAdmin ? ' (Admin)' : '');
    } else {
        userStatusText.textContent = 'Sign In';
    }
}

// Listen for auth state changes to update the display
window.addEventListener('firebaseReady', () => {
    firebase.auth().onAuthStateChanged(updateUserStatus);
});

document.addEventListener('DOMContentLoaded', function() {
    const app = document.querySelector('.app-container');
    const btn = document.getElementById('sidebarToggle');
    
    // Update user status on page load
    updateUserStatus();
    
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
