// Discovery and Progress Management Service

const DiscoveryService = {
    // Storage Keys
    STORAGE_KEYS: {
        USER_DATA: 'chemulab_user_data_',
        LAST_SYNC: 'chemulab_last_sync_'
    },

    // GitHub Repository API config - REPLACE WITH YOUR REPOSITORY DETAILS
    REPO_CONFIG: {
        owner: 'your-github-username',
        repo: 'CheMuLab',
        branch: 'main',
        dbPath: 'db.json',
        API_BASE: 'https://api.github.com/repos'
    },

    // Base64 encode/decode helpers
    base64Encode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
    },

    base64Decode(str) {
        return decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    },

    // Initialize user data structure
    initializeUserData(username) {
        const userData = {
            credentials: {
                username,
                lastLogin: new Date().toISOString()
            },
            progress: {
                totalDiscoveries: 0,
                completedDiscoveries: 0,
                progressPercentage: 0,
                milestones: {
                    beginner: false,      // 10% discoveries
                    intermediate: false,   // 50% discoveries
                    advanced: false,       // 75% discoveries
                    master: false         // 100% discoveries
                }
            },
            discoveries: []
        };

        this.saveUserData(username, userData);
        return userData;
    },

    // Get user data
    getUserData(username) {
        const data = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + username);
        return data ? JSON.parse(data) : null;
    },

    // Save user data locally and sync with repository
    async saveUserData(username, data) {
        // Always save locally first
        localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(data));
        
        try {
            await this.syncWithDatabase(username, data);
        } catch (err) {
            console.error('Failed to sync with repository:', err);
            // Continue with local save even if sync fails
        }
    },

    // Sync data with repository database
    async syncWithDatabase(username, userData) {
        const { owner, repo, branch, dbPath, API_BASE } = this.REPO_CONFIG;
        const apiUrl = `${API_BASE}/${owner}/${repo}/contents/${dbPath}`;

        try {
            // Get current database content
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Failed to fetch database');
            const fileData = await response.json();

            // Decode and parse current database
            // fileData.content contains base64-encoded file contents
            let dbContent = JSON.parse(this.base64Decode(fileData.content));
            const lastUpdate = new Date(dbContent.lastUpdate);
            const lastLocalSync = localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC + username);
            
            // Check if we need to merge changes
            if (lastLocalSync && new Date(lastLocalSync) < lastUpdate) {
                // Remote has newer data, merge with local
                const remoteUserData = dbContent.users[username] || {};
                userData = this.mergeProgress(remoteUserData, userData);
                // Update local storage with merged data
                localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(userData));
            }

            // Update database content
            dbContent.users[username] = userData;
            dbContent.lastUpdate = new Date().toISOString();

            // Prepare update payload
            const content = this.base64Encode(JSON.stringify(dbContent, null, 2));
            const updatePayload = {
                message: `Update progress for user ${username}`,
                content,
                sha: fileData.sha,
                branch
            };

            // Update database file
            const updateResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatePayload)
            });

            if (!updateResponse.ok) throw new Error('Failed to update database');

            // Update last sync timestamp
            localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC + username, new Date().toISOString());
            
            return true;
        } catch (error) {
            console.error('Sync error:', error);
            throw error;
        }
    },

    // Merge local and remote progress
    mergeProgress(remote, local) {
        if (!remote) return local;
        if (!local) return remote;

        // Merge discoveries (keep all unique discoveries from both sources)
        const mergedDiscoveries = [...local.discoveries];
        remote.discoveries.forEach(remoteDiscovery => {
            const existingIndex = mergedDiscoveries.findIndex(d => d.id === remoteDiscovery.id);
            if (existingIndex === -1) {
                mergedDiscoveries.push(remoteDiscovery);
            } else {
                // Keep the most recent version
                const localDate = new Date(mergedDiscoveries[existingIndex].dateDiscovered);
                const remoteDate = new Date(remoteDiscovery.dateDiscovered);
                if (remoteDate > localDate) {
                    mergedDiscoveries[existingIndex] = remoteDiscovery;
                }
            }
        });

        return {
            ...local,
            discoveries: mergedDiscoveries,
            progress: {
                ...local.progress,
                totalDiscoveries: mergedDiscoveries.length,
                completedDiscoveries: mergedDiscoveries.filter(d => d.completed).length
            }
        };
    },

    // Load user data from repository database and merge with local
    async getUserData(username) {
        let data = null;
        
        // Try to get from localStorage first
        const localData = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + username);
        if (localData) {
            data = JSON.parse(localData);
        }

        try {
            // Try to get from repository database
            const { owner, repo, dbPath, API_BASE } = this.REPO_CONFIG;
            const apiUrl = `${API_BASE}/${owner}/${repo}/contents/${dbPath}`;
            
            const response = await fetch(apiUrl);
            if (response.ok) {
                const fileData = await response.json();
                const dbContent = JSON.parse(this.base64Decode(fileData.content));
                
                if (dbContent.users && dbContent.users[username]) {
                    const remoteData = dbContent.users[username];
                    
                    if (data) {
                        // Merge remote and local data
                        data = this.mergeProgress(remoteData, data);
                        // Update local storage with merged data
                        localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(data));
                    } else {
                        // No local data, use remote data
                        data = remoteData;
                        localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(data));
                    }
                    
                    // Update last sync timestamp
                    localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC + username, dbContent.lastUpdate);
                }
            }
        } catch (err) {
            console.error('Failed to load from repository database:', err);
            // Fall back to local data
        }

        return data || this.initializeUserData(username);
    },

    // Save user data locally
    saveUserDataLocal(username, data) {
        localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(data));
    },

    // Get user data directly from localStorage (synchronous)
    getUserDataLocal(username) {
        const data = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + username);
        if (data) return JSON.parse(data);

        // No current-format data found — check for legacy AuthService progress key and migrate
        try {
            if (typeof AuthService !== 'undefined' && AuthService.STORAGE_KEYS && AuthService.STORAGE_KEYS.USER_PROGRESS) {
                const legacyKey = AuthService.STORAGE_KEYS.USER_PROGRESS + username; // e.g. chemulab_progress_<username>
                const legacy = localStorage.getItem(legacyKey);
                if (legacy) {
                    // Legacy format used by AuthService: { discoveredElements: [], completedCombinations: [] }
                    let legacyObj = null;
                    try { legacyObj = JSON.parse(legacy); } catch (e) { legacyObj = null; }

                    // Build new userData structure from legacy
                    const migrated = this.initializeUserData(username);

                    if (legacyObj) {
                        // Map discoveredElements (array of symbols or ids) to discoveries array
                        const discovered = Array.isArray(legacyObj.discoveredElements) ? legacyObj.discoveredElements : [];
                        migrated.discoveries = discovered.map(sym => ({
                            id: String(sym),
                            symbol: String(sym),
                            name: String(sym),
                            completed: true,
                            dateDiscovered: new Date().toISOString()
                        }));

                        // Update progress metrics
                        migrated.progress = {
                            ...migrated.progress,
                            totalDiscoveries: migrated.discoveries.length,
                            completedDiscoveries: migrated.discoveries.length,
                            progressPercentage: (migrated.discoveries.length / 118) * 100,
                            milestones: {
                                beginner: (migrated.discoveries.length / 118) * 100 >= 10,
                                intermediate: (migrated.discoveries.length / 118) * 100 >= 50,
                                advanced: (migrated.discoveries.length / 118) * 100 >= 75,
                                master: (migrated.discoveries.length / 118) * 100 >= 100
                            }
                        };

                        // Save migrated data under new key
                        localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(migrated));

                        // Optionally remove legacy key to avoid double-migration
                        // localStorage.removeItem(legacyKey);

                        return migrated;
                    }
                }
            }
        } catch (e) {
            console.warn('Migration check failed', e);
        }

        return null;
    },

    // Explicit migration helper: inspect legacy keys and attempt to migrate for a username
    migrateLegacy(username) {
        const result = { username, foundLegacy: false, legacyKey: null, legacyRaw: null, migrated: false, migratedCount: 0 };
        try {
            if (typeof AuthService !== 'undefined' && AuthService.STORAGE_KEYS && AuthService.STORAGE_KEYS.USER_PROGRESS) {
                const legacyKey = AuthService.STORAGE_KEYS.USER_PROGRESS + username; // e.g. chemulab_progress_<username>
                result.legacyKey = legacyKey;
                const legacy = localStorage.getItem(legacyKey);
                if (legacy) {
                    result.foundLegacy = true;
                    result.legacyRaw = legacy;
                    let legacyObj = null;
                    try { legacyObj = JSON.parse(legacy); } catch (e) { legacyObj = null; }

                    // Build new userData structure from legacy
                    const migrated = this.initializeUserData(username);

                    if (legacyObj) {
                        const discovered = Array.isArray(legacyObj.discoveredElements) ? legacyObj.discoveredElements : [];
                        migrated.discoveries = discovered.map(sym => ({
                            id: String(sym),
                            symbol: String(sym),
                            name: String(sym),
                            completed: true,
                            dateDiscovered: new Date().toISOString()
                        }));

                        migrated.progress = {
                            ...migrated.progress,
                            totalDiscoveries: migrated.discoveries.length,
                            completedDiscoveries: migrated.discoveries.length,
                            progressPercentage: (migrated.discoveries.length / 118) * 100,
                            milestones: {
                                beginner: (migrated.discoveries.length / 118) * 100 >= 10,
                                intermediate: (migrated.discoveries.length / 118) * 100 >= 50,
                                advanced: (migrated.discoveries.length / 118) * 100 >= 75,
                                master: (migrated.discoveries.length / 118) * 100 >= 100
                            }
                        };

                        // Persist migrated data
                        localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(migrated));
                        result.migrated = true;
                        result.migratedCount = migrated.discoveries.length;
                    }
                }
            } else {
                result.error = 'AuthService or its STORAGE_KEYS.USER_PROGRESS not available';
            }
        } catch (err) {
            result.error = String(err);
        }

        return result;
    },

    // Add or update a discovery
    addDiscovery(username, discovery) {
        // Use local cache (synchronous) so callers don't have to await async getUserData
        const local = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + username);
        const userData = local ? JSON.parse(local) : this.initializeUserData(username);

        // Check if discovery already exists
        const existingIndex = userData.discoveries.findIndex(d => d.id === discovery.id);
        
        if (existingIndex === -1) {
            // Add new discovery
            userData.discoveries.push({
                ...discovery,
                dateDiscovered: new Date().toISOString()
            });
        } else {
            // Update existing discovery
            userData.discoveries[existingIndex] = {
                ...userData.discoveries[existingIndex],
                ...discovery,
                dateModified: new Date().toISOString()
            };
        }

    // Update progress
    this.updateProgress(username, userData);

    // Save changes (async sync to repo, but we save locally immediately)
    this.saveUserData(username, userData);
        
        // Return updated data
        return userData;
    },

    // Calculate and update progress
    updateProgress(username, userData = null) {
        // Prefer supplied userData; otherwise read from localStorage synchronously
        if (!userData) {
            const local = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + username);
            userData = local ? JSON.parse(local) : null;
        }
        if (!userData) return null;

        const totalPossibleDiscoveries = 118; // Total number of possible element discoveries
        const completedDiscoveries = userData.discoveries.filter(d => d.completed).length;
        const progressPercentage = (completedDiscoveries / totalPossibleDiscoveries) * 100;

        // Update progress metrics
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
            }
        };

        // Save updated progress
    this.saveUserData(username, userData);
        
        // Emit progress update event
        this.emitProgressUpdate(userData.progress);
        
        return userData.progress;
    },

    // Get user's discoveries
    getDiscoveries(username) {
        // Return discoveries from localStorage synchronously so UI can read them immediately
        const local = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + username);
        const userData = local ? JSON.parse(local) : null;
        return userData ? userData.discoveries : [];
    },

    // Get user's progress
    getProgress(username) {
        const local = localStorage.getItem(this.STORAGE_KEYS.USER_DATA + username);
        const userData = local ? JSON.parse(local) : null;
        return userData ? userData.progress : null;
    },

    // Event emitter for progress updates
    emitProgressUpdate(progress) {
        const event = new CustomEvent('progressUpdate', { detail: progress });
        document.dispatchEvent(event);
    }
};

// Export the service
window.DiscoveryService = DiscoveryService;