// Authentication service using Firebase Auth (email/password) with optional username mapping
// Replaces legacy localStorage-based auth. Preserves some helper keys for migration.

const AuthService = {
    // In-memory state to avoid persisting login credentials locally.
    _currentSnapshot: null,
    _users: [{ username: 'admin', isAdmin: true, registrationDate: new Date().toISOString() }],
    _registrationInProgress: new Map(), // Track uids currently being registered
    _registrationData: new Map(), // Store registration data (username, email, uid) during registration
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
                // If registration is in progress for this uid, use registration data and skip profile loading
                if (this._registrationInProgress.has(user.uid)) {
                    const regData = this._registrationData.get(user.uid);
                    if (regData) {
                        console.info('AuthService: Using registration data for uid:', user.uid, 'username:', regData.username);
                        this._currentSnapshot = {
                            uid: user.uid,
                            email: regData.email,
                            username: regData.username,
                            isAnonymous: false,
                            isAdmin: false
                        };
                    }
                    console.info('AuthService: Registration in progress for uid:', user.uid, '- skipping profile setup and async work');
                    // CRITICAL: Do NOT call _ensureUsernameForUser or any async work during registration
                    // Just return and let registration complete
                    return;
                }

                // store a minimal current user snapshot in-memory for compatibility with legacy code
                const snapshot = { uid: user.uid, email: user.email || null, isAnonymous: !!user.isAnonymous };
                // attempt to load profile (username) from Firestore users collection
                try {
                    // Add a delay to ensure Firestore profile write from registration is complete
                    // This is critical because the registration process writes profile + username mapping
                    // and we need to wait for both to be visible
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const doc = await firebase.firestore().collection('users').doc(user.uid).get();
                    const profile = doc && doc.exists ? doc.data() : null;
                    // Ensure username is always present — fallback to email or uid when profile missing
                    snapshot.username = (profile && profile.username) ? profile.username : (snapshot.email || user.uid);
                    console.info('AuthService: loaded profile username:', snapshot.username, 'from profile:', profile);

                    // Ensure a usernames -> uid mapping exists for this user. This fixes
                    // cases where accounts were created previously without a usernames doc.
                    // Run asynchronously but do not block sign-in flow.
                    (async () => {
                        try {
                            // If profile provided a username, ensure the mapping exists
                            if (profile && profile.username) {
                                console.info('AuthService: Checking username mapping for:', profile.username);
                                const unameDoc = await firebase.firestore().collection('usernames').doc(profile.username).get();
                                if (!unameDoc.exists) {
                                    console.info('AuthService: Creating missing username mapping for:', profile.username);
                                    await firebase.firestore().collection('usernames').doc(profile.username).set({ uid: user.uid, email: user.email || null, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
                                } else {
                                    console.info('AuthService: Username mapping already exists for:', profile.username);
                                }
                            } else {
                                // No profile username; try to create a safe username derived from email
                                console.warn('AuthService: No username in profile, deriving from email for uid:', user.uid);
                                await AuthService._ensureUsernameForUser(user.uid, user.email);
                            }
                        } catch (e) {
                            console.warn('ensure username mapping failed', e);
                        }
                    })();
                    snapshot.isAdmin = !!(profile && profile.isAdmin);
                } catch (e) {
                    // ignore profile load errors — keep sensible fallback username
                    console.error('AuthService: Error loading profile:', e);
                    snapshot.username = snapshot.email || user.uid;
                }
                // keep snapshot in memory only (do NOT persist credentials locally)
                this._currentSnapshot = snapshot;
            } else {
                // signed out — clear in-memory snapshot
                this._currentSnapshot = null;
            }
        });
    },

    // Check if email already exists in Firebase Authentication
    async checkEmailExists(email) {
        if (!window.firebase || !firebase.auth) throw new Error('Firebase not initialized');

        try {
            // Use Firebase's fetchSignInMethodsForEmail to check if email exists
            const signInMethods = await firebase.auth().fetchSignInMethodsForEmail(email);
            // If signInMethods array has any entries, the email is already registered
            return signInMethods && signInMethods.length > 0;
        } catch (error) {
            console.error('Error checking email:', error);
            // If there's an error, assume email doesn't exist to allow registration attempt
            return false;
        }
    },

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Check if username already exists in Firestore
    async checkUsernameExists(username) {
        if (!window.firebase || !firebase.firestore) throw new Error('Firebase not initialized');

        try {
            const usernameDoc = await firebase.firestore().collection('usernames').doc(username).get();
            return usernameDoc.exists;
        } catch (error) {
            console.error('Error checking username:', error);
            return false;
        }
    },

    // Ensure a username -> uid mapping exists for a user. If the user has no username
    // this will attempt to derive one from the email and reserve a unique value.
    async _ensureUsernameForUser(uid, email, preferredUsername) {
        if (!window.firebase || !firebase.firestore) return null;
        try {
            // First, check if a mapping already exists for this uid
            const existing = await firebase.firestore().collection('usernames').where('uid', '==', uid).limit(1).get();
            if (!existing.empty) {
                const existingUsername = existing.docs[0].id;
                console.info('_ensureUsernameForUser: Username mapping already exists for uid:', uid, '-> username:', existingUsername);

                // IMPORTANT: Ensure the user profile also has this username
                const userProfileDoc = await firebase.firestore().collection('users').doc(uid).get();
                if (!userProfileDoc.exists || !userProfileDoc.data().username) {
                    console.info('_ensureUsernameForUser: Updating profile with existing username mapping:', existingUsername);
                    await firebase.firestore().collection('users').doc(uid).set({
                        username: existingUsername,
                        email: email || null
                    }, { merge: true });
                }

                return existingUsername;
            }

            // Also check if the user profile already has a username
            const userProfileDoc = await firebase.firestore().collection('users').doc(uid).get();
            if (userProfileDoc.exists && userProfileDoc.data().username) {
                const profileUsername = userProfileDoc.data().username;
                console.info('_ensureUsernameForUser: User profile already has username:', profileUsername);
                // Ensure the username mapping exists for this profile username
                const unameDoc = await firebase.firestore().collection('usernames').doc(profileUsername).get();
                if (!unameDoc.exists) {
                    console.info('_ensureUsernameForUser: Creating missing mapping for profile username:', profileUsername);
                    await firebase.firestore().collection('usernames').doc(profileUsername).set({
                        uid: uid,
                        email: email || null,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                return profileUsername;
            }

            // Determine base username to try
            let base = preferredUsername || (email ? email.split('@')[0] : null) || uid.slice(0, 8);
            base = String(base).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20) || uid.slice(0, 8);

            let candidate = base;
            let suffix = 0;
            while (suffix < 200) {
                const docRef = firebase.firestore().collection('usernames').doc(candidate);
                const doc = await docRef.get();
                if (!doc.exists) {
                    // Reserve the username and ensure user's profile contains it
                    console.info('_ensureUsernameForUser: Creating new derived username:', candidate);
                    await docRef.set({ uid: uid, email: email || null, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
                    await firebase.firestore().collection('users').doc(uid).set({ username: candidate, email: email || null }, { merge: true });
                    return candidate;
                }
                suffix++;
                candidate = base + suffix;
            }
            return null;
        } catch (e) {
            console.warn('Failed to ensure username for user', uid, e);
            return null;
        }
    },

    // Register a new user with username + email + password
    // If there's an anonymous user signed in, this will link the anonymous account and preserve uid/data
    async register(username, email, password) {
        if (!window.firebase || !firebase.auth) throw new Error('Firebase not initialized');

        console.info('AuthService.register called', { username, email });

        // Validate email format
        if (!this.validateEmail(email)) {
            throw new Error('Invalid email format');
        }

        // Check if email already exists
        const emailExists = await this.checkEmailExists(email);
        if (emailExists) {
            throw new Error('This email address is already registered. Please use a different email or sign in.');
        }

        // Check if username already exists
        const usernameExists = await this.checkUsernameExists(username);
        if (usernameExists) {
            throw new Error('This username is already taken. Please choose a different username.');
        }

        let uid = null;
        let createdNewAuthUser = false;

        const current = firebase.auth().currentUser;
        try {
            if (current && current.isAnonymous) {
                console.info('Linking anonymous user to email credential', { anonUid: current.uid });
                uid = current.uid;
                // Mark registration as in progress BEFORE linking (which triggers auth listener)
                this._registrationInProgress.set(uid, true);
                this._registrationData.set(uid, { username, email, uid });
                console.info('Marked registration as in progress for uid:', uid);

                // link anonymous to email credential
                const credential = firebase.auth.EmailAuthProvider.credential(email, password);
                const result = await current.linkWithCredential(credential);
                console.info('Link successful', { uid });
            } else {
                console.info('Creating new user with email/password');

                // We don't know the uid yet, so we'll set the flag after creation
                // But we'll do it synchronously by using onAuthStateChanged's immediate callback
                const userCred = await firebase.auth().createUserWithEmailAndPassword(email, password);
                uid = userCred.user.uid;
                createdNewAuthUser = true;

                // Mark registration as in progress AFTER creating user
                // The auth listener may have already fired, but we store the data anyway
                this._registrationInProgress.set(uid, true);
                this._registrationData.set(uid, { username, email, uid });
                console.info('createUserWithEmailAndPassword succeeded', { uid });
                console.info('Marked registration as in progress for uid:', uid);
            }
        } catch (err) {
            // Handle Firebase Auth errors with user-friendly messages
            if (err.code === 'auth/email-already-in-use') {
                throw new Error('This email address is already registered. Please use a different email or sign in.');
            } else if (err.code === 'auth/weak-password') {
                throw new Error('Password is too weak. Please use at least 6 characters.');
            } else if (err.code === 'auth/invalid-email') {
                throw new Error('Invalid email address format.');
            }
            // bubble up other errors
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

        // Store basic profile with explicit username to ensure it's persisted
        try {
            console.info('Writing user profile document for', uid, { username });
            const profileData = {
                username: username,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                registrationDate: firebase.firestore.FieldValue.serverTimestamp()
            };
            console.info('Profile data to write:', profileData);
            await firebase.firestore().collection('users').doc(uid).set(profileData, { merge: true });
            console.info('User profile written for', uid, { username });

            // Verify the write was successful by reading back
            const verifyDoc = await firebase.firestore().collection('users').doc(uid).get();
            if (verifyDoc.exists) {
                console.info('Profile verification successful:', verifyDoc.data());
            }

            // Update the in-memory snapshot immediately to prevent auth listener from deriving a new username
            this._currentSnapshot = {
                uid: uid,
                email: email,
                username: username,
                isAnonymous: false,
                isAdmin: false
            };
            console.info('Updated in-memory snapshot with username:', username);
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
        } finally {
            // Clear the registration in progress flag AFTER a delay to allow Firestore to complete all writes
            // and to prevent the auth listener from interfering with the profile setup
            setTimeout(() => {
                this._registrationInProgress.delete(uid);
                this._registrationData.delete(uid);
                console.info('Cleared registration in progress flag and data for uid:', uid);
            }, 2000);
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
        // Do not remove any persisted credentials because we no longer persist them.
        this._currentSnapshot = null;
    },

    // Return a compact current user object (or null)
    getCurrentUser() {
        try {
            if (window.firebase && firebase.auth && firebase.auth().currentUser) {
                const u = firebase.auth().currentUser;
                // Merge with in-memory snapshot if available so callers can access username/isAdmin
                const snapshot = this._currentSnapshot || {};
                // Provide a sensible username fallback when snapshot.username is not yet populated
                const fallbackUsername = snapshot.username || (u && (u.email || u.uid)) || null;
                return { uid: u.uid, email: u.email || null, isAnonymous: !!u.isAnonymous, username: fallbackUsername, isAdmin: !!snapshot.isAdmin };
            }
        } catch (e) { }
        // Fallback to in-memory snapshot only (do not read persisted credentials)
        return this._currentSnapshot;
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
        return !!this._currentSnapshot;
    },

    // Legacy helpers (kept for compatibility, but registration/login now use Firebase)
    // getAllUsers now returns an in-memory list. This prevents persisting login credentials
    // to localStorage while preserving a built-in admin user.
    getAllUsers() { return Array.isArray(this._users) ? this._users.slice() : []; },
    initializeUserProgress(username) { const key = this.STORAGE_KEYS.USER_PROGRESS + username; if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ discoveredElements: [], completedCombinations: [] })); },
    getUserProgress(username) { const key = this.STORAGE_KEYS.USER_PROGRESS + username; const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; },
    updateUserProgress(username, progress) { const key = this.STORAGE_KEYS.USER_PROGRESS + username; localStorage.setItem(key, JSON.stringify(progress)); },

    // Send password reset email
    async forgotPassword(email) {
        if (!window.firebase || !firebase.auth) throw new Error('Firebase not initialized');
        if (!email) throw new Error('Email is required');
        return firebase.auth().sendPasswordResetEmail(email);
    }
};

// Initialize auth listener
AuthService.init();