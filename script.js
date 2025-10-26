document.addEventListener('DOMContentLoaded', function() {
    const app = document.querySelector('.app-container');
    const btn = document.getElementById('sidebarToggle');

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
