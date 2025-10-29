// Authentication service using Firebase Auth (email/password) with optional username mapping
// Replaces legacy localStorage-based auth. Preserves some helper keys for migration.

const AuthService = {
    STORAGE_KEYS: {
        USERS: 'chemulab_users', // legacy
        CURRENT_USER: 'chemulab_current_user', // legacy
        USER_PROGRESS: 'chemulab_progress_' // legacy per-username progress key
    },

    // Initialize: hook auth state changes. Waits for firebaseReady if Firebase isn't available yet.
    init() {
        // If firebase is not ready yet, attach a one-time listener to initialize when ready
        if (!window.firebase || !firebase.auth) {
            if (!this._waitingForFirebase) {
                this._waitingForFirebase = true;
                window.addEventListener('firebaseReady', () => {
                    this._waitingForFirebase = false;
                    this.init();
                }, { once: true });
            }
            return;
        }

        // Attach auth state listener only once
        if (this._authListenerAttached) return;
        this._authListenerAttached = true;

        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                // store a minimal current user snapshot for legacy code
                const snapshot = { uid: user.uid, email: user.email || null, isAnonymous: !!user.isAnonymous };
                localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(snapshot));

                // attempt to load profile (username) from Firestore users collection
                try {
                    const doc = await firebase.firestore().collection('users').doc(user.uid).get();
                    if (doc.exists) {
                        const profile = doc.data();
                        snapshot.username = profile.username || snapshot.email || user.uid;
                        localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(snapshot));
                    }
                } catch (e) {
                    // ignore
                }
            } else {
                localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
            }
        });
    },

    // Register a new user with username + email + password
    // If there's an anonymous user signed in, this will link the anonymous account and preserve uid/data
    async register(username, email, password) {
        if (!window.firebase || !firebase.auth) throw new Error('Firebase not initialized');

        console.info('AuthService.register called', { username, email });

        let uid = null;
        let createdNewAuthUser = false;

        const current = firebase.auth().currentUser;
        try {
            if (current && current.isAnonymous) {
                console.info('Linking anonymous user to email credential', { anonUid: current.uid });
                // link anonymous to email credential
                const credential = firebase.auth.EmailAuthProvider.credential(email, password);
                const result = await current.linkWithCredential(credential);
                uid = result.user.uid;
                console.info('Link successful', { uid });
            } else {
                console.info('Creating new user with email/password');
                const userCred = await firebase.auth().createUserWithEmailAndPassword(email, password);
                uid = userCred.user.uid;
                createdNewAuthUser = true;
                console.info('createUserWithEmailAndPassword succeeded', { uid });
            }
        } catch (err) {
            // bubble up (e.g., email already in use, weak-password)
            throw err;
        }

        // Reserve username in a transaction to avoid duplicates
        const usernameRef = firebase.firestore().collection('usernames').doc(username);
        // Reserve username in a transaction to avoid duplicates
        try {
            console.info('Reserving username in Firestore', { username, uid });
            await firebase.firestore().runTransaction(async (tx) => {
                const snap = await tx.get(usernameRef);
                if (snap.exists) throw new Error('Username already taken');
                tx.set(usernameRef, { uid, email, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
            });
            console.info('Username reserved successfully', { username, uid });
        } catch (err) {
            console.error('Username reservation failed for', username, err);
            // NOTE: not rolling back created auth users. Leaving the auth user in place so you can inspect
            // the Authentication console and diagnose Firestore permission or transaction issues.
            throw err;
        }

        // Store basic profile
        try {
            console.info('Writing user profile document for', uid);
            await firebase.firestore().collection('users').doc(uid).set({ username, email, createdAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
            console.info('User profile written for', uid);
        } catch (profileErr) {
            console.error('Failed to write user profile for', uid, profileErr);
            // NOTE: not rolling back created auth users. Leaving the auth user in place so you can inspect
            // the Authentication console and diagnose Firestore permission or write issues.
            throw profileErr;
        }

        // Migrate legacy local progress keyed by username (if present)
        try {
            const legacyKey = this.STORAGE_KEYS.USER_PROGRESS + username;
            const legacy = localStorage.getItem(legacyKey);
            if (legacy) {
                const parsed = JSON.parse(legacy);
                if (window.DiscoveryService && DiscoveryService.saveUserData) {
                    await DiscoveryService.saveUserData(uid, parsed);
                }
                // remove legacy key after successful migration
                localStorage.removeItem(legacyKey);
            }
        } catch (e) {
            console.warn('Migration of legacy progress failed', e);
        }

        return firebase.auth().currentUser;
    },

    // Sign in using username or email and password
    async login(identifier, password) {
        if (!window.firebase || !firebase.auth) throw new Error('Firebase not initialized');

        let email = identifier;
        // If identifier doesn't look like an email, treat as username and resolve to email via usernames collection
        if (!identifier.includes('@')) {
            const snap = await firebase.firestore().collection('usernames').doc(identifier).get();
            if (!snap.exists) throw new Error('Username does not exist');
            const data = snap.data();
            if (!data.email) throw new Error('No email mapped for username');
            email = data.email;
        }

        const userCred = await firebase.auth().signInWithEmailAndPassword(email, password);

        // After successful sign-in, attempt to migrate any legacy local progress keyed by username (if identifier was username)
        try {
            if (!identifier.includes('@')) {
                const legacyKey = this.STORAGE_KEYS.USER_PROGRESS + identifier;
                const legacy = localStorage.getItem(legacyKey);
                if (legacy) {
                    const parsed = JSON.parse(legacy);
                    if (window.DiscoveryService && DiscoveryService.saveUserData) {
                        await DiscoveryService.saveUserData(userCred.user.uid, parsed);
                    }
                    localStorage.removeItem(legacyKey);
                }
            }
        } catch (e) {
            console.warn('Migration after login failed', e);
        }

        return userCred.user;
    },

    // Sign out
    async logout() {
        if (window.firebase && firebase.auth) {
            await firebase.auth().signOut();
        }
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    },

    // Return a compact current user object (or null)
    getCurrentUser() {
        try {
            if (window.firebase && firebase.auth && firebase.auth().currentUser) {
                const u = firebase.auth().currentUser;
                return { uid: u.uid, email: u.email || null, isAnonymous: !!u.isAnonymous };
            }
        } catch (e) {}
        const raw = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
        return raw ? JSON.parse(raw) : null;
    },

    // Backwards-compatible helper used by older pages: returns true when a user is signed in
    isLoggedIn() {
        try {
            if (window.firebase && firebase.auth && firebase.auth().currentUser) {
                return !!firebase.auth().currentUser;
            }
        } catch (e) {
            // fall through to legacy check
        }
        const raw = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
        return !!raw;
    },

    // Legacy helpers (kept for compatibility, but registration/login now use Firebase)
    getAllUsers() { const raw = localStorage.getItem(this.STORAGE_KEYS.USERS); return raw ? JSON.parse(raw) : []; },
    initializeUserProgress(username) { const key = this.STORAGE_KEYS.USER_PROGRESS + username; if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ discoveredElements: [], completedCombinations: [] })); },
    getUserProgress(username) { const key = this.STORAGE_KEYS.USER_PROGRESS + username; const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; },
    updateUserProgress(username, progress) { const key = this.STORAGE_KEYS.USER_PROGRESS + username; localStorage.setItem(key, JSON.stringify(progress)); }
};

// Initialize auth listener
AuthService.init();