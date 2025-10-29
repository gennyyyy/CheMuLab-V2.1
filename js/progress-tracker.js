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
        if (this.currentUser) {
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
        
        // Create progress tracker elements
        this.createProgressElements();
        
        // Load initial progress
        this.loadProgress();
        
        // Listen for progress updates
        document.addEventListener('progressUpdate', (e) => this.updateDisplay(e.detail));
        
        // Set up sync status display
        this.initializeSyncStatus();
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
        if (!this.currentUser) return;

        try {
            const userData = await DiscoveryService.getUserData(this.currentUser.username);
            if (userData?.progress) {
                this.updateDisplay(userData.progress);
                this.loadDiscoveries();
            }
        } catch (err) {
            console.error('Failed to load progress:', err);
            // Fall back to local data
            const progress = DiscoveryService.getProgress(this.currentUser.username);
            if (progress) {
                this.updateDisplay(progress);
                this.loadDiscoveries();
            }
        }
    }

    updateDisplay(progress) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const discoveryCount = document.getElementById('discoveryCount');
        
        if (progressBar && progressText && discoveryCount) {
            progressBar.style.width = `${progress.progressPercentage}%`;
            progressText.textContent = `${Math.round(progress.progressPercentage)}%`;
            discoveryCount.textContent = `${progress.completedDiscoveries} / 118`;
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
        const discoveries = DiscoveryService.getDiscoveries(this.currentUser.username);
        const discoveryList = document.getElementById('discoveriesList');
        
        if (discoveryList) {
            discoveryList.innerHTML = discoveries.map(discovery => `
                <div class="discovery-item ${discovery.completed ? 'completed' : ''}">
                    <div class="discovery-symbol">${discovery.symbol}</div>
                    <div class="discovery-name">${discovery.name}</div>
                    <div class="discovery-date">
                        ${new Date(discovery.dateDiscovered).toLocaleDateString()}
                    </div>
                </div>
            `).join('');
        }
    }
}

// Export the class
window.ProgressTracker = ProgressTracker;