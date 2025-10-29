// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDWnavAW-AUcieISRo5EyKME82OXNzyhks",
    authDomain: "chemulab-8a992.firebaseapp.com",
    projectId: "chemulab-8a992",
    storageBucket: "chemulab-8a992.appspot.com",
    messagingSenderId: "547646773141",
    appId: "1:547646773141:web:fd602d3887b49fcbef889c"
};

// Make config available globally and initialize Firebase
window.FIREBASE_CONFIG = firebaseConfig;

// Initialize Firebase if available
if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized from config.js');
    } catch (e) {
        // App might have been initialized elsewhere
        if (!firebase.apps.length) {
            console.error('Failed to initialize Firebase:', e);
        }
    }
}