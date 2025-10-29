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
            if (!window.FIREBASE_CONFIG) return false;
            if (window.firebase && window.firebase.apps && window.firebase.apps.length) {
                if (!this._firebaseDb) this._firebaseDb = window.firebase.firestore();
                return true;
            }

            // Firebase SDK is now loaded via HTML script tags

            window.firebase.initializeApp(window.FIREBASE_CONFIG);

            // Try anonymous sign-in if auth is available and no user is signed-in
            try {
                if (window.firebase.auth && !window.firebase.auth().currentUser) {
                    // enable anonymous if the project allows it
                    await window.firebase.auth().signInAnonymously();
                }
            } catch (e) {
                // Non-fatal: auth may be disabled or not allowed; continue without auth
                console.warn('Firebase anonymous sign-in failed or not allowed', e);
            }

            this._firebaseDb = window.firebase.firestore();
            return true;
        } catch (err) {
            console.warn('Firebase init failed', err);
            return false;
        }
    },

    async firebaseGetUserData(userId) {
        if (!await this.ensureFirebase()) return null;
        try {
            const doc = await this._firebaseDb.collection('progress').doc(userId).get();
            if (!doc.exists) return null;
            return doc.data();
        } catch (err) {
            console.warn('firebaseGetUserData error', err);
            return null;
        }
    },

    async firebaseSaveUserData(userId, userData) {
        if (!await this.ensureFirebase()) return false;
        try {
            await this._firebaseDb.collection('progress').doc(userId).set(userData);
            return true;
        } catch (err) {
            console.warn('firebaseSaveUserData error', err);
            return false;
        }
    },

    async syncUserData(userId) {
        if (!userId) return false;
        
        try {
            // Get local data
            const localData = this.getUserDataLocal(userId);
            
            // Get remote data
            const remoteData = await this.firebaseGetUserData(userId);
            
            if (!remoteData) {
                // No remote data exists, push local data to Firebase
                if (localData) {
                    await this.firebaseSaveUserData(userId, localData);
                    this.dispatchSyncEvent('success', 'Progress saved to cloud');
                }
                return true;
            }
            
            // Merge data (prefer remote progress if it's higher)
            const mergedData = this.mergeUserData(localData, remoteData);
            
            // Save merged data both locally and remotely
            this.saveUserDataLocal(userId, mergedData);
            await this.firebaseSaveUserData(userId, mergedData);
            
            this.dispatchSyncEvent('success', 'Progress synced successfully');
            return true;
        } catch (err) {
            console.error('Sync failed:', err);
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

    // Note: firebaseSaveUserData is defined earlier and writes to the 'progress' collection.
    // Duplicate definitions were removed to keep a single source of truth for Firestore writes.

    getUserDataLocal(username) { const data = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + username); if (data) return JSON.parse(data); try { if (typeof AuthService !== 'undefined' && AuthService.STORAGE_KEYS && AuthService.STORAGE_KEYS.USER_PROGRESS) { const legacyKey = AuthService.STORAGE_KEYS.USER_PROGRESS + username; const legacy = localStorage.getItem(legacyKey); if (legacy) { let legacyObj = null; try { legacyObj = JSON.parse(legacy); } catch (e) { legacyObj = null; } const migrated = this.initializeUserData(username); if (legacyObj) { const discovered = Array.isArray(legacyObj.discoveredElements) ? legacyObj.discoveredElements : []; migrated.discoveries = discovered.map(sym => ({ id: String(sym), symbol: String(sym), name: String(sym), completed: true, dateDiscovered: new Date().toISOString() })); migrated.progress = { ...migrated.progress, totalDiscoveries: migrated.discoveries.length, completedDiscoveries: migrated.discoveries.length, progressPercentage: (migrated.discoveries.length / 118) * 100, milestones: { beginner: (migrated.discoveries.length / 118) * 100 >= 10, intermediate: (migrated.discoveries.length / 118) * 100 >= 50, advanced: (migrated.discoveries.length / 118) * 100 >= 75, master: (migrated.discoveries.length / 118) * 100 >= 100 } }; localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(migrated)); return migrated; } } } } catch (e) { console.warn('Migration check failed', e); } return null; },

    migrateLegacy(username) { const result = { username, foundLegacy: false, legacyKey: null, legacyRaw: null, migrated: false, migratedCount: 0 }; try { if (typeof AuthService !== 'undefined' && AuthService.STORAGE_KEYS && AuthService.STORAGE_KEYS.USER_PROGRESS) { const legacyKey = AuthService.STORAGE_KEYS.USER_PROGRESS + username; result.legacyKey = legacyKey; const legacy = localStorage.getItem(legacyKey); if (legacy) { result.foundLegacy = true; result.legacyRaw = legacy; let legacyObj = null; try { legacyObj = JSON.parse(legacy); } catch (e) { legacyObj = null; } const migrated = this.initializeUserData(username); if (legacyObj) { const discovered = Array.isArray(legacyObj.discoveredElements) ? legacyObj.discoveredElements : []; migrated.discoveries = discovered.map(sym => ({ id: String(sym), symbol: String(sym), name: String(sym), completed: true, dateDiscovered: new Date().toISOString() })); migrated.progress = { ...migrated.progress, totalDiscoveries: migrated.discoveries.length, completedDiscoveries: migrated.discoveries.length, progressPercentage: (migrated.discoveries.length / 118) * 100, milestones: { beginner: (migrated.discoveries.length / 118) * 100 >= 10, intermediate: (migrated.discoveries.length / 118) * 100 >= 50, advanced: (migrated.discoveries.length / 118) * 100 >= 75, master: (migrated.discoveries.length / 118) * 100 >= 100 } }; localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(migrated)); result.migrated = true; result.migratedCount = migrated.discoveries.length; } } } else { result.error = 'AuthService or its STORAGE_KEYS.USER_PROGRESS not available'; } } catch (err) { result.error = String(err); } return result; },

    async saveUserData(username, data) { localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(data)); try { const fbReady = await this.ensureFirebase(); if (fbReady) { const ok = await this.firebaseSaveUserData(username, data); if (ok) { window.dispatchEvent(new CustomEvent('progressSync', { detail: { type: 'success', message: 'Synced with Firebase' } })); return; } } } catch (e) { console.warn('Firebase sync error', e); } try { await this.syncWithDatabase(username, data); window.dispatchEvent(new CustomEvent('progressSync', { detail: { type: 'success', message: 'Synced with repository' } })); } catch (e) { console.warn('Repository sync failed', e); window.dispatchEvent(new CustomEvent('progressSync', { detail: { type: 'error', message: 'Sync failed' } })); } },

    async syncWithDatabase(username, userData) { const { owner, repo, branch, dbPath, API_BASE } = this.REPO_CONFIG; const apiUrl = `${API_BASE}/${owner}/${repo}/contents/${dbPath}`; try { const response = await fetch(apiUrl); if (!response.ok) throw new Error('Failed to fetch database'); const fileData = await response.json(); let dbContent = JSON.parse(this.base64Decode(fileData.content)); const lastUpdate = new Date(dbContent.lastUpdate); const lastLocalSync = localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC + username); if (lastLocalSync && new Date(lastLocalSync) < lastUpdate) { const remoteUserData = dbContent.users[username] || {}; userData = this.mergeProgress(remoteUserData, userData); localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(userData)); } dbContent.users[username] = userData; dbContent.lastUpdate = new Date().toISOString(); const content = this.base64Encode(JSON.stringify(dbContent, null, 2)); const updatePayload = { message: `Update progress for user ${username}`, content, sha: fileData.sha, branch }; const updateResponse = await fetch(apiUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatePayload) }); if (!updateResponse.ok) throw new Error('Failed to update database'); localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC + username, new Date().toISOString()); return true; } catch (error) { console.error('Sync error:', error); throw error; } },

    mergeProgress(remote, local) { if (!remote) return local; if (!local) return remote; const mergedDiscoveries = [...local.discoveries]; remote.discoveries.forEach(remoteDiscovery => { const existingIndex = mergedDiscoveries.findIndex(d => d.id === remoteDiscovery.id); if (existingIndex === -1) mergedDiscoveries.push(remoteDiscovery); else { const localDate = new Date(mergedDiscoveries[existingIndex].dateDiscovered || 0); const remoteDate = new Date(remoteDiscovery.dateDiscovered || 0); if (remoteDate > localDate) mergedDiscoveries[existingIndex] = remoteDiscovery; } }); return { ...local, discoveries: mergedDiscoveries, progress: { ...local.progress, totalDiscoveries: mergedDiscoveries.length, completedDiscoveries: mergedDiscoveries.filter(d => d.completed).length } }; },

    async getUserData(username) { let data = null; const localData = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + username); if (localData) data = JSON.parse(localData); try { const fbReady = await this.ensureFirebase(); if (fbReady) { const fbData = await this.firebaseGetUserData(username); if (fbData) { data = data ? this.mergeProgress(fbData, data) : fbData; localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(data)); localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC + username, new Date().toISOString()); return data; } } const { owner, repo, dbPath, API_BASE } = this.REPO_CONFIG; const apiUrl = `${API_BASE}/${owner}/${repo}/contents/${dbPath}`; const response = await fetch(apiUrl); if (response.ok) { const fileData = await response.json(); const dbContent = JSON.parse(this.base64Decode(fileData.content)); if (dbContent.users && dbContent.users[username]) { const remoteData = dbContent.users[username]; data = data ? this.mergeProgress(remoteData, data) : remoteData; localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(data)); localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC + username, dbContent.lastUpdate); } } } catch (err) { console.warn('getUserData fallback to local due to error', err); } return data || this.initializeUserData(username); },

    saveUserDataLocal(username, data) { localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(data)); },

    addDiscovery(username, discovery) { const local = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + username); const userData = local ? JSON.parse(local) : this.initializeUserData(username); const existingIndex = userData.discoveries.findIndex(d => d.id === discovery.id); if (existingIndex === -1) userData.discoveries.push({ ...discovery, dateDiscovered: new Date().toISOString() }); else userData.discoveries[existingIndex] = { ...userData.discoveries[existingIndex], ...discovery, dateModified: new Date().toISOString() }; this.updateProgress(username, userData); this.saveUserData(username, userData); return userData; },

    updateProgress(username, userData = null) { if (!userData) { const local = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + username); userData = local ? JSON.parse(local) : null; } if (!userData) return null; const totalPossibleDiscoveries = 118; const completedDiscoveries = userData.discoveries.filter(d => d.completed).length; const progressPercentage = (completedDiscoveries / totalPossibleDiscoveries) * 100; userData.progress = { ...userData.progress, totalDiscoveries: userData.discoveries.length, completedDiscoveries, progressPercentage, milestones: { beginner: progressPercentage >= 10, intermediate: progressPercentage >= 50, advanced: progressPercentage >= 75, master: progressPercentage >= 100 } }; this.saveUserData(username, userData); this.emitProgressUpdate(userData.progress); return userData.progress; },

    getDiscoveries(username) { const local = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + username); const userData = local ? JSON.parse(local) : null; return userData ? userData.discoveries : []; },

    getProgress(username) { const local = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + username); const userData = local ? JSON.parse(local) : null; return userData ? userData.progress : null; },

    emitProgressUpdate(progress) { document.dispatchEvent(new CustomEvent('progressUpdate', { detail: progress })); }
};

window.DiscoveryService = DiscoveryService;