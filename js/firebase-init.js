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
                // optional: attempt anonymous sign-in if no signed-in user
                if (window.firebase.auth) {
                    try {
                        if (!window.firebase.auth().currentUser) {
                            window.firebase.auth().signInAnonymously()
                                .then(() => console.info('firebase-init: anonymous sign-in succeeded'))
                                .catch((e) => console.warn('firebase-init: anonymous sign-in failed (check console and Firebase Console -> Authentication)', e && e.message, e));
                        } else {
                            console.info('firebase-init: auth already has a currentUser:', window.firebase.auth().currentUser && window.firebase.auth().currentUser.uid);
                        }
                    } catch (e) {
                        console.warn('firebase-init: error while attempting anonymous sign-in', e);
                    }
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
