// Discovery and Progress Management Service

const DiscoveryService = {
    // Storage Keys
    STORAGE_KEYS: {
        USER_DATA: 'chemulab_user_data_'
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

    // Save user data
    saveUserData(username, data) {
        localStorage.setItem(this.STORAGE_KEYS.USER_DATA + username, JSON.stringify(data));
    },

    // Add or update a discovery
    addDiscovery(username, discovery) {
        const userData = this.getUserData(username) || this.initializeUserData(username);
        
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
        
        // Save changes
        this.saveUserData(username, userData);
        
        // Return updated data
        return userData;
    },

    // Calculate and update progress
    updateProgress(username, userData = null) {
        userData = userData || this.getUserData(username);
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
        const userData = this.getUserData(username);
        return userData ? userData.discoveries : [];
    },

    // Get user's progress
    getProgress(username) {
        const userData = this.getUserData(username);
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