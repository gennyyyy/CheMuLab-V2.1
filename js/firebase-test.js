// Test Firebase connection and sync functionality
async function testFirebaseConnection() {
    console.log('Testing Firebase connection...');
    
    // Test Firebase initialization
    const isFirebaseReady = await DiscoveryService.ensureFirebase();
    console.log('Firebase initialized:', isFirebaseReady);
    
    if (!isFirebaseReady) {
        console.error('Firebase failed to initialize. Check your firebase-config.js and make sure the script is loaded.');
        return;
    }

    // Test anonymous auth
    let currentUser = firebase.auth().currentUser;
    if (currentUser) {
        console.log('Current user:', { uid: currentUser.uid, isAnonymous: currentUser.isAnonymous });
    } else {
        console.log('No authenticated user currently. Will attempt anonymous sign-in now (if allowed by project).');
        try {
            if (window.firebase && firebase.auth) {
                const anonResult = await firebase.auth().signInAnonymously().catch(e => { throw e; });
                currentUser = firebase.auth().currentUser || (anonResult && anonResult.user);
                if (currentUser) console.log('Anonymous sign-in succeeded:', { uid: currentUser.uid });
            }
        } catch (e) {
            console.warn('Anonymous sign-in attempt failed:', e && e.code, e && e.message);
            console.log('If anonymous sign-in is disabled, enable it in Firebase Console -> Authentication -> Sign-in method, or sign in with an email/password account. Skipping Firestore write test.');
            return;
        }
    }

    // Test Firestore access with proper user-scoped collection
    try {
        await firebase.firestore().collection('progress').doc(currentUser.uid).set({
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

        await firebase.firestore().collection('discoveries').doc(currentUser.uid).set({
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
        if (!currentUser) {
            console.log('No authenticated user. Enable Anonymous Authentication or sign in before attempting writes.');
        } else {
            console.log('Possible causes: Firestore security rules blocking writes, or the signed-in user lacks permissions. Check Firestore rules and Authentication state for this UID:', currentUser.uid);
        }
    }
}

// Run tests when the page loads
document.addEventListener('DOMContentLoaded', () => {
    testFirebaseConnection();
});