// Quick sign-in helper (email/password) for testing and quick sync
(function(){
    function $(id){ return document.getElementById(id); }

    async function updateUiForUser(user){
        const statusText = $('userStatusText');
        const quickSignIn = $('quickSignIn');
        const quickSignOutBtn = $('quickSignOutBtn');
        const quickSignInBtn = $('quickSignInBtn');
        const quickSignMessage = $('quickSignMessage');

        if (!statusText || !quickSignIn) return;

        if (user) {
            statusText.textContent = user.email || user.uid;
            quickSignIn.style.display = 'block';
            $('quickEmail').style.display = 'none';
            $('quickPassword').style.display = 'none';
            quickSignInBtn.style.display = 'none';
            quickSignOutBtn.style.display = 'inline-block';
            quickSignMessage.textContent = 'Signed in — syncing...';
            try {
                await DiscoveryService.syncUserData(user.uid);
                quickSignMessage.textContent = 'Synced successfully';
            } catch (e) {
                quickSignMessage.textContent = 'Sync failed: ' + (e && e.message ? e.message : String(e)) + '\nUID: ' + (user.uid || 'n/a');
                console.error('Sync failed after sign-in for UID', user.uid, e);
            }
        } else {
            statusText.textContent = 'Sign In';
            quickSignIn.style.display = 'block';
            $('quickEmail').style.display = '';
            $('quickPassword').style.display = '';
            quickSignInBtn.style.display = '';
            quickSignOutBtn.style.display = 'none';
            quickSignMessage.textContent = '';
        }
    }

    function init(){
        if (!window.firebase) {
            // wait for firebaseReady event if available
            if (!window._quickSigninWaiting) {
                window._quickSigninWaiting = true;
                window.addEventListener('firebaseReady', () => { window._quickSigninWaiting = false; init(); }, { once: true });
            }
            console.warn('Firebase not loaded yet — quick-signin will initialize when firebaseReady fires');
            return;
        }

    const signInBtn = $('quickSignInBtn');
    const registerBtn = $('quickRegisterBtn');
        const signOutBtn = $('quickSignOutBtn');
        const emailInput = $('quickEmail');
        const passInput = $('quickPassword');
    const usernameInput = $('quickUsername');
        const msg = $('quickSignMessage');

        if (signInBtn) {
            signInBtn.addEventListener('click', async () => {
                const email = emailInput.value.trim();
                const password = passInput.value;
                if (!email || !password) { msg.textContent = 'Enter email & password'; return; }
                msg.textContent = 'Signing in...';
                try {
                    const res = await firebase.auth().signInWithEmailAndPassword(email, password);
                    msg.textContent = 'Signed in';
                    await DiscoveryService.syncUserData(res.user.uid);
                    msg.textContent = 'Synced successfully';
                    updateUiForUser(res.user);
                } catch (err) {
                    console.error('Sign-in failed', err);
                    msg.textContent = 'Sign-in failed: ' + (err && err.message ? err.message : err);
                }
            });
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', async () => {
                const username = usernameInput.value.trim();
                const email = emailInput.value.trim();
                const password = passInput.value;
                if (!email || !password) { msg.textContent = 'Enter email & password to register'; return; }
                msg.textContent = 'Registering...';
                try {
                    // Call AuthService.register which will link anonymous account if present
                    const user = await AuthService.register(username || email.split('@')[0], email, password);
                    msg.textContent = 'Registered and linked — UID: ' + (user && user.uid ? user.uid : 'unknown');
                    try {
                        await DiscoveryService.syncUserData(user.uid);
                        msg.textContent = 'Synced successfully — UID: ' + user.uid;
                    } catch (syncErr) {
                        console.error('Post-register sync failed for UID', user && user.uid, syncErr);
                        msg.textContent = 'Registered but sync failed: ' + (syncErr && syncErr.message ? syncErr.message : String(syncErr)) + ' — UID: ' + (user && user.uid);
                    }
                    updateUiForUser(user);
                } catch (err) {
                    console.error('Register failed', err);
                    // Show error.code if available (useful for permission-denied, operation-not-allowed, etc.)
                    const code = err && err.code ? err.code : null;
                    msg.textContent = 'Register failed: ' + (err && err.message ? err.message : String(err)) + (code ? ' (code: ' + code + ')' : '');
                    // If a user exists in auth despite the error, show the UID so user can inspect Authentication console
                    try { const cu = firebase && firebase.auth && firebase.auth().currentUser; if (cu) msg.textContent += ' — created UID: ' + cu.uid; } catch (e) {}
                }
            });
        }

        if (signOutBtn) {
            signOutBtn.addEventListener('click', async () => {
                try {
                    await firebase.auth().signOut();
                    $('quickSignMessage').textContent = 'Signed out';
                    updateUiForUser(null);
                } catch (err) {
                    console.error('Sign out failed', err);
                }
            });
        }

        // Update UI on auth state change
        firebase.auth().onAuthStateChanged(user => {
            updateUiForUser(user);
        });

        // initial state
        const current = firebase.auth().currentUser;
        updateUiForUser(current);
    }

    // If firebase is already loaded, init immediately; otherwise wait for DOMContentLoaded and then init
    if (window.firebase) init();
    else document.addEventListener('DOMContentLoaded', () => {
        // wait a short moment for firebase scripts to load
        setTimeout(() => { if (window.firebase) init(); else console.warn('Firebase not detected after DOMContentLoaded'); }, 250);
    });
})();
