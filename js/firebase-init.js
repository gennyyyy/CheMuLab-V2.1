// firebase-init.js
// Ensures Firebase is initialized as early as possible and emits a 'firebaseReady' event.
(function(){
    try {
        if (!window.FIREBASE_CONFIG) {
            console.warn('firebase-init: FIREBASE_CONFIG not found on window');
            return;
        }

        if (window.firebase && window.firebase.apps && window.firebase.apps.length) {
            // already initialized
            window.dispatchEvent(new CustomEvent('firebaseReady'));
            return;
        }

        if (!window.firebase || !window.firebase.initializeApp) {
            console.warn('firebase-init: firebase SDK not yet loaded');
            // If scripts haven't loaded synchronously, wait a short time and retry a few times
            let tries = 0;
            const maxTries = 20;
            const t = setInterval(() => {
                tries++;
                if (window.firebase && window.firebase.initializeApp) {
                    clearInterval(t);
                    tryInit();
                } else if (tries >= maxTries) {
                    clearInterval(t);
                    console.warn('firebase-init: firebase SDK did not load in time');
                }
            }, 200);
            return;
        }

        function tryInit(){
            try {
                window.firebase.initializeApp(window.FIREBASE_CONFIG);
                // NOTE: Automatic anonymous sign-in was removed for deployed sites because
                // many Firebase projects disable anonymous auth or restrict that operation
                // (resulting in auth/admin-restricted-operation). If you intentionally
                // want anonymous users to be created automatically, re-enable this block
                // after verifying the Anonymous provider is enabled in the Firebase
                // Console (Authentication → Sign-in Method).
                if (window.firebase && window.firebase.auth) {
                    console.info('firebase-init: anonymous auto-signin disabled by default for deployed sites');
                }
                // make firestore available on service modules
                try { window.firebase.firestore(); } catch (e) { /* ignore */ }
                window.dispatchEvent(new CustomEvent('firebaseReady'));
                console.info('firebase-init: Firebase initialized and firebaseReady dispatched');
            } catch (err) {
                console.error('firebase-init: failed to initialize Firebase', err);
            }
        }

        // If we reached here synchronously, try init now
        tryInit();
    } catch (err) {
        console.error('firebase-init: unexpected error', err);
    }
})();
