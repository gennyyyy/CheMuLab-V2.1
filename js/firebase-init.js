// firebase-init.js
// Ensures Firebase is initialized as early as possible and emits a 'firebaseReady' event.
(function(){
    function logInit(message) {
        console.info('[Firebase Init]', message);
    }

    try {
        logInit('Starting initialization...');
        
        if (!window.FIREBASE_CONFIG) {
            console.warn('firebase-init: FIREBASE_CONFIG not found on window');
            return;
        }

        if (window.firebase && window.firebase.apps && window.firebase.apps.length) {
            logInit('Firebase already initialized, waiting for auth...');
            // already initialized - but make sure auth is ready
            firebase.auth().onAuthStateChanged((user) => {
                logInit(`Auth ready! User ${user ? 'logged in' : 'not logged in'}`);
                window.dispatchEvent(new CustomEvent('firebaseReady'));
            });
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
                    console.error('firebase-init: Firebase SDK did not load in time');
                }
            }, 200);
            return;
        }

        function tryInit(){
            try {
                logInit('Initializing Firebase app...');
                window.firebase.initializeApp(window.FIREBASE_CONFIG);
                
                // Initialize auth and wait for state
                if (window.firebase && window.firebase.auth) {
                    logInit('Waiting for auth state...');
                    firebase.auth().onAuthStateChanged((user) => {
                        logInit(`Initial auth state: ${user ? 'logged in' : 'not logged in'}`);
                    });
                }

                // Initialize Firestore
                try { 
                    window.firebase.firestore();
                    logInit('Firestore initialized');
                } catch (e) { 
                    console.warn('Failed to initialize Firestore:', e);
                }

                logInit('Firebase ready!');
                window.dispatchEvent(new CustomEvent('firebaseReady'));
            } catch (error) {
                console.error('Error initializing Firebase:', error);
                throw error;
            }
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
