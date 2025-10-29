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
    const currentUser = firebase.auth().currentUser;
    console.log('Current user:', currentUser ? {
        uid: currentUser.uid,
        isAnonymous: currentUser.isAnonymous
    } : 'No user');

    // Test Firestore access with proper user-scoped collection
    try {
        if (!currentUser) {
            throw new Error('No authenticated user available');
        }
        
        const testDoc = await firebase.firestore()
            .collection('progress')
            .doc(currentUser.uid)
            .set({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                testId: 'connection-test',
                progress: {
                    totalDiscoveries: 0,
                    completedDiscoveries: 0,
                    progressPercentage: 0,
                    milestones: {
                        beginner: false,
                        intermediate: false,
                        advanced: false,
                        master: false
                    }
                }
            });
        console.log('Firestore write successful to progress collection');
        
        // Also test discoveries collection
        await firebase.firestore()
            .collection('discoveries')
            .doc(currentUser.uid)
            .set({
                discoveries: [],
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        console.log('Firestore write successful to discoveries collection');
    } catch (error) {
        console.error('Firestore write failed:', error);
        if (!currentUser) {
            console.log('Error: No authenticated user. Make sure Anonymous Authentication is enabled in Firebase Console');
        } else {
            console.log('Check your Firestore security rules and make sure they allow write access to the correct collections');
        }
    }
}

// Run tests when the page loads
document.addEventListener('DOMContentLoaded', () => {
    testFirebaseConnection();
});