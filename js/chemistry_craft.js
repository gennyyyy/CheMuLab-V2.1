// ChemistryCraft Module
const ChemistryCraft = {
    // UI Elements
    elementGrid: null,
    combineBtn: null,
    resultArea: null,
    discoveriesList: null,
    pendingDiscoveriesList: null,
    searchInput: null,

    // Initial elements available to the user - Complete periodic table
    initialElements: [
        // Period 1 (2 elements)
        { symbol: 'H', name: 'Hydrogen', color: '#E6E6E6', type: 'nonmetal' },
        { symbol: 'He', name: 'Helium', color: '#FFE5CC', type: 'noble-gas' },

        // Period 2 (8 elements)
        { symbol: 'Li', name: 'Lithium', color: '#CC99FF', type: 'alkali-metal' },
        { symbol: 'Be', name: 'Beryllium', color: '#C0C0C0', type: 'alkaline-earth' },
        { symbol: 'B', name: 'Boron', color: '#FFB266', type: 'metalloid' },
        { symbol: 'C', name: 'Carbon', color: '#666666', type: 'nonmetal' },
        { symbol: 'N', name: 'Nitrogen', color: '#99CCFF', type: 'nonmetal' },
        { symbol: 'O', name: 'Oxygen', color: '#FF9999', type: 'nonmetal' },
        { symbol: 'F', name: 'Fluorine', color: '#CCFF99', type: 'nonmetal' },
        { symbol: 'Ne', name: 'Neon', color: '#FF99CC', type: 'noble-gas' },

        // Period 3 (8 elements)
        { symbol: 'Na', name: 'Sodium', color: '#FFB366', type: 'alkali-metal' },
        { symbol: 'Mg', name: 'Magnesium', color: '#B8B8B8', type: 'alkaline-earth' },
        { symbol: 'Al', name: 'Aluminum', color: '#BFC7C9', type: 'post-transition' },
        { symbol: 'Si', name: 'Silicon', color: '#F5C242', type: 'metalloid' },
        { symbol: 'P', name: 'Phosphorus', color: '#FF9966', type: 'nonmetal' },
        { symbol: 'S', name: 'Sulfur', color: '#FFFF00', type: 'nonmetal' },
        { symbol: 'Cl', name: 'Chlorine', color: '#90EE90', type: 'nonmetal' },
        { symbol: 'Ar', name: 'Argon', color: '#FF99CC', type: 'noble-gas' },

        // Period 4 (18 elements)
        { symbol: 'K', name: 'Potassium', color: '#FF99CC', type: 'alkali-metal' },
        { symbol: 'Ca', name: 'Calcium', color: '#A0A0A0', type: 'alkaline-earth' },
        { symbol: 'Sc', name: 'Scandium', color: '#E6E6FA', type: 'transition' },
        { symbol: 'Ti', name: 'Titanium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'V', name: 'Vanadium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Cr', name: 'Chromium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Mn', name: 'Manganese', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Fe', name: 'Iron', color: '#FFB366', type: 'transition' },
        { symbol: 'Co', name: 'Cobalt', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Ni', name: 'Nickel', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Cu', name: 'Copper', color: '#FFA07A', type: 'transition' },
        { symbol: 'Zn', name: 'Zinc', color: '#98FB98', type: 'transition' },
        { symbol: 'Ga', name: 'Gallium', color: '#BCA8D1', type: 'post-transition' },
        { symbol: 'Ge', name: 'Germanium', color: '#668F8F', type: 'metalloid' },
        { symbol: 'As', name: 'Arsenic', color: '#BD96CA', type: 'metalloid' },
        { symbol: 'Se', name: 'Selenium', color: '#FFA07A', type: 'nonmetal' },
        { symbol: 'Br', name: 'Bromine', color: '#BC8F8F', type: 'nonmetal' },
        { symbol: 'Kr', name: 'Krypton', color: '#FF99CC', type: 'noble-gas' },

        // Period 5 (18 elements)
        { symbol: 'Rb', name: 'Rubidium', color: '#FF80B2', type: 'alkali-metal' },
        { symbol: 'Sr', name: 'Strontium', color: '#989898', type: 'alkaline-earth' },
        { symbol: 'Y', name: 'Yttrium', color: '#E6E6FA', type: 'transition' },
        { symbol: 'Zr', name: 'Zirconium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Nb', name: 'Niobium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Mo', name: 'Molybdenum', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Tc', name: 'Technetium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Ru', name: 'Ruthenium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Rh', name: 'Rhodium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Pd', name: 'Palladium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Ag', name: 'Silver', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Cd', name: 'Cadmium', color: '#FFB6C1', type: 'transition' },
        { symbol: 'In', name: 'Indium', color: '#A3A3A3', type: 'post-transition' },
        { symbol: 'Sn', name: 'Tin', color: '#668F8F', type: 'post-transition' },
        { symbol: 'Sb', name: 'Antimony', color: '#9370DB', type: 'metalloid' },
        { symbol: 'Te', name: 'Tellurium', color: '#DEB887', type: 'metalloid' },
        { symbol: 'I', name: 'Iodine', color: '#9370DB', type: 'nonmetal' },
        { symbol: 'Xe', name: 'Xenon', color: '#FF99CC', type: 'noble-gas' },

        // Period 6 (32 elements, including lanthanides)
        { symbol: 'Cs', name: 'Caesium', color: '#FF6699', type: 'alkali-metal' },
        { symbol: 'Ba', name: 'Barium', color: '#808080', type: 'alkaline-earth' },
        { symbol: 'La', name: 'Lanthanum', color: '#E6E6FA', type: 'lanthanide' },
        { symbol: 'Ce', name: 'Cerium', color: '#E6E6FA', type: 'lanthanide' },
        { symbol: 'Pr', name: 'Praseodymium', color: '#E6E6FA', type: 'lanthanide' },
        { symbol: 'Nd', name: 'Neodymium', color: '#E6E6FA', type: 'lanthanide' },
        { symbol: 'Pm', name: 'Promethium', color: '#E6E6FA', type: 'lanthanide' },
        { symbol: 'Sm', name: 'Samarium', color: '#E6E6FA', type: 'lanthanide' },
        { symbol: 'Eu', name: 'Europium', color: '#E6E6FA', type: 'lanthanide' },
        { symbol: 'Gd', name: 'Gadolinium', color: '#E6E6FA', type: 'lanthanide' },
        { symbol: 'Tb', name: 'Terbium', color: '#E6E6FA', type: 'lanthanide' },
        { symbol: 'Dy', name: 'Dysprosium', color: '#E6E6FA', type: 'lanthanide' },
        { symbol: 'Ho', name: 'Holmium', color: '#E6E6FA', type: 'lanthanide' },
        { symbol: 'Er', name: 'Erbium', color: '#E6E6FA', type: 'lanthanide' },
        { symbol: 'Tm', name: 'Thulium', color: '#E6E6FA', type: 'lanthanide' },
        { symbol: 'Yb', name: 'Ytterbium', color: '#E6E6FA', type: 'lanthanide' },
        { symbol: 'Lu', name: 'Lutetium', color: '#E6E6FA', type: 'lanthanide' },
        { symbol: 'Hf', name: 'Hafnium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Ta', name: 'Tantalum', color: '#C0C0C0', type: 'transition' },
        { symbol: 'W', name: 'Tungsten', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Re', name: 'Rhenium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Os', name: 'Osmium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Ir', name: 'Iridium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Pt', name: 'Platinum', color: '#E5E4E2', type: 'transition' },
        { symbol: 'Au', name: 'Gold', color: '#FFD700', type: 'transition' },
        { symbol: 'Hg', name: 'Mercury', color: '#B8B8B8', type: 'transition' },
        { symbol: 'Tl', name: 'Thallium', color: '#A3A3A3', type: 'post-transition' },
        { symbol: 'Pb', name: 'Lead', color: '#575961', type: 'post-transition' },
        { symbol: 'Bi', name: 'Bismuth', color: '#9370DB', type: 'post-transition' },
        { symbol: 'Po', name: 'Polonium', color: '#FF9999', type: 'metalloid' },
        { symbol: 'At', name: 'Astatine', color: '#CCFF99', type: 'metalloid' },
        { symbol: 'Rn', name: 'Radon', color: '#FF99CC', type: 'noble-gas' },

        // Period 7 (32 elements, including actinides)
        { symbol: 'Fr', name: 'Francium', color: '#FF4D4D', type: 'alkali-metal' },
        { symbol: 'Ra', name: 'Radium', color: '#707070', type: 'alkaline-earth' },
        { symbol: 'Ac', name: 'Actinium', color: '#C0C0C0', type: 'actinide' },
        { symbol: 'Th', name: 'Thorium', color: '#C0C0C0', type: 'actinide' },
        { symbol: 'Pa', name: 'Protactinium', color: '#C0C0C0', type: 'actinide' },
        { symbol: 'U', name: 'Uranium', color: '#C0C0C0', type: 'actinide' },
        { symbol: 'Np', name: 'Neptunium', color: '#C0C0C0', type: 'actinide' },
        { symbol: 'Pu', name: 'Plutonium', color: '#C0C0C0', type: 'actinide' },
        { symbol: 'Am', name: 'Americium', color: '#C0C0C0', type: 'actinide' },
        { symbol: 'Cm', name: 'Curium', color: '#C0C0C0', type: 'actinide' },
        { symbol: 'Bk', name: 'Berkelium', color: '#C0C0C0', type: 'actinide' },
        { symbol: 'Cf', name: 'Californium', color: '#C0C0C0', type: 'actinide' },
        { symbol: 'Es', name: 'Einsteinium', color: '#C0C0C0', type: 'actinide' },
        { symbol: 'Fm', name: 'Fermium', color: '#C0C0C0', type: 'actinide' },
        { symbol: 'Md', name: 'Mendelevium', color: '#C0C0C0', type: 'actinide' },
        { symbol: 'No', name: 'Nobelium', color: '#C0C0C0', type: 'actinide' },
        { symbol: 'Lr', name: 'Lawrencium', color: '#C0C0C0', type: 'actinide' },
        { symbol: 'Rf', name: 'Rutherfordium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Db', name: 'Dubnium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Sg', name: 'Seaborgium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Bh', name: 'Bohrium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Hs', name: 'Hassium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Mt', name: 'Meitnerium', color: '#C0C0C0', type: 'unknown' },
        { symbol: 'Ds', name: 'Darmstadtium', color: '#C0C0C0', type: 'unknown' },
        { symbol: 'Rg', name: 'Roentgenium', color: '#C0C0C0', type: 'unknown' },
        { symbol: 'Cn', name: 'Copernicium', color: '#C0C0C0', type: 'transition' },
        { symbol: 'Nh', name: 'Nihonium', color: '#C0C0C0', type: 'unknown' },
        { symbol: 'Fl', name: 'Flerovium', color: '#C0C0C0', type: 'post-transition' },
        { symbol: 'Mc', name: 'Moscovium', color: '#C0C0C0', type: 'unknown' },
        { symbol: 'Lv', name: 'Livermorium', color: '#C0C0C0', type: 'unknown' },
        { symbol: 'Ts', name: 'Tennessine', color: '#C0C0C0', type: 'unknown' },
        { symbol: 'Og', name: 'Oganesson', color: '#FF99CC', type: 'noble-gas' }
    ],

    // Initialize UI
    init() {
        console.log('[ChemistryCraft] Initializing...');
        
        // Get UI elements with detailed validation
        this.elementGrid = document.getElementById('elementGrid');
        if (!this.elementGrid) {
            console.error('[ChemistryCraft] Missing element grid');
            return false;
        }

        this.combineBtn = document.getElementById('combineBtn');
        if (!this.combineBtn) {
            console.error('[ChemistryCraft] Missing combine button');
            return false;
        }

        this.resultArea = document.getElementById('resultArea');
        if (!this.resultArea) {
            console.error('[ChemistryCraft] Missing result area');
            return false;
        }

        this.searchInput = document.getElementById('elementSearch');
        if (!this.searchInput) {
            console.error('[ChemistryCraft] Missing search input');
            return false;
        }

        // Get or create discoveries list
        this.discoveriesList = document.getElementById('discoveriesList');
        if (!this.discoveriesList) {
            console.log('[ChemistryCraft] Creating discoveries list');
            this.discoveriesList = document.createElement('div');
            this.discoveriesList.id = 'discoveriesList';
            this.discoveriesList.className = 'discoveries-list';
            document.querySelector('.discoveries-container')?.appendChild(this.discoveriesList);
        }

        if (!this.discoveriesList) {
            console.error('[ChemistryCraft] Could not find or create discoveries list');
            return false;
        }

        // Initialize elements grid
        this.populateElements(this.initialElements);

        // Setup event listeners
        this.setupEventListeners();

        // Load saved discoveries
        this.loadSavedDiscoveries();

        console.log('[ChemistryCraft] Initialization complete');
        return true;
    },

    // Populate elements grid
    populateElements(elements) {
        if (!Array.isArray(elements) || elements.length === 0) {
            console.error('[ChemistryCraft] Invalid elements array:', elements);
            this.elementGrid.innerHTML = '<div class="element error">Error: No elements available</div>';
            return false;
        }

        try {
            console.log('[ChemistryCraft] Populating elements:', elements.length);
            this.elementGrid.innerHTML = '';

            elements.forEach(element => {
                if (!element || !element.symbol || !element.name) {
                    console.warn('[ChemistryCraft] Invalid element:', element);
                    return;
                }

                const elementDiv = this.createElementDiv(element);
                this.elementGrid.appendChild(elementDiv);
            });

            return true;
        } catch (error) {
            console.error('[ChemistryCraft] Error populating elements:', error);
            this.elementGrid.innerHTML = '<div class="element error">Error loading elements</div>';
            return false;
        }
    },

    // Create element div
    createElementDiv(element) {
        const div = document.createElement('div');
        div.className = 'element';
        div.draggable = true;
        div.style.backgroundColor = element.color || '#cccccc';
        
        div.innerHTML = `
            <div class="element-symbol">${element.symbol}</div>
            <div class="element-name">${element.name}</div>
        `;

        div.addEventListener('dragstart', event => {
            event.dataTransfer.setData('application/json', JSON.stringify(element));
            div.classList.add('dragging');
        });

        div.addEventListener('dragend', () => {
            div.classList.remove('dragging');
        });

        return div;
    },

    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', event => {
                const searchTerm = event.target.value.toLowerCase();
                const filteredElements = this.initialElements.filter(element => 
                    element.name.toLowerCase().includes(searchTerm) ||
                    element.symbol.toLowerCase().includes(searchTerm) ||
                    element.type.toLowerCase().includes(searchTerm)
                );
                this.populateElements(filteredElements);
            });
        }

        // Combine button
        this.combineBtn.addEventListener('click', () => this.combineElements());

        // Setup drag and drop for crafting slots
        ['slot1', 'slot2'].forEach(slotId => {
            const slot = document.getElementById(slotId);
            if (slot) {
                slot.addEventListener('dragover', this.handleDragOver.bind(this));
                slot.addEventListener('drop', this.handleDrop.bind(this));
                slot.addEventListener('dragleave', this.handleDragLeave.bind(this));
            }
        });

        // Setup drag and drop handlers
        ['slot1', 'slot2'].forEach(slotId => {
            const slot = document.getElementById(slotId);
            if (slot) {
                slot.addEventListener('dragover', this.handleDragOver.bind(this));
                slot.addEventListener('drop', this.handleDrop.bind(this));
                slot.addEventListener('dragleave', this.handleDragLeave.bind(this));
            }
        });
    },

    // Drag and drop handlers
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        const slot = event.target.closest('.crafting-slot');
        if (slot) {
            slot.classList.add('drag-over');
        }
    },

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        const slot = event.target.closest('.crafting-slot');
        if (slot) {
            slot.classList.remove('drag-over');
        }
    },

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        const slot = event.target.closest('.crafting-slot');
        if (!slot) return;
        
        slot.classList.remove('drag-over');

        try {
            const elementData = event.dataTransfer.getData('application/json');
            if (!elementData) {
                console.error('[ChemistryCraft] No element data in drop event');
                return;
            }

            const element = JSON.parse(elementData);
            if (!element || !element.symbol) {
                console.error('[ChemistryCraft] Invalid element data:', element);
                return;
            }
            
            // Clear existing content
            slot.innerHTML = '';
            
            // Create and add the dropped element
            const elementDiv = this.createElementDiv(element);
            elementDiv.draggable = false; // Prevent dragging once dropped
            slot.appendChild(elementDiv);
            
            // Store element data
            slot.dataset.element = elementData;

            // Enable combine button if both slots are filled
            const slot1 = document.getElementById('slot1');
            const slot2 = document.getElementById('slot2');
            this.combineBtn.disabled = !(slot1.dataset.element && slot2.dataset.element);

        } catch (error) {
            console.error('[ChemistryCraft] Error handling drop:', error);
            slot.innerHTML = '<div class="slot-label">Error dropping element</div>';
        }
    },

    // Combine elements
    combineElements() {
        const slot1 = document.getElementById('slot1');
        const slot2 = document.getElementById('slot2');

        // Get dragged elements' data
        const element1 = slot1.dataset.element ? JSON.parse(slot1.dataset.element) : null;
        const element2 = slot2.dataset.element ? JSON.parse(slot2.dataset.element) : null;

        if (!element1 || !element2) {
            this.showToast('Please drop elements in both slots to combine them');
            return;
        }

        // Try combination
        this.attemptCombination(element1, element2);
    },

    // Show a toast message
    showToast(message, isError = false) {
        // Get or create toast container
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'error' : ''}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.remove();
                    // Remove container if it's empty
                    if (!container.firstChild) {
                        container.remove();
                    }
                }, 300);
            }, 3000);
        }, 100);
    },

    // Migrate pending discoveries to cloud storage when user signs in
    async migratePendingDiscoveries(currentUser) {
        if (!currentUser?.uid) return;
        
        try {
            console.log('[ChemistryCraft] Migrating pending discoveries...');
            const pendingKey = `chemulab_pending_discoveries`;
            const pendingRaw = localStorage.getItem(pendingKey);
            
            if (!pendingRaw) {
                console.log('[ChemistryCraft] No pending discoveries to migrate');
                return;
            }

            const pendingDiscoveries = JSON.parse(pendingRaw);
            if (!Array.isArray(pendingDiscoveries) || !pendingDiscoveries.length) {
                localStorage.removeItem(pendingKey);
                return;
            }

            // Get existing cloud discoveries to check for duplicates
            const db = window.firebase.firestore();
            const progressDoc = await db.collection('progress').doc(currentUser.uid).get();
            const existingData = progressDoc.exists ? progressDoc.data() : null;
            const existingDiscoveries = (existingData?.discoveries || []);

            // Deduplicate pending discoveries
            const seenCombos = new Set(existingDiscoveries.map(d => d.combination?.sort().join('+')));
            const newDiscoveries = pendingDiscoveries.filter(d => {
                const combo = d.combination?.sort().join('+');
                if (seenCombos.has(combo)) return false;
                seenCombos.add(combo);
                return true;
            });

            if (newDiscoveries.length) {
                // Merge with existing and save
                const allDiscoveries = [...existingDiscoveries, ...newDiscoveries];
                await db.collection('progress').doc(currentUser.uid).set({
                    discoveries: allDiscoveries,
                    lastUpdated: new Date().toISOString()
                }, { merge: true });
                console.log(`[ChemistryCraft] Migrated ${newDiscoveries.length} discoveries to cloud`);
            }

            // Clear pending discoveries since they're now in cloud
            localStorage.removeItem(pendingKey);
            
        } catch (error) {
            console.warn('[ChemistryCraft] Failed to migrate pending discoveries:', error);
        }
    },

    // Load saved discoveries from cloud
    async loadSavedDiscoveries() {
        // Validate environment
        if (!window.firebase?.auth) {
            console.error('[ChemistryCraft] Firebase Auth not available');
            return;
        }

        if (!window.firebase?.firestore) {
            console.error('[ChemistryCraft] Firestore not available');
            return;
        }

        if (!this.discoveriesList) {
            console.error('[ChemistryCraft] No discoveries list container found');
            return;
        }

        try {
            // Clear existing list
            this.discoveriesList.innerHTML = '';
            
            // Get current user
            const currentUser = window.firebase.auth().currentUser;
            if (!currentUser?.uid) {
                console.log('[ChemistryCraft] No authenticated user');
                this.showToast('Please sign in to see your discoveries');
                return;
            }
            
            console.log('[ChemistryCraft] Loading discoveries for:', currentUser.uid);
            const db = window.firebase.firestore();
            const userDoc = db.collection('progress').doc(currentUser.uid);
            const doc = await userDoc.get();
            
            // Initialize empty discoveries array if document doesn't exist
            if (!doc.exists) {
                console.log('[ChemistryCraft] Creating initial discoveries document');
                await userDoc.set({
                    discoveries: [],
                    created: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                });
                return;
            }
            
            const data = doc.data();
            // Initialize discoveries array if it doesn't exist
            if (!Array.isArray(data?.discoveries)) {
                console.log('[ChemistryCraft] Initializing discoveries array');
                await userDoc.set({
                    discoveries: [],
                    lastUpdated: new Date().toISOString()
                }, { merge: true });
                return;
            }

            // Process and display each discovery
            let loadedCount = 0;
            for (const discovery of data.discoveries) {
                if (discovery?.symbol && discovery?.name) {
                    this.addDiscoveryToUI({
                        symbol: discovery.symbol,
                        name: discovery.name,
                        dateDiscovered: discovery.dateDiscovered || new Date().toISOString()
                    });
                    loadedCount++;
                } else {
                    console.warn('[ChemistryCraft] Skipping invalid discovery:', discovery);
                }
            }
            
            console.log(`[ChemistryCraft] Successfully loaded ${loadedCount} discoveries`);
            if (loadedCount > 0) {
                this.showToast(`Loaded ${loadedCount} discoveries`);
            }

        } catch (error) {
            console.error('[ChemistryCraft] Error loading discoveries:', error);
            this.showToast('Failed to load discoveries. Please try again.', true);
        }
    },

    // Save discoveries to storage
    async saveDiscoveries() {
        // Validate environment
        if (!window.firebase?.auth) {
            console.error('[ChemistryCraft] Firebase Auth not available');
            return;
        }

        if (!window.firebase?.firestore) {
            console.error('[ChemistryCraft] Firestore not available');
            return;
        }

        if (!this.discoveriesList) {
            console.error('[ChemistryCraft] No discoveries list container found');
            return;
        }

        try {
            // Check for authenticated user
            const currentUser = window.firebase.auth().currentUser;
            if (!currentUser?.uid) {
                console.warn('[ChemistryCraft] No authenticated user');
                this.showToast('Please sign in to save discoveries', true);
                return;
            }

            // Collect discoveries from UI
            const discoveries = Array.from(this.discoveriesList.querySelectorAll('.discovery-item'))
                .map(item => ({
                    symbol: item.querySelector('.element-symbol')?.textContent || '',
                    name: item.querySelector('.element-name')?.textContent || '',
                    dateDiscovered: new Date().toISOString()
                }))
                .filter(d => d.symbol && d.name);

            console.log('[ChemistryCraft] Preparing to save discoveries:', discoveries);

            // Save to Firestore
            const db = window.firebase.firestore();
            const userDoc = db.collection('progress').doc(currentUser.uid);

            // Get existing document or create new one
            const doc = await userDoc.get();
            if (!doc.exists) {
                console.log('[ChemistryCraft] Creating new progress document');
                await userDoc.set({
                    discoveries: discoveries,
                    created: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                });
            } else {
                console.log('[ChemistryCraft] Updating existing progress document');
                await userDoc.set({
                    discoveries: discoveries,
                    lastUpdated: new Date().toISOString()
                }, { merge: true });
            }

            console.log(`[ChemistryCraft] Successfully saved ${discoveries.length} discoveries`);
            this.showToast(`${discoveries.length} discoveries saved!`);

        } catch (error) {
            console.error('[ChemistryCraft] Error saving discoveries:', error);
            this.showToast('Failed to save discoveries. Please try again.', true);
        }
    },

    // Basic combinations lookup table
    combinations: {
        // Water and related compounds
        'H+O': { symbol: 'H2O', name: 'Water', color: '#B3E0FF', type: 'compound' },
        'O+H': { symbol: 'H2O', name: 'Water', color: '#B3E0FF', type: 'compound' },
        
        // Carbon compounds
        'C+O': { symbol: 'CO2', name: 'Carbon Dioxide', color: '#A9A9A9', type: 'compound' },
        'O+C': { symbol: 'CO2', name: 'Carbon Dioxide', color: '#A9A9A9', type: 'compound' },
        
        // Nitrogen compounds
        'H+N': { symbol: 'NH3', name: 'Ammonia', color: '#CC99FF', type: 'compound' },
        'N+H': { symbol: 'NH3', name: 'Ammonia', color: '#CC99FF', type: 'compound' },
        'N+O': { symbol: 'NO2', name: 'Nitrogen Dioxide', color: '#FF9999', type: 'compound' },
        'O+N': { symbol: 'NO2', name: 'Nitrogen Dioxide', color: '#FF9999', type: 'compound' },
        
        // Sulfur compounds
        'H+S': { symbol: 'H2S', name: 'Hydrogen Sulfide', color: '#FFFF99', type: 'compound' },
        'S+H': { symbol: 'H2S', name: 'Hydrogen Sulfide', color: '#FFFF99', type: 'compound' },
        'S+O': { symbol: 'SO2', name: 'Sulfur Dioxide', color: '#FFDB4D', type: 'compound' },
        'O+S': { symbol: 'SO2', name: 'Sulfur Dioxide', color: '#FFDB4D', type: 'compound' },
        
        // Phosphorus compounds
        'P+O': { symbol: 'P2O5', name: 'Phosphorus Pentoxide', color: '#FFB366', type: 'compound' },
        'O+P': { symbol: 'P2O5', name: 'Phosphorus Pentoxide', color: '#FFB366', type: 'compound' },
        
        // Halogen compounds
        'H+F': { symbol: 'HF', name: 'Hydrofluoric Acid', color: '#CCFF99', type: 'compound' },
        'F+H': { symbol: 'HF', name: 'Hydrofluoric Acid', color: '#CCFF99', type: 'compound' },
        'H+Cl': { symbol: 'HCl', name: 'Hydrochloric Acid', color: '#90EE90', type: 'compound' },
        'Cl+H': { symbol: 'HCl', name: 'Hydrochloric Acid', color: '#90EE90', type: 'compound' },
        'H+Br': { symbol: 'HBr', name: 'Hydrobromic Acid', color: '#BC8F8F', type: 'compound' },
        'Br+H': { symbol: 'HBr', name: 'Hydrobromic Acid', color: '#BC8F8F', type: 'compound' },
        'H+I': { symbol: 'HI', name: 'Hydroiodic Acid', color: '#9370DB', type: 'compound' },
        'I+H': { symbol: 'HI', name: 'Hydroiodic Acid', color: '#9370DB', type: 'compound' },
        
        // Metal oxides
        'Na+O': { symbol: 'Na2O', name: 'Sodium Oxide', color: '#FFB366', type: 'compound' },
        'O+Na': { symbol: 'Na2O', name: 'Sodium Oxide', color: '#FFB366', type: 'compound' },
        'K+O': { symbol: 'K2O', name: 'Potassium Oxide', color: '#FF99CC', type: 'compound' },
        'O+K': { symbol: 'K2O', name: 'Potassium Oxide', color: '#FF99CC', type: 'compound' },
        'Fe+O': { symbol: 'Fe2O3', name: 'Iron(III) Oxide', color: '#CD853F', type: 'compound' },
        'O+Fe': { symbol: 'Fe2O3', name: 'Iron(III) Oxide', color: '#CD853F', type: 'compound' },
        
        // Metal hydroxides
        'Na+H2O': { symbol: 'NaOH', name: 'Sodium Hydroxide', color: '#FFB366', type: 'compound' },
        'H2O+Na': { symbol: 'NaOH', name: 'Sodium Hydroxide', color: '#FFB366', type: 'compound' },
        'K+H2O': { symbol: 'KOH', name: 'Potassium Hydroxide', color: '#FF99CC', type: 'compound' },
        'H2O+K': { symbol: 'KOH', name: 'Potassium Hydroxide', color: '#FF99CC', type: 'compound' }
    },

    // Attempt to combine elements
    attemptCombination(element1, element2) {
        console.log('[ChemistryCraft] Attempting combination:', element1, element2);
        
        const combinationKey = `${element1.symbol}+${element2.symbol}`;
        const result = this.combinations[combinationKey];

        if (result) {
            // Clear crafting slots
            const slot1 = document.getElementById('slot1');
            const slot2 = document.getElementById('slot2');
            slot1.innerHTML = '<div class="slot-label">Drop First Element</div>';
            slot2.innerHTML = '<div class="slot-label">Drop Second Element</div>';
            delete slot1.dataset.element;
            delete slot2.dataset.element;
            this.combineBtn.disabled = true;

            // Show result
            const resultArea = document.querySelector('.result-area .result-slot');
            const resultDiv = this.createElementDiv(result);
            resultDiv.draggable = false;
            resultArea.innerHTML = '';
            resultArea.appendChild(resultDiv);

            // Show success message
            this.showToast(`Successfully created ${result.name}!`);

            // Add to discoveries if not already discovered
            this.addDiscovery(result);
        } else {
            this.showToast('These elements cannot be combined.', true);
        }
    },

    // Add a discovery
    addDiscovery(element) {
        if (!element?.symbol || !element?.name) {
            console.error('[ChemistryCraft] Invalid element:', element);
            return;
        }

        // Check if already discovered
        if (this.hasDiscovery(element)) {
            console.log('[ChemistryCraft] Already discovered:', element.name);
            return;
        }

        // Require authentication
        if (!window.firebase?.auth()?.currentUser) {
            console.warn('[ChemistryCraft] Cannot add discovery: Not signed in');
            this.showToast('Please sign in to save discoveries!', true);
            return;
        }

        // Add to UI and save
        this.addDiscoveryToUI(element);
        this.saveDiscoveries();
    },

    // Add discovery to UI
    addDiscoveryToUI(element) {
        if (!this.discoveriesList) {
            console.error('[ChemistryCraft] No discoveries list available');
            return;
        }

        try {
            const discoveryItem = document.createElement('div');
            discoveryItem.className = 'discovery-item';
            discoveryItem.innerHTML = `
                <span class="element-symbol">${element.symbol || ''}</span>
                <span class="element-name">${element.name || ''}</span>
            `;
            
            this.discoveriesList.appendChild(discoveryItem);
            console.log('[ChemistryCraft] Added discovery to UI:', element.symbol);
        } catch (error) {
            console.error('[ChemistryCraft] Failed to add discovery to UI:', error);
        }
    },

    // Check if element is already discovered
    hasDiscovery(element) {
        if (!this.discoveriesList || !element?.symbol) {
            return false;
        }

        try {
            return Array.from(this.discoveriesList.querySelectorAll('.discovery-item'))
                .some(item => {
                    const symbolElement = item.querySelector('.element-symbol');
                    return symbolElement?.textContent === element.symbol;
                });
        } catch (error) {
            console.error('[ChemistryCraft] Error checking discovery:', error);
            return false;
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[ChemistryCraft] DOM ready, initializing basic features...');
    
    // Initialize core functionality immediately
    if (!ChemistryCraft.init()) {
        console.error('[ChemistryCraft] Failed to initialize');
        return;
    }

    // Handle both immediate and future Firebase initialization
    const setupFirebase = () => {
        if (!window.firebase?.auth) {
            console.warn('[ChemistryCraft] Firebase Auth not available');
            return;
        }

        console.log('[ChemistryCraft] Setting up Firebase auth listener...');
        window.firebase.auth().onAuthStateChanged(async user => {
            console.log('[ChemistryCraft] Auth state changed:', user ? `User logged in: ${user.uid}` : 'No user');
            
            if (user?.uid) {
                console.log('[ChemistryCraft] Loading discoveries for user:', user.uid);
                await ChemistryCraft.loadSavedDiscoveries();
            } else {
                // Clear discoveries when user signs out
                if (ChemistryCraft.discoveriesList) {
                    ChemistryCraft.discoveriesList.innerHTML = '';
                }
            }
        });
    };

    // Try immediate setup if Firebase is already initialized
    if (window.firebase?.auth) {
        setupFirebase();
    }

    // Also listen for future Firebase initialization
    window.addEventListener('firebaseReady', () => {
        console.log('[ChemistryCraft] Firebase ready event received');
        setupFirebase();
    });
});