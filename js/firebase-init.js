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
                    // Try to restore the user's auth state
                    window.firebase.auth().onAuthStateChanged(user => {
                        console.log('Auth state changed:', user ? 'User signed in' : 'No user');
                        if (user) {
                            window.dispatchEvent(new CustomEvent('userSignedIn', { detail: { uid: user.uid } }));
                        } else {
                            // Do NOT attempt anonymous sign-in as it may be restricted
                            // Just dispatch firebaseReady to allow app to proceed
                            console.info('No authenticated user. App will proceed in unauthenticated state.');
                            window.dispatchEvent(new CustomEvent('firebaseReady'));
                        }
                    });
                }
                // make firestore available on service modules
                try { 
                    window.firebase.firestore();
                    console.log('Firestore initialized');
                } catch (e) { 
                    console.warn('Failed to initialize Firestore:', e);
                }
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
