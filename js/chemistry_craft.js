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

        // Floating modal controls (visible anywhere on the page)
        try {
            // Remove any existing floating toggle button (we no longer use the fixed plus button)
            let toggle = document.getElementById('discoveriesToggleBtn');
            if (toggle) {
                try { toggle.remove(); } catch (e) { /* ignore */ }
            }
            toggle = null;

            // Modal backdrop
            let backdrop = document.getElementById('discoveriesModalBackdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.id = 'discoveriesModalBackdrop';
                backdrop.className = 'discoveries-modal-backdrop';
                backdrop.style.display = 'none';
                document.body.appendChild(backdrop);
            }

            // Modal dialog
            let modal = document.getElementById('discoveriesModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'discoveriesModal';
                modal.className = 'discoveries-modal';
                modal.setAttribute('role', 'dialog');
                modal.setAttribute('aria-modal', 'true');

                modal.innerHTML = `
                    <div class="discoveries-modal-header">
                        <h3>Discoveries</h3>
                        <button class="discoveries-modal-close icon-btn" type="button" aria-label="Close discoveries dialog">&times;</button>
                    </div>
                    <div class="discoveries-modal-body">
                        <div class="discoveries-controls modal-controls">
                            <!-- controls appended by JS -->
                        </div>
                    </div>
                `;

                modal.style.display = 'none';
                document.body.appendChild(modal);
            }

            // Put controls into the discoveries panel so they're rendered as the last element (very bottom)
            const controlsParent = document.querySelector('.discoveries-container') || document.querySelector('.discoveries-panel') || document.querySelector('.lab-interface') || document.querySelector('main') || document.body;
            let controls = controlsParent.querySelector('.discoveries-controls.main-controls');
            if (!controls) {
                controls = document.createElement('div');
                controls.className = 'discoveries-controls main-controls';

                // Prefer appending into the actual discoveries panel that contains the discoveriesList
                let panelEl = null;
                if (this.discoveriesList) {
                    panelEl = this.discoveriesList.closest('.discoveries-panel, .discoveries-container');
                }

                if (panelEl) {
                    // append as last child so it appears at the very bottom of the panel (blue area)
                    panelEl.appendChild(controls);
                } else if (this.discoveriesList && this.discoveriesList.parentElement === controlsParent) {
                    // fallback: insert after discoveriesList
                    controlsParent.insertBefore(controls, this.discoveriesList.nextSibling);
                } else {
                    // fallback: append to the chosen parent container
                    controlsParent.appendChild(controls);
                }
            }

            // Export button (create or move existing)
            let exportBtn = document.getElementById('exportDiscoveriesBtn');
            if (!exportBtn) {
                exportBtn = document.createElement('button');
                exportBtn.id = 'exportDiscoveriesBtn';
                exportBtn.className = 'icon-btn export-btn';
                exportBtn.type = 'button';
                exportBtn.title = 'Export discoveries';
                exportBtn.setAttribute('aria-label', 'Export discoveries');
                exportBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M12 3v10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 7l4-4 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21 21H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`;
            }
            // Move into main controls if not already
            if (exportBtn.parentElement !== controls) controls.appendChild(exportBtn);

            exportBtn.removeEventListener?.('click', null);
            exportBtn.addEventListener('click', async () => {
                await this.exportDiscoveries();
            });

            // Import input + label (create or move existing)
            let importInput = document.getElementById('importDiscoveriesInput');
            if (!importInput) {
                importInput = document.createElement('input');
                importInput.type = 'file';
                importInput.accept = 'application/json';
                importInput.id = 'importDiscoveriesInput';
                importInput.style.display = 'none';
            }
            if (importInput.parentElement !== controls) controls.appendChild(importInput);

            // Try to find an existing import label inside the controls parent first
            let importLabel = controls.querySelector('.import-label') || controlsParent.querySelector('.import-label');
            if (!importLabel) {
                importLabel = document.createElement('label');
                importLabel.htmlFor = 'importDiscoveriesInput';
                importLabel.className = 'import-label icon-btn';
                importLabel.title = 'Import discoveries';
                importLabel.setAttribute('aria-label', 'Import discoveries');
                importLabel.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M12 21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 13l-4 4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21 21H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`;
            }
            if (importLabel.parentElement !== controls) controls.appendChild(importLabel);

            importInput.removeEventListener?.('change', null);
            importInput.addEventListener('change', async (ev) => {
                const file = ev.target.files && ev.target.files[0];
                if (!file) return;
                await this.importDiscoveriesFromFile(file);
                importInput.value = '';
            });

            // Open/close behaviors
            const openModal = () => {
                backdrop.style.display = 'block';
                modal.style.display = 'block';
                // small delay for CSS transitions if present
                setTimeout(() => modal.classList.add('open'), 10);
                setTimeout(() => backdrop.classList.add('open'), 10);
            };

            const closeModal = () => {
                modal.classList.remove('open');
                backdrop.classList.remove('open');
                setTimeout(() => {
                    modal.style.display = 'none';
                    backdrop.style.display = 'none';
                }, 200);
            };

            // Floating toggle removed; keep modal/backdrop open/close handlers
            backdrop.addEventListener('click', closeModal);
            modal.querySelector('.discoveries-modal-close')?.addEventListener('click', closeModal);
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

        } catch (e) {
            console.warn('[ChemistryCraft] Failed to add floating modal controls:', e);
        }

        // Setup drag and drop for crafting slots (single registration)
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

    // Get current discoveries
    async getDiscoveries() {
        if (!this.discoveriesList) return [];
        
        return Array.from(this.discoveriesList.querySelectorAll('.discovery-item'))
            .map(item => ({
                symbol: item.querySelector('.element-symbol')?.textContent || '',
                name: item.querySelector('.element-name')?.textContent || '',
                dateDiscovered: item.dataset.dateDiscovered || new Date().toISOString()
            }))
            .filter(d => d.symbol && d.name);
    },

    // Restore discoveries from backup
    async restoreDiscoveries(discoveries) {
        if (!Array.isArray(discoveries) || !discoveries.length) return;
        
        console.log('[ChemistryCraft] Restoring', discoveries.length, 'discoveries from backup');
        
        // Clear current list
        if (this.discoveriesList) {
            this.discoveriesList.innerHTML = '';
        }
        
        // Add each discovery back
        for (const discovery of discoveries) {
            await this.addDiscoveryToUI(discovery);
        }
        
        // Save to Firestore
        await this.saveDiscoveries();
    },

    // Load saved discoveries from cloud
    async loadSavedDiscoveries() {
        // Validate environment
        if (!window.firebase || !window.firebase.auth || !window.firebase.firestore) {
            console.error('[ChemistryCraft] Firebase not available (auth/firestore required)');
            return;
        }

        if (!this.discoveriesList) {
            console.error('[ChemistryCraft] No discoveries list container found');
            return;
        }

        try {
            // Clear existing UI first (don't write to Firestore here)
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
            const userDocRef = db.collection('progress').doc(currentUser.uid);

            // Try to read from progress collection
            let discoveries = [];
            try {
                const doc = await userDocRef.get();
                if (doc.exists && Array.isArray(doc.data()?.discoveries)) {
                    discoveries = doc.data().discoveries;
                    console.log('[ChemistryCraft] Loaded from progress collection:', discoveries.length);
                }
            } catch (err) {
                console.warn('[ChemistryCraft] Error reading progress doc (will try fallback sources):', err);
            }

            // If none found, try discoveries collection
            if (discoveries.length === 0) {
                try {
                    const discoveryDoc = await db.collection('discoveries').doc(currentUser.uid).get();
                    if (discoveryDoc.exists && Array.isArray(discoveryDoc.data()?.discoveries)) {
                        discoveries = discoveryDoc.data().discoveries;
                        console.log('[ChemistryCraft] Loaded from discoveries collection:', discoveries.length);
                    }
                } catch (err) {
                    console.warn('[ChemistryCraft] Error reading discoveries doc:', err);
                }
            }

            // If still none, try local storage backup — but DO NOT auto-write an empty array to Firestore.
            if (discoveries.length === 0) {
                const localBackup = localStorage.getItem('chemulab_discoveries_backup_' + currentUser.uid);
                if (localBackup) {
                    try {
                        const backupData = JSON.parse(localBackup);
                        if (Array.isArray(backupData) && backupData.length > 0) {
                            discoveries = backupData;
                            console.log('[ChemistryCraft] Loaded from local backup:', discoveries.length);

                            // Optionally restore recovered data back to Firestore, but do it carefully (merge)
                            try {
                                await userDocRef.set({
                                    discoveries: discoveries,
                                    restored: true,
                                    restoredFrom: 'local_backup',
                                    lastUpdated: new Date().toISOString()
                                }, { merge: true });
                                console.log('[ChemistryCraft] Restored backup to Firestore (merged)');
                            } catch (e) {
                                console.warn('[ChemistryCraft] Failed to restore backup to Firestore:', e);
                            }
                        }
                    } catch (e) {
                        console.error('[ChemistryCraft] Error parsing local backup:', e);
                    }
                } else {
                    console.log('[ChemistryCraft] No cloud discoveries and no local backup found — not overwriting cloud data');
                }
            }

            // If still nothing, do not auto-create/overwrite the user's document with an empty discoveries array.
            if (discoveries.length === 0) {
                console.log('[ChemistryCraft] No discoveries found in any source (skipping automatic initialization to avoid overwriting existing data).');
                return;
            }

            // Display discoveries (dedupe by symbol)
            let loadedCount = 0;
            const seenSymbols = new Set();

            for (const discovery of discoveries) {
                if (discovery?.symbol && discovery?.name && !seenSymbols.has(discovery.symbol)) {
                    seenSymbols.add(discovery.symbol);
                    this.addDiscoveryToUI({
                        symbol: discovery.symbol,
                        name: discovery.name,
                        dateDiscovered: discovery.dateDiscovered || new Date().toISOString()
                    });
                    loadedCount++;
                } else {
                    console.warn('[ChemistryCraft] Skipping invalid or duplicate discovery:', discovery);
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

    // Save discoveries to storage with verification and auto-recovery
    async saveDiscoveries() {
        // Validate environment
        if (!window.firebase?.auth) {
            console.error('[ChemistryCraft] Firebase Auth not available');
            return false;
        }

        if (!window.firebase?.firestore) {
            console.error('[ChemistryCraft] Firestore not available');
            return false;
        }

        if (!this.discoveriesList) {
            console.error('[ChemistryCraft] No discoveries list container found');
            return false;
        }

        // Create immediate backup before saving
        const backupSuccess = await this.createBackup(true);
        if (!backupSuccess) {
            console.warn('[ChemistryCraft] Failed to create backup before save');
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

            console.log('[ChemistryCraft] Current discoveries to save:', discoveries);

            // Get both documents
            const [progressDoc, discoveryDoc] = await Promise.all([
                db.collection('progress').doc(currentUser.uid).get(),
                db.collection('discoveries').doc(currentUser.uid).get()
            ]);

            // Gather existing discoveries from both collections
            let existingDiscoveries = [];
            if (progressDoc.exists && Array.isArray(progressDoc.data()?.discoveries)) {
                existingDiscoveries = [...existingDiscoveries, ...progressDoc.data().discoveries];
            }
            if (discoveryDoc.exists && Array.isArray(discoveryDoc.data()?.discoveries)) {
                existingDiscoveries = [...existingDiscoveries, ...discoveryDoc.data().discoveries];
            }

            console.log('[ChemistryCraft] Existing discoveries:', existingDiscoveries.length);

            // Create a map to deduplicate discoveries
            const discoveryMap = new Map();

            // Add existing discoveries to map
            existingDiscoveries.forEach(d => {
                if (d && d.symbol) {
                    discoveryMap.set(d.symbol, {
                        ...d,
                        lastUpdated: d.lastUpdated || d.dateDiscovered || new Date().toISOString()
                    });
                }
            });

            // Add new discoveries with conflict-resolution by lastUpdated (newer wins)
            discoveries.forEach(d => {
                if (!(d && d.symbol)) return;

                const existing = discoveryMap.get(d.symbol);
                const newEntry = {
                    ...d,
                    dateDiscovered: d.dateDiscovered || new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                };

                if (!existing) {
                    discoveryMap.set(d.symbol, newEntry);
                } else {
                    try {
                        const existTime = new Date(existing.lastUpdated).getTime();
                        const newTime = new Date(newEntry.lastUpdated).getTime();
                        if (isNaN(existTime) || newTime >= existTime) {
                            discoveryMap.set(d.symbol, newEntry);
                        } // else keep existing
                    } catch (e) {
                        discoveryMap.set(d.symbol, newEntry);
                    }
                }
            });

            // Convert map back to array
            const mergedDiscoveries = Array.from(discoveryMap.values());
            console.log('[ChemistryCraft] Merged discoveries:', mergedDiscoveries.length);

            console.log('[ChemistryCraft] Merging discoveries:', {
                existing: existingDiscoveries.length,
                new: discoveries.length,
                merged: mergedDiscoveries.length
            });

            // Start batch write
            const batch = db.batch();

            // Prepare the data to save
            const saveData = {
                discoveries: mergedDiscoveries,
                lastUpdated: new Date().toISOString()
            };

            // Add created timestamp if it doesn't exist
            if (!progressDoc.exists || !progressDoc.data()?.created) {
                saveData.created = new Date().toISOString();
            }

            // Save to progress collection
            batch.set(userDoc, saveData, { merge: true });

            // Save to discoveries collection
            batch.set(db.collection('discoveries').doc(currentUser.uid), saveData, { merge: true });

            // Save local backup
            localStorage.setItem('chemulab_discoveries_backup_' + currentUser.uid, 
                JSON.stringify(mergedDiscoveries));

            // Commit the batch
            await batch.commit();

            console.log('[ChemistryCraft] Successfully saved discoveries:', {
                total: mergedDiscoveries.length,
                new: discoveries.length
            });

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
            // Check if this discovery already exists
            const existing = Array.from(this.discoveriesList.querySelectorAll('.discovery-item'))
                .find(item => item.querySelector('.element-symbol')?.textContent === element.symbol);
            
            if (existing) {
                console.log('[ChemistryCraft] Discovery already exists in UI:', element.symbol);
                return;
            }

            const discoveryItem = document.createElement('div');
            discoveryItem.className = 'discovery-item';
            
            // Store discovery date
            const now = new Date().toISOString();
            discoveryItem.dataset.dateDiscovered = element.dateDiscovered || now;
            discoveryItem.dataset.lastUpdated = now;
            
            discoveryItem.innerHTML = `
                <span class="element-symbol">${element.symbol || ''}</span>
                <span class="element-name">${element.name || ''}</span>
            `;
            
            this.discoveriesList.appendChild(discoveryItem);
            console.log('[ChemistryCraft] Added discovery to UI:', element.symbol);
            
            // Save to storage
            this.saveDiscoveries().catch(err => {
                console.error('[ChemistryCraft] Failed to save discovery:', err);
                this.showToast('Failed to save discoveries. Please try again.', true);
            });
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
    },

    // Get current discoveries
    async getDiscoveries() {
        if (!this.discoveriesList) return [];
        
        return Array.from(this.discoveriesList.querySelectorAll('.discovery-item'))
            .map(item => ({
                symbol: item.querySelector('.element-symbol')?.textContent || '',
                name: item.querySelector('.element-name')?.textContent || '',
                dateDiscovered: item.dataset.dateDiscovered || new Date().toISOString()
            }))
            .filter(d => d.symbol && d.name);
    },

    // Create a backup of current discoveries with versioning
    async createBackup(force = false) {
        const user = window.firebase?.auth?.currentUser;
        if (!user) return;
        
        const discoveries = await this.getDiscoveries();
        if (!discoveries || discoveries.length === 0) return;

        try {
            // Store current backup
            const backupKey = `chemulab_discoveries_backup_${user.uid}`;
            localStorage.setItem(backupKey, JSON.stringify(discoveries));
            
            // Store a daily backup
            const now = new Date();
            const dailyBackupKey = `chemulab_discoveries_backup_${user.uid}_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}`;
            
            // Only create daily backup if it doesn't exist or forced
            if (force || !localStorage.getItem(dailyBackupKey)) {
                localStorage.setItem(dailyBackupKey, JSON.stringify(discoveries));
                console.log('[ChemistryCraft] Created daily backup:', dailyBackupKey);
            }
            
            // Store a weekly backup
            const weeklyBackupKey = `chemulab_discoveries_backup_${user.uid}_${now.getFullYear()}_${now.getMonth()}_${Math.floor(now.getDate()/7)}`;
            
            // Only create weekly backup if it doesn't exist or forced
            if (force || !localStorage.getItem(weeklyBackupKey)) {
                localStorage.setItem(weeklyBackupKey, JSON.stringify(discoveries));
                console.log('[ChemistryCraft] Created weekly backup:', weeklyBackupKey);
            }
            
            console.log('[ChemistryCraft] Created backups of', discoveries.length, 'discoveries');
            return true;
        } catch (error) {
            console.error('[ChemistryCraft] Backup creation failed:', error);
            return false;
        }
    },

    // Restore discoveries from backup
    async restoreFromBackup() {
        const user = firebase.auth().currentUser;
        if (!user) return false;
        
        const backup = localStorage.getItem('chemulab_discoveries_backup_' + user.uid);
        if (!backup) return false;
        
        try {
            const discoveries = JSON.parse(backup);
            if (!Array.isArray(discoveries) || discoveries.length === 0) return false;
            
            console.log('[ChemistryCraft] Restoring', discoveries.length, 'discoveries from backup');
            
            // Clear current list
            if (this.discoveriesList) {
                this.discoveriesList.innerHTML = '';
            }
            
            // Add each discovery back
            for (const discovery of discoveries) {
                this.addDiscoveryToUI(discovery);
            }
            
            // Save to Firestore
            await this.saveDiscoveries();
            return true;
        } catch (e) {
            console.error('[ChemistryCraft] Error restoring from backup:', e);
            return false;
        }
    },

    // Export current discoveries as a downloadable JSON file
    async exportDiscoveries() {
        try {
            const user = window.firebase?.auth?.currentUser;
            const discoveries = await this.getDiscoveries();
            if (!discoveries || discoveries.length === 0) {
                this.showToast('No discoveries to export', true);
                return false;
            }

            const payload = {
                exportedAt: new Date().toISOString(),
                uid: user?.uid || null,
                discoveries: discoveries
            };

            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const stamp = new Date().toISOString().replace(/[:.]/g, '-');
            a.download = `chemulab_discoveries_${user?.uid || 'anon'}_${stamp}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            this.showToast('Discoveries exported');
            return true;
        } catch (err) {
            console.error('[ChemistryCraft] Export failed:', err);
            this.showToast('Export failed', true);
            return false;
        }
    },

    // Import discoveries from a File or parsed JSON object
    async importDiscoveriesFromFile(fileOrJson) {
        try {
            let parsed = null;

            if (typeof fileOrJson === 'string') {
                parsed = JSON.parse(fileOrJson);
            } else if (fileOrJson instanceof File) {
                parsed = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(JSON.parse(reader.result));
                    reader.onerror = () => reject(new Error('File read error'));
                    reader.readAsText(fileOrJson);
                });
            } else if (fileOrJson && typeof fileOrJson === 'object') {
                parsed = fileOrJson;
            }

            if (!parsed) throw new Error('No data parsed');

            const discoveries = Array.isArray(parsed.discoveries) ? parsed.discoveries : (Array.isArray(parsed) ? parsed : null);
            if (!discoveries || discoveries.length === 0) {
                this.showToast('Imported file contains no discoveries', true);
                return false;
            }

            // Validate items
            const valid = discoveries.filter(d => d && d.symbol && d.name).map(d => ({
                symbol: d.symbol,
                name: d.name,
                dateDiscovered: d.dateDiscovered || new Date().toISOString(),
                lastUpdated: d.lastUpdated || d.dateDiscovered || new Date().toISOString()
            }));

            if (!valid.length) {
                this.showToast('No valid discoveries to import', true);
                return false;
            }

            // Merge using conflict-resolution rule
            await this.resolveAndMergeDiscoveries(valid);
            this.showToast(`Imported ${valid.length} discoveries`);
            return true;
        } catch (err) {
            console.error('[ChemistryCraft] Import failed:', err);
            this.showToast('Import failed. See console.', true);
            return false;
        }
    },

    // Merge imported discoveries intelligently with cloud/local using lastUpdated timestamps
    async resolveAndMergeDiscoveries(importedDiscoveries) {
        if (!Array.isArray(importedDiscoveries) || importedDiscoveries.length === 0) return;

        // Normalize imported list into a map by symbol
        const importMap = new Map();
        importedDiscoveries.forEach(d => {
            importMap.set(d.symbol, {
                symbol: d.symbol,
                name: d.name,
                dateDiscovered: d.dateDiscovered || new Date().toISOString(),
                lastUpdated: d.lastUpdated || new Date().toISOString()
            });
        });

        // Load existing cloud and local data to merge
        const db = window.firebase?.firestore();
        const user = window.firebase?.auth?.currentUser;
        if (!user || !db) {
            // If not signed in, restore to UI only and save to local backup
            if (!this.discoveriesList) return;
            // Add to UI
            importMap.forEach(d => this.addDiscoveryToUI(d));
            await this.createBackup(true);
            return;
        }

        const [progressDoc, discoveryDoc] = await Promise.all([
            db.collection('progress').doc(user.uid).get().catch(() => null),
            db.collection('discoveries').doc(user.uid).get().catch(() => null)
        ]);

        let existing = [];
        if (progressDoc && progressDoc.exists && Array.isArray(progressDoc.data()?.discoveries)) existing = existing.concat(progressDoc.data().discoveries);
        if (discoveryDoc && discoveryDoc.exists && Array.isArray(discoveryDoc.data()?.discoveries)) existing = existing.concat(discoveryDoc.data().discoveries);

        const mergedMap = new Map();

        // Put existing into mergedMap
        existing.forEach(d => {
            if (!d || !d.symbol) return;
            mergedMap.set(d.symbol, {
                symbol: d.symbol,
                name: d.name,
                dateDiscovered: d.dateDiscovered || new Date().toISOString(),
                lastUpdated: d.lastUpdated || d.dateDiscovered || new Date().toISOString()
            });
        });

        // Merge imported entries resolving conflicts by newest lastUpdated
        importMap.forEach((imp, sym) => {
            const exist = mergedMap.get(sym);
            if (!exist) {
                mergedMap.set(sym, imp);
            } else {
                try {
                    const existTime = new Date(exist.lastUpdated).getTime();
                    const impTime = new Date(imp.lastUpdated).getTime();
                    if (isNaN(existTime) || impTime >= existTime) {
                        // Imported is newer or existing invalid -> replace
                        mergedMap.set(sym, imp);
                    } // else keep existing
                } catch (e) {
                    mergedMap.set(sym, imp);
                }
            }
        });

        const mergedArray = Array.from(mergedMap.values());

        // Update UI to reflect merged set
        if (this.discoveriesList) this.discoveriesList.innerHTML = '';
        mergedArray.forEach(d => this.addDiscoveryToUI(d));

        // Save merged results to cloud and local backup
        try {
            const saveData = { discoveries: mergedArray, lastUpdated: new Date().toISOString() };
            await db.collection('progress').doc(user.uid).set(saveData, { merge: true });
            await db.collection('discoveries').doc(user.uid).set(saveData, { merge: true });
            localStorage.setItem('chemulab_discoveries_backup_' + user.uid, JSON.stringify(mergedArray));
            console.log('[ChemistryCraft] Merged and saved imported discoveries:', mergedArray.length);
        } catch (e) {
            console.warn('[ChemistryCraft] Failed to save merged discoveries to cloud, saved to local backup only:', e);
            localStorage.setItem('chemulab_discoveries_backup_' + user.uid, JSON.stringify(mergedArray));
        }
    },
};

    // Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[ChemistryCraft] DOM ready, initializing basic features...');
    
    // Initialize core functionality immediately
    if (!ChemistryCraft.init()) {
        console.error('[ChemistryCraft] Failed to initialize');
        return;
    }

    // Set up periodic backups (every 5 minutes)
    const BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
    setInterval(() => {
        if (window.firebase?.auth()?.currentUser) {
            ChemistryCraft.createBackup()
                .catch(err => console.error('[ChemistryCraft] Periodic backup failed:', err));
        }
    }, BACKUP_INTERVAL);

    // Set up data verification timer (every 15 minutes)
    const VERIFY_INTERVAL = 15 * 60 * 1000; // 15 minutes
    setInterval(async () => {
        if (window.firebase?.auth()?.currentUser) {
            try {
                const currentDiscoveries = await ChemistryCraft.getDiscoveries();
                if (currentDiscoveries && currentDiscoveries.length > 0) {
                    // Verify cloud data matches local
                    const db = window.firebase.firestore();
                    const userDoc = await db.collection('progress')
                        .doc(window.firebase.auth().currentUser.uid)
                        .get();
                    
                    const cloudDiscoveries = userDoc.data()?.discoveries || [];
                    if (cloudDiscoveries.length !== currentDiscoveries.length) {
                        console.warn('[ChemistryCraft] Data verification failed - attempting recovery');
                        await ChemistryCraft.saveDiscoveries();
                    }
                }
            } catch (err) {
                console.error('[ChemistryCraft] Data verification failed:', err);
            }
        }
    }, VERIFY_INTERVAL);    // Handle both immediate and future Firebase initialization
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
                // Add a small delay to ensure Firestore is ready
                await new Promise(resolve => setTimeout(resolve, 1000));
                await ChemistryCraft.loadSavedDiscoveries();
                
                // Verify the load was successful
                const discoveries = await ChemistryCraft.getDiscoveries();
                console.log('[ChemistryCraft] Loaded discoveries count:', discoveries?.length || 0);
                
                if (!discoveries || discoveries.length === 0) {
                    // Try to recover from backup in localStorage
                    const localBackup = localStorage.getItem('chemulab_discoveries_backup_' + user.uid);
                    if (localBackup) {
                        const backupData = JSON.parse(localBackup);
                        await ChemistryCraft.restoreDiscoveries(backupData);
                    }
                }
            } else {
                // Before clearing, backup the current discoveries
                if (ChemistryCraft.discoveriesList && firebase.auth().currentUser) {
                    const currentDiscoveries = await ChemistryCraft.getDiscoveries();
                    if (currentDiscoveries && currentDiscoveries.length > 0) {
                        localStorage.setItem('chemulab_discoveries_backup_' + firebase.auth().currentUser.uid, 
                            JSON.stringify(currentDiscoveries));
                    }
                }
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