// Test Firebase connection and sync functionality
async function testFirebaseConnection() {
    console.log('Testing Firebase connection...');

    // Ensure Firebase is available (DiscoveryService.ensureFirebase may initialize it)
    let isFirebaseReady = false;
    try {
        if (window.DiscoveryService && DiscoveryService.ensureFirebase) {
            isFirebaseReady = await DiscoveryService.ensureFirebase();
        } else {
            // If DiscoveryService isn't present, consider firebase presence directly
            isFirebaseReady = !!(window.firebase && firebase.initializeApp);
        }
    } catch (err) {
        console.warn('Error while ensuring Firebase:', err);
        isFirebaseReady = !!(window.firebase && firebase.initializeApp);
    }

    console.log('Firebase initialized:', isFirebaseReady);
    if (!isFirebaseReady) {
        console.error('Firebase failed to initialize. Check your firebase-config.js and make sure the SDK/init script is loaded.');
        return;
    }

    // Wait for the auth state to settle using onAuthStateChanged.
    // This will call back immediately with the current auth state (may be null), and again if it changes.
    const auth = firebase.auth();

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
        unsubscribe(); // run once per test invocation

        if (!user) {
            console.log('No authenticated user found. Please sign in with an email/password account first to run Firebase connection tests.');
            return;
        }

        console.log('Running tests with authenticated user:', { uid: user.uid, email: user.email });

        // Test Firestore access with proper user-scoped collection
        try {
            await firebase.firestore().collection('progress').doc(user.uid).set({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                testId: 'connection-test',
                progress: {
                    totalDiscoveries: 0,
                    completedDiscoveries: 0,
                    progressPercentage: 0,
                    milestones: { beginner: false, intermediate: false, advanced: false, master: false }
                }
            });
            console.log('Firestore write successful to progress collection');

            await firebase.firestore().collection('discoveries').doc(user.uid).set({
                discoveries: [],
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Firestore write successful to discoveries collection');
        } catch (error) {
            // Print structured error info to help diagnose rules/auth/network issues
            try {
                console.error('Firestore write failed. Error code:', error && error.code, 'message:', error && error.message);
                if (error && error.stack) console.error(error.stack);
            } catch (logErr) {
                console.error('Error while logging Firestore error', logErr);
            }

            // Helpful next steps
            console.log('Possible causes: Firestore security rules blocking writes, or the signed-in user lacks permissions. Check Firestore rules and Authentication state for this UID:', user.uid);
        }
    }, (err) => {
        console.error('onAuthStateChanged error:', err);
    });
}

// Run tests when the page loads; wait for firebaseReady if necessary
document.addEventListener('DOMContentLoaded', () => {
    function start() { testFirebaseConnection(); }
    if (window.firebase && firebase.auth) {
        start();
    } else {
        window.addEventListener('firebaseReady', start, { once: true });
    }
});