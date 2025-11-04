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
        
        // Get UI elements
        this.elementGrid = document.getElementById('elementGrid');
        this.combineBtn = document.getElementById('combineBtn');
        this.resultArea = document.getElementById('resultArea');
        this.discoveriesList = document.getElementById('discoveriesList');
        this.pendingDiscoveriesList = document.getElementById('pendingDiscoveriesList');
        this.searchInput = document.getElementById('elementSearch');

        // Verify UI elements exist
        if (!this.elementGrid || !this.combineBtn || !this.resultArea || !this.searchInput) {
            console.error('[ChemistryCraft] Missing required UI elements');
            return false;
        }

        // Verify discoveries lists exist
        if (!this.discoveriesList || !this.pendingDiscoveriesList) {
            console.error('[ChemistryCraft] Missing discoveries lists');
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

    // Load saved discoveries
    async loadSavedDiscoveries() {
        console.log('[ChemistryCraft] Loading saved discoveries...');
        try {
            // Clear existing lists
            this.discoveriesList.innerHTML = '';
            this.pendingDiscoveriesList.innerHTML = '';
            
            const currentUser = window.firebase?.auth()?.currentUser;
            const userId = currentUser?.uid || 'offline';
            
            // If user is logged in, load from Firebase first
            if (currentUser) {
                try {
                    const db = window.firebase.firestore();
                    const userRef = db.collection('users').doc(currentUser.uid);
                    const discoverySnapshot = await userRef.collection('discoveries').get();
                    
                    if (!discoverySnapshot.empty) {
                        const firebaseDiscoveries = [];
                        discoverySnapshot.forEach(doc => {
                            firebaseDiscoveries.push(doc.data());
                        });
                        
                        firebaseDiscoveries.forEach(element => {
                            this.addDiscoveryToUI(element, false);
                        });
                        // Update localStorage to match Firebase
                        localStorage.setItem(`chemulab_discoveries_${userId}`, JSON.stringify(firebaseDiscoveries));
                    }
                } catch (firebaseError) {
                    console.error('[ChemistryCraft] Firebase load error:', firebaseError);
                    this.showToast('Error loading discoveries from cloud', true);
                }
            }
            
            // Load from localStorage if no Firebase data or not logged in
            if (this.discoveriesList.children.length === 0) {
                const savedDiscoveries = localStorage.getItem(`chemulab_discoveries_${userId}`);
                if (savedDiscoveries) {
                    const discoveries = JSON.parse(savedDiscoveries);
                    discoveries.forEach(element => {
                        this.addDiscoveryToUI(element, false);
                    });
                }
            }
            
            // Always load pending discoveries for current user
            const pendingDiscoveries = localStorage.getItem(`chemulab_pending_${userId}`);
            if (pendingDiscoveries) {
                const discoveries = JSON.parse(pendingDiscoveries);
                discoveries.forEach(element => {
                    this.addDiscoveryToUI(element, true);
                });
            }
        } catch (error) {
            console.error('[ChemistryCraft] Error loading discoveries:', error);
        }
    },

    // Save discoveries to storage
    async saveDiscoveries(isPending = false) {
        const currentUser = window.firebase?.auth()?.currentUser;
        const userId = currentUser?.uid || 'offline';
        const key = `chemulab_${isPending ? 'pending' : 'discoveries'}_${userId}`;
        const list = isPending ? this.pendingDiscoveriesList : this.discoveriesList;
        const discoveries = [];
        
        list.querySelectorAll('.discovery-item').forEach(item => {
            discoveries.push({
                symbol: item.querySelector('.element-symbol').textContent,
                name: item.querySelector('.element-name').textContent,
                timestamp: new Date().toISOString()
            });
        });

        // Always save to user-specific localStorage for offline access
        localStorage.setItem(key, JSON.stringify(discoveries));

        // If we're not in pending mode and we have a logged-in user, save via DiscoveryService
        if (!isPending && currentUser) {
            try {
                console.log('[ChemistryCraft] Delegating save to DiscoveryService for user:', currentUser.uid);
                // Build minimal userData object expected by DiscoveryService
                const username = currentUser.email || currentUser.uid;
                const userData = {
                    credentials: { username },
                    discoveries: discoveries.map(d => ({ id: String(d.symbol), symbol: d.symbol, name: d.name, dateDiscovered: d.timestamp }))
                };

                // Use the project's DiscoveryService to perform the save (handles Firebase rules/collection)
                if (typeof DiscoveryService !== 'undefined' && DiscoveryService.saveUserData) {
                    await DiscoveryService.saveUserData(username, userData);
                    console.log('[ChemistryCraft] DiscoveryService.saveUserData completed');
                    this.showToast('Discoveries saved to cloud!');
                } else {
                    // Fallback: attempt direct Firestore write to progress collection (project default)
                    console.warn('[ChemistryCraft] DiscoveryService unavailable, falling back to direct Firestore write');
                    const db = window.firebase.firestore();
                    await db.collection('progress').doc(currentUser.uid).set({ discoveries }, { merge: true });
                    this.showToast('Discoveries saved to cloud!');
                }
            } catch (error) {
                console.error('[ChemistryCraft] Error saving to cloud via DiscoveryService or Firestore:', error);
                this.showToast('Failed to save discovery to cloud', true);
                // Save to pending if cloud save fails
                if (!isPending) {
                    discoveries.forEach(d => this.addDiscoveryToUI(d, true));
                    // Ensure pending local save is user-specific
                    await this.saveDiscoveries(true);
                }
            }
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
        // Check if already discovered
        if (this.hasDiscovery(element)) {
            console.log('[ChemistryCraft] Already discovered:', element.name);
            return;
        }

        // Add to appropriate list
        const isPending = !window.firebase || !window.firebase.auth || !window.firebase.auth().currentUser;
        this.addDiscoveryToUI(element, isPending);

        // Save to storage
        this.saveDiscoveries(isPending);
    },

    // Add discovery to UI
    addDiscoveryToUI(element, isPending = false) {
        const discoveryItem = document.createElement('div');
        discoveryItem.className = 'discovery-item';
        discoveryItem.innerHTML = `
            <span class="element-symbol">${element.symbol}</span>
            <span class="element-name">${element.name}</span>
        `;
        
        if (isPending) {
            this.pendingDiscoveriesList.appendChild(discoveryItem);
        } else {
            this.discoveriesList.appendChild(discoveryItem);
        }
    },

    // Check if element is already discovered
    hasDiscovery(element) {
        const checkList = (list) => {
            return Array.from(list.querySelectorAll('.discovery-item')).some(item => 
                item.querySelector('.element-symbol').textContent === element.symbol
            );
        };

        return checkList(this.discoveriesList) || checkList(this.pendingDiscoveriesList);
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

    // Set up Firebase-dependent features when ready
    window.addEventListener('firebaseReady', () => {
        console.log('[ChemistryCraft] Firebase ready, setting up auth features...');

        // Listen for auth state changes
        firebase.auth().onAuthStateChanged(user => {
            console.log('[ChemistryCraft] Auth state changed:', user ? 'User logged in' : 'No user');
            // Reload discoveries when auth state changes
            ChemistryCraft.loadSavedDiscoveries();
        });
    });
});