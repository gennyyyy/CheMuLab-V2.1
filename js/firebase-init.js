// firebase-init.js
// Initialize Firebase and emit firebaseReady event when ready
(function() {
    // Wait for Firebase SDK to be available
    function waitForFirebase(callback) {
        if (window.firebase) {
            callback();
        } else {
            setTimeout(() => waitForFirebase(callback), 50);
        }
    }

    // Initialize Firebase with config
    function initializeFirebase() {
        // Check for config
        if (!window.FIREBASE_CONFIG) {
            console.error('[Firebase] No config found');
            return;
        }

        // Check if already initialized
        if (window.firebase.apps && window.firebase.apps.length > 0) {
            console.log('[Firebase] Already initialized');
            return;
        }

        try {
            // Initialize Firebase
            window.firebase.initializeApp(window.FIREBASE_CONFIG);
            console.log('[Firebase] Initialized successfully');

            // Wait for auth to be ready
            firebase.auth().onAuthStateChanged(function(user) {
                console.log('[Firebase] Auth state ready:', user ? 'logged in' : 'not logged in');
                window.dispatchEvent(new CustomEvent('firebaseReady'));
            });
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
