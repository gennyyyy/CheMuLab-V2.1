class ProgressTracker {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentUser = AuthService.getCurrentUser();
        this.initialize();
        
        // Set up periodic sync
        this.setupSync();
    }

    setupSync() {
        // Initial sync
        if (this.currentUser && this.currentUser.uid) {
            DiscoveryService.syncUserData(this.currentUser.uid);
        }

        // Sync every 5 minutes and on page visibility change
        setInterval(() => {
            if (this.currentUser) {
                DiscoveryService.syncUserData(this.currentUser.uid);
            }
        }, 5 * 60 * 1000);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.currentUser) {
                DiscoveryService.syncUserData(this.currentUser.uid);
            }
        });
    }

    initialize() {
        if (!this.container) return;
        
        console.log('[ProgressTracker] initialize() called, currentUser:', this.currentUser);
        
        // Create progress tracker elements
        this.createProgressElements();
        
        // Wait for auth to be ready - if no user yet, wait for firebaseReady event
        if (this.currentUser && this.currentUser.uid) {
            console.log('[ProgressTracker] User already available:', this.currentUser.uid);
            this.initializeWithUser();
        } else {
            console.log('[ProgressTracker] No user yet, waiting for auth...');
            // User not available yet, wait for Firebase auth to be ready
            if (window.firebase && window.firebase.auth) {
                const unsubscribe = window.firebase.auth().onAuthStateChanged((user) => {
                    if (user) {
                        console.log('[ProgressTracker] Auth state changed, user available:', user.uid);
                        // Update currentUser
                        this.currentUser = AuthService.getCurrentUser();
                        console.log('[ProgressTracker] Updated currentUser:', this.currentUser);
                        unsubscribe();
                        this.initializeWithUser();
                    }
                });
            } else {
                console.warn('[ProgressTracker] Firebase not available');
            }
        }
        
        // Set up sync status display
        this.initializeSyncStatus();
    }

    initializeWithUser() {
        console.log('[ProgressTracker] initializeWithUser() called');
        
        if (!this.currentUser || !this.currentUser.uid) {
            console.warn('[ProgressTracker] Still no user in initializeWithUser');
            return;
        }

        // Set up real-time Firestore listener
        this.setupFirestoreListener();
        
        // Then load progress (which will populate from Firestore if available)
        // Add a small delay to allow listener to initialize
        setTimeout(() => {
            console.log('[ProgressTracker] Calling loadProgress after listener setup');
            this.loadProgress();
        }, 100);
        
        // Listen for progress updates from chemistry_craft.js
        document.addEventListener('progressUpdate', (e) => {
            console.log('[ProgressTracker] Received progressUpdate event:', e.detail);
            this.updateDisplay(e.detail);
        });
    }

    setupFirestoreListener() {
        if (!window.firebase?.firestore || !this.currentUser?.uid) {
            console.warn('[ProgressTracker] Cannot set up Firestore listener - missing Firebase or user uid');
            return;
        }

        try {
            const db = window.firebase.firestore();
            const userId = this.currentUser.uid;

            console.log('[ProgressTracker] Setting up Firestore listener for user:', userId);

            // Listen to progress document for real-time updates
            this.firestoreUnsubscribe = db.collection('progress').doc(userId)
                .onSnapshot((doc) => {
                    console.log('[ProgressTracker] Firestore onSnapshot callback triggered');
                    console.log('[ProgressTracker] Document exists:', doc.exists);
                    
                    if (doc.exists) {
                        const data = doc.data();
                        console.log('[ProgressTracker] Firestore data:', {
                            hasDiscoveries: !!data.discoveries,
                            discoveryCount: data.discoveries?.length || 0,
                            hasProgress: !!data.progress,
                            progress: data.progress
                        });
                        
                        if (data.discoveries && Array.isArray(data.discoveries)) {
                            console.log('[ProgressTracker] Processing discoveries array with', data.discoveries.length, 'items');
                            
                            // Use the progress from Firestore if available, otherwise calculate
                            let progress = data.progress;
                            if (!progress) {
                                progress = this.calculateProgress(data.discoveries);
                                console.log('[ProgressTracker] Calculated progress:', progress);
                            } else {
                                console.log('[ProgressTracker] Using progress from Firestore:', progress);
                            }
                            
                            // Create userData object
                            const userData = {
                                credentials: { username: this.currentUser.username || this.currentUser.uid },
                                progress: progress,
                                discoveries: data.discoveries
                            };
                            
                            console.log('[ProgressTracker] Updating display with:', {
                                completedDiscoveries: userData.progress.completedDiscoveries,
                                totalDiscoveries: userData.discoveries.length
                            });
                            
                            // Update localStorage
                            DiscoveryService.saveUserDataLocal(userId, userData);
                            
                            // Update display
                            this.loadDiscoveries();
                            this.updateDisplay(userData.progress);
                            
                            console.log('[ProgressTracker] Display updated successfully');
                        } else {
                            console.log('[ProgressTracker] No discoveries array found in Firestore data');
                        }
                    } else {
                        console.log('[ProgressTracker] Progress document does not exist in Firestore');
                    }
                }, (error) => {
                    console.error('[ProgressTracker] Firestore listener error:', error);
                });
        } catch (err) {
            console.warn('[ProgressTracker] Failed to set up Firestore listener:', err);
        }
    }

    calculateProgress(discoveries) {
        if (!discoveries || !Array.isArray(discoveries)) {
            return { progressPercentage: 0, completedDiscoveries: 0, milestones: {} };
        }

        // Count all discoveries as completed (they wouldn't be there if not completed)
        const completedCount = discoveries.length;
        const totalPossible = 118;
        const percentage = (completedCount / totalPossible) * 100;

        console.log('[ProgressTracker] calculateProgress:', { completedCount, totalPossible, percentage });

        return {
            completedDiscoveries: completedCount,
            totalDiscoveries: discoveries.length,
            progressPercentage: percentage,
            milestones: {
                beginner: percentage >= 10,
                intermediate: percentage >= 50,
                advanced: percentage >= 75,
                master: percentage >= 100
            }
        };
    }

    initializeSyncStatus() {
        const syncStatus = document.getElementById('syncStatus');
        if (!syncStatus) return;

        // Listen for sync events
        window.addEventListener('progressSync', (e) => {
            const { type, message } = e.detail;
            if (syncStatus) {
                syncStatus.textContent = message;
                syncStatus.style.color = type === 'error' ? '#f44336' : '#4CAF50';
                if (type !== 'error') {
                    setTimeout(() => {
                        syncStatus.textContent = '';
                    }, 3000);
                }
            }
        });
    }

    createProgressElements() {
        this.container.innerHTML = `
            <div class="progress-section">
                <h2>My Progress</h2>
                <div id="syncStatus" style="font-size:0.9em;color:#666;margin-bottom:10px;"></div>
                <div class="progress-bar-container">
                    <div class="progress-bar" id="progressBar"></div>
                    <div class="progress-text" id="progressText">0%</div>
                </div>
                
                <div class="progress-stats">
                    <div class="stat-item">
                        <h3>Discoveries</h3>
                        <p id="discoveryCount">0 / 118</p>
                    </div>
                    <div class="stat-item">
                        <h3>Milestones</h3>
                        <div id="milestones" class="milestones">
                            <div class="milestone" data-level="beginner">Beginner</div>
                            <div class="milestone" data-level="intermediate">Intermediate</div>
                            <div class="milestone" data-level="advanced">Advanced</div>
                            <div class="milestone" data-level="master">Master</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="discoveries-section">
                <h2>My Discoveries</h2>
                <div id="discoveriesList" class="discoveries-list"></div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .progress-section {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 20px;
            }

            .progress-bar-container {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                height: 20px;
                margin: 20px 0;
                position: relative;
                overflow: hidden;
            }

            .progress-bar {
                background: var(--accent-color, #87ceeb);
                height: 100%;
                width: 0%;
                transition: width 0.5s ease;
            }

            .progress-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #000;
                font-weight: bold;
            }

            .progress-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 20px;
            }

            .stat-item {
                background: rgba(255, 255, 255, 0.05);
                padding: 15px;
                border-radius: 8px;
            }

            .milestones {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }

            .milestone {
                background: rgba(255, 255, 255, 0.1);
                padding: 8px;
                border-radius: 5px;
                text-align: center;
                font-size: 0.9em;
                opacity: 0.5;
                transition: all 0.3s ease;
            }

            .milestone.achieved {
                background: var(--accent-color, #87ceeb);
                opacity: 1;
            }

            .discoveries-section {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 20px;
            }

            .discoveries-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }

            .discovery-item {
                background: rgba(255, 255, 255, 0.1);
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                transition: transform 0.2s ease;
            }

            .discovery-item:hover {
                transform: scale(1.05);
            }

            .discovery-item.completed {
                background: rgba(135, 206, 235, 0.2);
            }
        `;
        document.head.appendChild(style);
    }

    async loadProgress() {
        if (!this.currentUser || !this.currentUser.uid) {
            console.log('[ProgressTracker] No current user, cannot load progress');
            return;
        }

        console.log('[ProgressTracker] loadProgress called for user:', this.currentUser.uid);

        try {
            // Try to fetch from Firestore first
            const firestoreData = await this.getProgressFromFirestore();
            if (firestoreData) {
                console.log('[ProgressTracker] Got data from Firestore, updating display');
                // Save to localStorage for offline access
                DiscoveryService.saveUserDataLocal(this.currentUser.uid, firestoreData);
                
                // Update display immediately
                if (firestoreData.progress) {
                    console.log('[ProgressTracker] Calling updateDisplay with progress:', firestoreData.progress);
                    this.updateDisplay(firestoreData.progress);
                }
                this.loadDiscoveries();
                return;
            }

            console.log('[ProgressTracker] No data from Firestore, checking localStorage');
            
            // Fallback to localStorage if Firestore doesn't have data yet
            const userData = await DiscoveryService.getUserData(this.currentUser.uid);
            if (userData?.progress) {
                console.log('[ProgressTracker] Found data in localStorage, updating display');
                this.updateDisplay(userData.progress);
                this.loadDiscoveries();
            } else {
                console.log('[ProgressTracker] No data found anywhere');
            }
        } catch (err) {
            console.error('Failed to load progress:', err);
            // Final fallback to local data using uid
            const progress = DiscoveryService.getProgress(this.currentUser.uid);
            if (progress) {
                console.log('[ProgressTracker] Fallback: found progress in localStorage');
                this.updateDisplay(progress);
                this.loadDiscoveries();
            }
        }
    }

    async getProgressFromFirestore() {
        if (!window.firebase?.firestore || !this.currentUser?.uid) {
            console.warn('[ProgressTracker] Cannot get from Firestore - missing Firebase or uid');
            return null;
        }

        try {
            const db = window.firebase.firestore();
            console.log('[ProgressTracker] Fetching from Firestore for uid:', this.currentUser.uid);
            const doc = await db.collection('progress').doc(this.currentUser.uid).get();
            
            console.log('[ProgressTracker] Firestore get() returned, doc.exists:', doc.exists);
            
            if (doc.exists) {
                const data = doc.data();
                console.log('[ProgressTracker] Loaded from Firestore:', {
                    hasDiscoveries: !!data.discoveries,
                    discoveryCount: data.discoveries?.length,
                    hasProgress: !!data.progress,
                    progress: data.progress
                });
                
                // Construct userData object that matches our expected format
                return {
                    credentials: { username: this.currentUser.username || this.currentUser.uid },
                    progress: data.progress || { progressPercentage: 0, completedDiscoveries: 0, milestones: {} },
                    discoveries: data.discoveries || []
                };
            } else {
                console.log('[ProgressTracker] Document does not exist in Firestore');
            }
        } catch (err) {
            console.warn('[ProgressTracker] Failed to fetch from Firestore:', err);
        }
        return null;
    }

    updateDisplay(progress) {
        if (!progress) {
            console.warn('[ProgressTracker] No progress data to display');
            return;
        }

        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const discoveryCount = document.getElementById('discoveryCount');
        
        if (progressBar && progressText && discoveryCount) {
            const percentage = progress.progressPercentage || 0;
            const completed = progress.completedDiscoveries || 0;
            
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${Math.round(percentage)}%`;
            discoveryCount.textContent = `${completed} / 118`;
            
            console.log('[ProgressTracker] Updated display:', { percentage, completed });
        }

        // Update milestones
        const milestones = document.getElementById('milestones');
        if (milestones && progress.milestones) {
            Object.entries(progress.milestones).forEach(([level, achieved]) => {
                const milestone = milestones.querySelector(`[data-level="${level}"]`);
                if (milestone) {
                    milestone.classList.toggle('achieved', achieved);
                }
            });
        }
    }

    loadDiscoveries() {
        if (!this.currentUser || !this.currentUser.uid) {
            console.warn('[ProgressTracker] Cannot load discoveries - no current user');
            return;
        }

        const discoveries = DiscoveryService.getDiscoveries(this.currentUser.uid);
        const discoveryList = document.getElementById('discoveriesList');
        
        console.log('[ProgressTracker] loadDiscoveries called:', {
            uid: this.currentUser.uid,
            discoveryCount: discoveries.length,
            discoveries: discoveries
        });
        
        if (discoveryList) {
            if (!discoveries || discoveries.length === 0) {
                discoveryList.innerHTML = '<div style="color: #999; padding: 20px; text-align: center;">No discoveries yet. Start combining elements in Your Lab!</div>';
            } else {
                discoveryList.innerHTML = discoveries.map(discovery => `
                    <div class="discovery-item ${discovery.completed ? 'completed' : ''}">
                        <div class="discovery-symbol">${discovery.symbol || 'N/A'}</div>
                        <div class="discovery-name">${discovery.name || 'Unknown'}</div>
                        <div class="discovery-date">
                            ${discovery.dateDiscovered ? new Date(discovery.dateDiscovered).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                `).join('');
                console.log('[ProgressTracker] Rendered', discoveries.length, 'discoveries');
            }
        } else {
            console.warn('[ProgressTracker] discoveryList element not found');
        }
    }
}

// Export the class
window.ProgressTracker = ProgressTracker;