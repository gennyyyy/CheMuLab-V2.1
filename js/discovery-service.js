// Discovery and Progress Management Service

const DiscoveryService = {
    STORAGE_KEYS: { USER_DATA: 'chemulab_user_data_', LAST_SYNC: 'chemulab_last_sync_' },

    REPO_CONFIG: { owner: 'your-github-username', repo: 'CheMuLab', branch: 'main', dbPath: 'db.json', API_BASE: 'https://api.github.com/repos' },

    base64Encode(str) { return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) { return String.fromCharCode('0x' + p1); })); },
    base64Decode(str) { return decodeURIComponent(atob(str).split('').map(function(c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); }).join('')); },

    initializeUserData(username) { const userData = { credentials: { username, lastLogin: new Date().toISOString() }, progress: { totalDiscoveries: 0, completedDiscoveries: 0, progressPercentage: 0, milestones: { beginner: false, intermediate: false, advanced: false, master: false } }, discoveries: [] }; this.saveUserDataLocal(username, userData); return userData; },

    _loadScript(src) { return new Promise((resolve, reject) => { const s = document.createElement('script'); s.src = src; s.onload = () => resolve(); s.onerror = (e) => reject(e); document.head.appendChild(s); }); },

    async ensureFirebase() {
        try {
            console.log('Checking Firebase initialization status...');
            if (!window.FIREBASE_CONFIG) {
                console.error('Firebase config not found in window.FIREBASE_CONFIG');
                return false;
            }
            
            // Wait for Firebase to be fully initialized
            if (!window.firebase || !window.firebase.apps || !window.firebase.apps.length) {
                console.log('Waiting for Firebase initialization...');
                await new Promise((resolve) => {
                    const maxWait = setTimeout(() => resolve(false), 5000); // 5 second timeout
                    window.addEventListener('firebaseReady', () => {
                        clearTimeout(maxWait);
                        resolve(true);
                    }, { once: true });
                });
            }
            
            if (!window.firebase || !window.firebase.apps || !window.firebase.apps.length) {
                console.error('Firebase failed to initialize in time');
                return false;
            }

            // Ensure we have an authenticated user (even if anonymous)
            if (window.firebase.auth && !window.firebase.auth().currentUser) {
                console.log('Waiting for auth state...');
                await new Promise((resolve) => {
                    const unsubscribe = window.firebase.auth().onAuthStateChanged((user) => {
                        unsubscribe();
                        if (user) {
                            console.log('User authenticated:', user.uid, user.isAnonymous ? '(anonymous)' : '');
                        }
                        resolve(true);
                    });
                });
            }

            // Initialize Firestore if needed
            if (!this._firebaseDb) {
                console.log('Setting up Firestore instance...');
                this._firebaseDb = window.firebase.firestore();
            }

            return true;
        } catch (err) {
            console.warn('Firebase init failed', err);
            return false;
        }
    },

    async firebaseGetUserData(userId) {
        console.log('Fetching user data from Firebase for:', userId);
        if (!userId) {
            console.error('Cannot fetch data - no userId provided');
            return null;
        }

        if (!await this.ensureFirebase()) {
            console.warn('Firebase not ready, cannot fetch user data');
            return null;
        }

        try {
            console.log('Firebase ready, fetching document...');
            const doc = await this._firebaseDb.collection('progress').doc(userId).get();
            
            if (!doc.exists) {
                console.log('No data found in Firebase for user:', userId);
                return null;
            }

            const data = doc.data();
            console.log('Successfully retrieved data from Firebase:', {
                userId,
                discoveryCount: data.discoveries ? data.discoveries.length : 0,
                hasProgress: !!data.progress
            });
            return data;
        } catch (err) {
            console.error('firebaseGetUserData error:', err);
            console.error('Error details:', { code: err.code, message: err.message });
            return null;
        }
    },

    async firebaseSaveUserData(userId, userData) {
        console.log('Attempting to save user data to Firebase:', { userId, userData });
        
        // Validate inputs
        if (!userId) {
            console.error('Cannot save to Firebase - no userId provided');
            return false;
        }
        if (!userData) {
            console.error('Cannot save to Firebase - no userData provided');
            return false;
        }

        // Ensure Firebase is ready
        if (!await this.ensureFirebase()) {
            console.warn('Firebase not initialized, cannot save user data');
            return false;
        }

        try {
            // Ensure we have a current user
            const currentUser = window.firebase.auth().currentUser;
            if (!currentUser) {
                console.warn('No authenticated user found when trying to save');
                return false;
            }

            // Ensure the data is associated with the current user
            const dataToSave = {
                ...userData,
                _lastModified: new Date().toISOString(),
                _userId: currentUser.uid,
                _isAnonymous: currentUser.isAnonymous,
            };

            console.log('Firebase initialized, attempting to save data...', {
                userId: currentUser.uid,
                isAnonymous: currentUser.isAnonymous
            });
            
            await this._firebaseDb.collection('progress').doc(userId).set(dataToSave);
            console.log('Successfully saved user data to Firebase');
            return true;
        } catch (err) {
            console.error('firebaseSaveUserData error:', err);
            console.error('Error details:', { code: err.code, message: err.message });
            return false;
        }
    },

    async syncUserData(userId) {
        console.log('Starting sync for user:', userId);
        if (!userId) {
            console.error('Cannot sync - no userId provided');
            return false;
        }
        
        try {
            // Get local data
            console.log('Fetching local data...');
            const localData = this.getUserDataLocal(userId);
            if (localData) {
                console.log('Found local data with', localData.discoveries?.length || 0, 'discoveries');
            }
            
            // Get remote data
            console.log('Fetching remote data...');
            const remoteData = await this.firebaseGetUserData(userId);
            if (remoteData) {
                console.log('Found remote data with', remoteData.discoveries?.length || 0, 'discoveries');
            }
            
            if (!remoteData) {
                console.log('No remote data found');
                // No remote data exists, push local data to Firebase if we have it
                if (localData) {
                    console.log('Pushing local data to Firebase...');
                    await this.firebaseSaveUserData(userId, localData);
                    this.dispatchSyncEvent('success', 'Progress saved to cloud');
                    console.log('Local data successfully pushed to Firebase');
                }
                return true;
            }
            
            // Merge data (prefer remote progress if it's higher)
            console.log('Merging local and remote data...');
            const mergedData = this.mergeUserData(localData, remoteData);
            console.log('Merged data has', mergedData.discoveries?.length || 0, 'discoveries');
            
            // Save merged data both locally and remotely
            console.log('Saving merged data locally...');
            this.saveUserDataLocal(userId, mergedData);
            
            console.log('Saving merged data to Firebase...');
            await this.firebaseSaveUserData(userId, mergedData);
            
            this.dispatchSyncEvent('success', 'Progress synced successfully');
            console.log('Sync completed successfully');
            return true;
        } catch (err) {
            console.error('Sync failed:', err);
            console.error('Error details:', { code: err.code, message: err.message });
            this.dispatchSyncEvent('error', 'Sync failed. Will try again later');
            return false;
        }
    },

    mergeUserData(local, remote) {
        if (!local) return remote;
        if (!remote) return local;
        
        return {
            ...local,
            progress: {
                ...local.progress,
                totalDiscoveries: Math.max(local.progress.totalDiscoveries, remote.progress.totalDiscoveries),
                completedDiscoveries: Math.max(local.progress.completedDiscoveries, remote.progress.completedDiscoveries),
                progressPercentage: Math.max(local.progress.progressPercentage, remote.progress.progressPercentage),
                milestones: {
                    beginner: local.progress.milestones.beginner || remote.progress.milestones.beginner,
                    intermediate: local.progress.milestones.intermediate || remote.progress.milestones.intermediate,
                    advanced: local.progress.milestones.advanced || remote.progress.milestones.advanced,
                    master: local.progress.milestones.master || remote.progress.milestones.master
                }
            },
            discoveries: [...new Set([...local.discoveries, ...remote.discoveries])]
        };
    },

    dispatchSyncEvent(type, message) {
        window.dispatchEvent(new CustomEvent('progressSync', {
            detail: { type, message }
        }));
    },

    // Resolve the effective storage/user id to use for Firestore and localStorage.
    // If a Firebase user is signed in, prefer the Firebase UID; otherwise use the provided username.
    resolveUserId(username) {
        console.log('Resolving user ID for username:', username);
        try {
            if (!username) {
                console.warn('No username provided to resolveUserId');
                return null;
            }

            if (window.firebase && window.firebase.auth) {
                const currentUser = window.firebase.auth().currentUser;
                if (currentUser) {
                    console.log('Using Firebase UID:', currentUser.uid);
                    return currentUser.uid;
                } else {
                    console.log('No Firebase user signed in, falling back to username');
                }
            } else {
                console.log('Firebase auth not available, falling back to username');
            }
        } catch (e) {
            console.warn('Error in resolveUserId:', e);
        }
        console.log('Using username as ID:', username);
        return username;
    },

    // Note: firebaseSaveUserData is defined earlier and writes to the 'progress' collection.
    // Duplicate definitions were removed to keep a single source of truth for Firestore writes.

    getUserDataLocal(username) { const data = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + username); if (data) return JSON.parse(data); try { if (typeof AuthService !== 'undefined' && AuthService.STORAGE_KEYS && AuthService.STORAGE_KEYS.USER_PROGRESS) { const legacyKey = AuthService.STORAGE_KEYS.USER_PROGRESS + username; const legacy = localStorage.getItem(legacyKey); if (legacy) { let legacyObj = null; try { legacyObj = JSON.parse(legacy); } catch (e) { legacyObj = null; } const migrated = this.initializeUserData(username); if (legacyObj) { const discovered = Array.isArray(legacyObj.discoveredElements) ? legacyObj.discoveredElements : []; migrated.discoveries = discovered.map(sym => ({ id: String(sym), symbol: String(sym), name: String(sym), completed: true, dateDiscovered: new Date().toISOString() })); migrated.progress = { ...migrated.progress, totalDiscoveries: migrated.discoveries.length, completedDiscoveries: migrated.discoveries.length, progressPercentage: (migrated.discoveries.length / 118) * 100, milestones: { beginner: (migrated.discoveries.length / 118) * 100 >= 10, intermediate: (migrated.discoveries.length / 118) * 100 >= 50, advanced: (migrated.discoveries.length / 118) * 100 >= 75, master: (migrated.discoveries.length / 118) * 100 >= 100 } }; localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(migrated)); return migrated; } } } } catch (e) { console.warn('Migration check failed', e); } return null; },

    migrateLegacy(username) { const result = { username, foundLegacy: false, legacyKey: null, legacyRaw: null, migrated: false, migratedCount: 0 }; try { if (typeof AuthService !== 'undefined' && AuthService.STORAGE_KEYS && AuthService.STORAGE_KEYS.USER_PROGRESS) { const legacyKey = AuthService.STORAGE_KEYS.USER_PROGRESS + username; result.legacyKey = legacyKey; const legacy = localStorage.getItem(legacyKey); if (legacy) { result.foundLegacy = true; result.legacyRaw = legacy; let legacyObj = null; try { legacyObj = JSON.parse(legacy); } catch (e) { legacyObj = null; } const migrated = this.initializeUserData(username); if (legacyObj) { const discovered = Array.isArray(legacyObj.discoveredElements) ? legacyObj.discoveredElements : []; migrated.discoveries = discovered.map(sym => ({ id: String(sym), symbol: String(sym), name: String(sym), completed: true, dateDiscovered: new Date().toISOString() })); migrated.progress = { ...migrated.progress, totalDiscoveries: migrated.discoveries.length, completedDiscoveries: migrated.discoveries.length, progressPercentage: (migrated.discoveries.length / 118) * 100, milestones: { beginner: (migrated.discoveries.length / 118) * 100 >= 10, intermediate: (migrated.discoveries.length / 118) * 100 >= 50, advanced: (migrated.discoveries.length / 118) * 100 >= 75, master: (migrated.discoveries.length / 118) * 100 >= 100 } }; localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(migrated)); result.migrated = true; result.migratedCount = migrated.discoveries.length; } } } else { result.error = 'AuthService or its STORAGE_KEYS.USER_PROGRESS not available'; } } catch (err) { result.error = String(err); } return result; },

    async saveUserData(username, data) {
        console.log('saveUserData called for username:', username);
        // Use resolved id (firebase uid when available) for storage and remote writes
        const id = this.resolveUserId(username);
        console.log('Resolved user ID:', id);
        
        // Save to local storage with timestamp
        const dataWithTimestamp = {
            ...data,
            lastSaved: new Date().toISOString(),
            version: (data.version || 0) + 1
        };
        
        // Keep a backup of the previous version
        const previousData = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + id);
        if (previousData) {
            localStorage.setItem(this.STORAGE_KEYS.USER_DATA + id + '_backup', previousData);
        }
        
        // Save current version
        localStorage.setItem(this.STORAGE_KEYS.USER_DATA + id, JSON.stringify(dataWithTimestamp));
        console.log('Saved to local storage with timestamp');
        
        try {
            console.log('Checking Firebase readiness...');
            const fbReady = await this.ensureFirebase();
            console.log('Firebase ready:', fbReady);
            
            if (fbReady) {
                console.log('Attempting to save to Firebase...');
                const ok = await this.firebaseSaveUserData(id, data);
                console.log('Firebase save result:', ok);
                
                if (ok) {
                    window.dispatchEvent(new CustomEvent('progressSync', { detail: { type: 'success', message: 'Synced with Firebase' } }));
                    console.log('Firebase sync event dispatched');
                    return;
                }
            }
        } catch (e) {
            console.warn('Firebase sync error', e);
        }
        try {
            await this.syncWithDatabase(id, data);
            window.dispatchEvent(new CustomEvent('progressSync', { detail: { type: 'success', message: 'Synced with repository' } }));
        } catch (e) {
            console.warn('Repository sync failed', e);
            window.dispatchEvent(new CustomEvent('progressSync', { detail: { type: 'error', message: 'Sync failed' } }));
        }
    },

    async syncWithDatabase(username, userData) { const { owner, repo, branch, dbPath, API_BASE } = this.REPO_CONFIG; const apiUrl = `${API_BASE}/${owner}/${repo}/contents/${dbPath}`; try { const response = await fetch(apiUrl); if (!response.ok) throw new Error('Failed to fetch database'); const fileData = await response.json(); let dbContent = JSON.parse(this.base64Decode(fileData.content)); const lastUpdate = new Date(dbContent.lastUpdate); const lastLocalSync = localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC + username); if (lastLocalSync && new Date(lastLocalSync) < lastUpdate) { const remoteUserData = dbContent.users[username] || {}; userData = this.mergeProgress(remoteUserData, userData); localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(userData)); } dbContent.users[username] = userData; dbContent.lastUpdate = new Date().toISOString(); const content = this.base64Encode(JSON.stringify(dbContent, null, 2)); const updatePayload = { message: `Update progress for user ${username}`, content, sha: fileData.sha, branch }; const updateResponse = await fetch(apiUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatePayload) }); if (!updateResponse.ok) throw new Error('Failed to update database'); localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC + username, new Date().toISOString()); return true; } catch (error) { console.error('Sync error:', error); throw error; } },

    mergeProgress(remote, local) { if (!remote) return local; if (!local) return remote; const mergedDiscoveries = [...local.discoveries]; remote.discoveries.forEach(remoteDiscovery => { const existingIndex = mergedDiscoveries.findIndex(d => d.id === remoteDiscovery.id); if (existingIndex === -1) mergedDiscoveries.push(remoteDiscovery); else { const localDate = new Date(mergedDiscoveries[existingIndex].dateDiscovered || 0); const remoteDate = new Date(remoteDiscovery.dateDiscovered || 0); if (remoteDate > localDate) mergedDiscoveries[existingIndex] = remoteDiscovery; } }); return { ...local, discoveries: mergedDiscoveries, progress: { ...local.progress, totalDiscoveries: mergedDiscoveries.length, completedDiscoveries: mergedDiscoveries.filter(d => d.completed).length } }; },

    async getUserData(username) {
        // Resolve to the effective id (firebase uid when available)
        const id = this.resolveUserId(username);
        let data = null;

        // If local data exists under the resolved id, use it
        const localData = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + id);
        if (localData) data = JSON.parse(localData);

        try {
            const fbReady = await this.ensureFirebase();
            if (fbReady) {
                const fbData = await this.firebaseGetUserData(id);
                if (fbData) {
                    data = data ? this.mergeProgress(fbData, data) : fbData;
                    localStorage.setItem(this.STORAGE_KEYS.USER_DATA + id, JSON.stringify(data));
                    localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC + id, new Date().toISOString());
                    return data;
                }
            }

            // Fallback to repository (GitHub) using username mapping if needed
            const { owner, repo, dbPath, API_BASE } = this.REPO_CONFIG;
            const apiUrl = `${API_BASE}/${owner}/${repo}/contents/${dbPath}`;
            const response = await fetch(apiUrl);
            if (response.ok) {
                const fileData = await response.json();
                const dbContent = JSON.parse(this.base64Decode(fileData.content));
                // try both id and username keys
                const remoteData = (dbContent.users && (dbContent.users[id] || dbContent.users[username])) || null;
                if (remoteData) {
                    data = data ? this.mergeProgress(remoteData, data) : remoteData;
                    localStorage.setItem(this.STORAGE_KEYS.USER_DATA + id, JSON.stringify(data));
                    localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC + id, dbContent.lastUpdate);
                }
            }
        } catch (err) {
            console.warn('getUserData fallback to local due to error', err);
        }
        return data || this.initializeUserData(id);
    },

    saveUserDataLocal(username, data) { const id = this.resolveUserId(username); localStorage.setItem(this.STORAGE_KEYS.USER_DATA + id, JSON.stringify(data)); },

    addDiscovery(username, discovery) {
        console.log('Adding discovery for user:', username);
        const id = this.resolveUserId(username);
        if (!id) {
            console.error('Cannot add discovery - invalid user ID');
            return null;
        }

        // Get current user data
        const local = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + id);
        const userData = local ? JSON.parse(local) : this.initializeUserData(id);

        // Validate and normalize discovery data
        if (!discovery || !discovery.id) {
            console.error('Invalid discovery data:', discovery);
            return null;
        }

        // Ensure discoveries array exists
        if (!Array.isArray(userData.discoveries)) {
            userData.discoveries = [];
        }

        // Find or update the discovery - check by both ID and symbol
        const existingIndex = userData.discoveries.findIndex(d => 
            d.id === discovery.id || d.symbol === discovery.symbol
        );
        const now = new Date().toISOString();

        if (existingIndex === -1) {
            // New discovery
            userData.discoveries.push({
                ...discovery,
                dateDiscovered: now,
                lastUpdated: now,
                completed: true
            });
        } else {
            // Update existing discovery
            userData.discoveries[existingIndex] = {
                ...userData.discoveries[existingIndex],
                ...discovery,
                lastUpdated: now,
                completed: true
            };
        }

        console.log('Discovery added/updated:', discovery.id);
        
        // Update progress and save
        this.updateProgress(id, userData);
        this.saveUserData(id, userData);
        return userData;
    },

    updateProgress(username, userData = null) {
        console.log('Updating progress for user:', username);
        const id = this.resolveUserId(username);
        if (!id) {
            console.warn('Cannot update progress - invalid user ID');
            return null;
        }

        if (!userData) {
            const local = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + id);
            userData = local ? JSON.parse(local) : null;
        }

        if (!userData) {
            console.warn('No user data available for progress update');
            return null;
        }

        const totalPossibleDiscoveries = 118;
        const completedDiscoveries = userData.discoveries.filter(d => d.completed).length;
        const progressPercentage = (completedDiscoveries / totalPossibleDiscoveries) * 100;

        userData.progress = {
            ...userData.progress,
            totalDiscoveries: userData.discoveries.length,
            completedDiscoveries,
            progressPercentage,
            milestones: {
                beginner: progressPercentage >= 10,
                intermediate: progressPercentage >= 50,
                advanced: progressPercentage >= 75,
                master: progressPercentage >= 100
            },
            lastUpdated: new Date().toISOString()
        };

        console.log('Progress updated:', userData.progress);
        this.saveUserData(id, userData);
        this.emitProgressUpdate(userData.progress);
        return userData.progress;
    },

    getDiscoveries(username) {
        const id = this.resolveUserId(username);
        if (!id) return [];
        const local = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + id);
        const userData = local ? JSON.parse(local) : null;
        return userData ? userData.discoveries : [];
    },

    getProgress(username) {
        const id = this.resolveUserId(username);
        if (!id) return null;
        const local = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + id);
        const userData = local ? JSON.parse(local) : null;
        return userData ? userData.progress : null;
    },

    emitProgressUpdate(progress) { document.dispatchEvent(new CustomEvent('progressUpdate', { detail: progress })); }
};

window.DiscoveryService = DiscoveryService;