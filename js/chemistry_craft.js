// Initial elements available to the user
const initialElements = [
    // Nonmetals
    { symbol: 'H', name: 'Hydrogen', color: '#E6E6E6', type: 'nonmetal' },
    { symbol: 'C', name: 'Carbon', color: '#666666', type: 'nonmetal' },
    { symbol: 'N', name: 'Nitrogen', color: '#99CCFF', type: 'nonmetal' },
    { symbol: 'O', name: 'Oxygen', color: '#FF9999', type: 'nonmetal' },
    { symbol: 'P', name: 'Phosphorus', color: '#FF9966', type: 'nonmetal' },
    { symbol: 'S', name: 'Sulfur', color: '#FFFF00', type: 'nonmetal' },
    { symbol: 'Se', name: 'Selenium', color: '#FFA07A', type: 'nonmetal' },

    // Noble Gases
    { symbol: 'He', name: 'Helium', color: '#FFE5CC', type: 'noble-gas' },
    { symbol: 'Ne', name: 'Neon', color: '#FF99CC', type: 'noble-gas' },
    { symbol: 'Ar', name: 'Argon', color: '#FF99CC', type: 'noble-gas' },
    { symbol: 'Kr', name: 'Krypton', color: '#FF99CC', type: 'noble-gas' },
    { symbol: 'Xe', name: 'Xenon', color: '#FF99CC', type: 'noble-gas' },
    { symbol: 'Rn', name: 'Radon', color: '#FF99CC', type: 'noble-gas' },
    { symbol: 'Og', name: 'Oganesson', color: '#FF99CC', type: 'noble-gas' },

    // Halogens
    { symbol: 'F', name: 'Fluorine', color: '#CCFF99', type: 'halogen' },
    { symbol: 'Cl', name: 'Chlorine', color: '#CCFF99', type: 'halogen' },
    { symbol: 'Br', name: 'Bromine', color: '#CCFF99', type: 'halogen' },
    { symbol: 'I', name: 'Iodine', color: '#CCFF99', type: 'halogen' },
    { symbol: 'At', name: 'Astatine', color: '#CCFF99', type: 'halogen' },
    { symbol: 'Ts', name: 'Tennessine', color: '#CCFF99', type: 'halogen' },

    // Alkali Metals
    { symbol: 'Li', name: 'Lithium', color: '#FF9999', type: 'alkali' },
    { symbol: 'Na', name: 'Sodium', color: '#FFB266', type: 'alkali' },
    { symbol: 'K', name: 'Potassium', color: '#FFB266', type: 'alkali' },
    { symbol: 'Rb', name: 'Rubidium', color: '#FFB266', type: 'alkali' },
    { symbol: 'Cs', name: 'Caesium', color: '#FFB266', type: 'alkali' },
    { symbol: 'Fr', name: 'Francium', color: '#FFB266', type: 'alkali' },

    // Alkaline Earth Metals
    { symbol: 'Be', name: 'Beryllium', color: '#FFD700', type: 'alkaline-earth' },
    { symbol: 'Mg', name: 'Magnesium', color: '#FFD700', type: 'alkaline-earth' },
    { symbol: 'Ca', name: 'Calcium', color: '#FFD700', type: 'alkaline-earth' },
    { symbol: 'Sr', name: 'Strontium', color: '#FFD700', type: 'alkaline-earth' },
    { symbol: 'Ba', name: 'Barium', color: '#FFD700', type: 'alkaline-earth' },
    { symbol: 'Ra', name: 'Radium', color: '#FFD700', type: 'alkaline-earth' },

    // Transition Metals
    { symbol: 'Sc', name: 'Scandium', color: '#CC9999', type: 'transition' },
    { symbol: 'Ti', name: 'Titanium', color: '#CC9999', type: 'transition' },
    { symbol: 'V', name: 'Vanadium', color: '#CC9999', type: 'transition' },
    { symbol: 'Cr', name: 'Chromium', color: '#CC9999', type: 'transition' },
    { symbol: 'Mn', name: 'Manganese', color: '#CC9999', type: 'transition' },
    { symbol: 'Fe', name: 'Iron', color: '#CC9999', type: 'transition' },
    { symbol: 'Co', name: 'Cobalt', color: '#CC9999', type: 'transition' },
    { symbol: 'Ni', name: 'Nickel', color: '#CC9999', type: 'transition' },
    { symbol: 'Cu', name: 'Copper', color: '#FF9966', type: 'transition' },
    { symbol: 'Zn', name: 'Zinc', color: '#98FF98', type: 'transition' },
    { symbol: 'Y', name: 'Yttrium', color: '#CC9999', type: 'transition' },
    { symbol: 'Zr', name: 'Zirconium', color: '#CC9999', type: 'transition' },
    { symbol: 'Nb', name: 'Niobium', color: '#CC9999', type: 'transition' },
    { symbol: 'Mo', name: 'Molybdenum', color: '#CC9999', type: 'transition' },
    { symbol: 'Tc', name: 'Technetium', color: '#CC9999', type: 'transition' },
    { symbol: 'Ru', name: 'Ruthenium', color: '#CC9999', type: 'transition' },
    { symbol: 'Rh', name: 'Rhodium', color: '#CC9999', type: 'transition' },
    { symbol: 'Pd', name: 'Palladium', color: '#CC9999', type: 'transition' },
    { symbol: 'Ag', name: 'Silver', color: '#C0C0C0', type: 'transition' },
    { symbol: 'Cd', name: 'Cadmium', color: '#CC9999', type: 'transition' },
    { symbol: 'Hf', name: 'Hafnium', color: '#CC9999', type: 'transition' },
    { symbol: 'Ta', name: 'Tantalum', color: '#CC9999', type: 'transition' },
    { symbol: 'W', name: 'Tungsten', color: '#CC9999', type: 'transition' },
    { symbol: 'Re', name: 'Rhenium', color: '#CC9999', type: 'transition' },
    { symbol: 'Os', name: 'Osmium', color: '#CC9999', type: 'transition' },
    { symbol: 'Ir', name: 'Iridium', color: '#CC9999', type: 'transition' },
    { symbol: 'Pt', name: 'Platinum', color: '#E5E4E2', type: 'transition' },
    { symbol: 'Au', name: 'Gold', color: '#FFD700', type: 'transition' },
    { symbol: 'Hg', name: 'Mercury', color: '#B8B8B8', type: 'transition' },

    // Post-transition Metals
    { symbol: 'Al', name: 'Aluminum', color: '#BCC6CC', type: 'post-transition' },
    { symbol: 'Ga', name: 'Gallium', color: '#BCC6CC', type: 'post-transition' },
    { symbol: 'In', name: 'Indium', color: '#BCC6CC', type: 'post-transition' },
    { symbol: 'Sn', name: 'Tin', color: '#BCC6CC', type: 'post-transition' },
    { symbol: 'Tl', name: 'Thallium', color: '#BCC6CC', type: 'post-transition' },
    { symbol: 'Pb', name: 'Lead', color: '#BCC6CC', type: 'post-transition' },
    { symbol: 'Bi', name: 'Bismuth', color: '#BCC6CC', type: 'post-transition' },
    { symbol: 'Po', name: 'Polonium', color: '#BCC6CC', type: 'post-transition' },
    { symbol: 'Nh', name: 'Nihonium', color: '#BCC6CC', type: 'post-transition' },
    { symbol: 'Fl', name: 'Flerovium', color: '#BCC6CC', type: 'post-transition' },
    { symbol: 'Mc', name: 'Moscovium', color: '#BCC6CC', type: 'post-transition' },
    { symbol: 'Lv', name: 'Livermorium', color: '#BCC6CC', type: 'post-transition' },

    // Metalloids
    { symbol: 'B', name: 'Boron', color: '#98FF98', type: 'metalloid' },
    { symbol: 'Si', name: 'Silicon', color: '#98FF98', type: 'metalloid' },
    { symbol: 'Ge', name: 'Germanium', color: '#98FF98', type: 'metalloid' },
    { symbol: 'As', name: 'Arsenic', color: '#98FF98', type: 'metalloid' },
    { symbol: 'Sb', name: 'Antimony', color: '#98FF98', type: 'metalloid' },
    { symbol: 'Te', name: 'Tellurium', color: '#98FF98', type: 'metalloid' },

    // Lanthanides
    { symbol: 'La', name: 'Lanthanum', color: '#FFBFFF', type: 'lanthanide' },
    { symbol: 'Ce', name: 'Cerium', color: '#FFBFFF', type: 'lanthanide' },
    { symbol: 'Pr', name: 'Praseodymium', color: '#FFBFFF', type: 'lanthanide' },
    { symbol: 'Nd', name: 'Neodymium', color: '#FFBFFF', type: 'lanthanide' },
    { symbol: 'Pm', name: 'Promethium', color: '#FFBFFF', type: 'lanthanide' },
    { symbol: 'Sm', name: 'Samarium', color: '#FFBFFF', type: 'lanthanide' },
    { symbol: 'Eu', name: 'Europium', color: '#FFBFFF', type: 'lanthanide' },
    { symbol: 'Gd', name: 'Gadolinium', color: '#FFBFFF', type: 'lanthanide' },
    { symbol: 'Tb', name: 'Terbium', color: '#FFBFFF', type: 'lanthanide' },
    { symbol: 'Dy', name: 'Dysprosium', color: '#FFBFFF', type: 'lanthanide' },
    { symbol: 'Ho', name: 'Holmium', color: '#FFBFFF', type: 'lanthanide' },
    { symbol: 'Er', name: 'Erbium', color: '#FFBFFF', type: 'lanthanide' },
    { symbol: 'Tm', name: 'Thulium', color: '#FFBFFF', type: 'lanthanide' },
    { symbol: 'Yb', name: 'Ytterbium', color: '#FFBFFF', type: 'lanthanide' },
    { symbol: 'Lu', name: 'Lutetium', color: '#FFBFFF', type: 'lanthanide' },

    // Actinides
    { symbol: 'Ac', name: 'Actinium', color: '#FF99CC', type: 'actinide' },
    { symbol: 'Th', name: 'Thorium', color: '#FF99CC', type: 'actinide' },
    { symbol: 'Pa', name: 'Protactinium', color: '#FF99CC', type: 'actinide' },
    { symbol: 'U', name: 'Uranium', color: '#FF99CC', type: 'actinide' },
    { symbol: 'Np', name: 'Neptunium', color: '#FF99CC', type: 'actinide' },
    { symbol: 'Pu', name: 'Plutonium', color: '#FF99CC', type: 'actinide' },
    { symbol: 'Am', name: 'Americium', color: '#FF99CC', type: 'actinide' },
    { symbol: 'Cm', name: 'Curium', color: '#FF99CC', type: 'actinide' },
    { symbol: 'Bk', name: 'Berkelium', color: '#FF99CC', type: 'actinide' },
    { symbol: 'Cf', name: 'Californium', color: '#FF99CC', type: 'actinide' },
    { symbol: 'Es', name: 'Einsteinium', color: '#FF99CC', type: 'actinide' },
    { symbol: 'Fm', name: 'Fermium', color: '#FF99CC', type: 'actinide' },
    { symbol: 'Md', name: 'Mendelevium', color: '#FF99CC', type: 'actinide' },
    { symbol: 'No', name: 'Nobelium', color: '#FF99CC', type: 'actinide' },
    { symbol: 'Lr', name: 'Lawrencium', color: '#FF99CC', type: 'actinide' },

    // Superheavy Elements
    { symbol: 'Rf', name: 'Rutherfordium', color: '#CC9999', type: 'transition' },
    { symbol: 'Db', name: 'Dubnium', color: '#CC9999', type: 'transition' },
    { symbol: 'Sg', name: 'Seaborgium', color: '#CC9999', type: 'transition' },
    { symbol: 'Bh', name: 'Bohrium', color: '#CC9999', type: 'transition' },
    { symbol: 'Hs', name: 'Hassium', color: '#CC9999', type: 'transition' },
    { symbol: 'Mt', name: 'Meitnerium', color: '#CC9999', type: 'transition' },
    { symbol: 'Ds', name: 'Darmstadtium', color: '#CC9999', type: 'transition' },
    { symbol: 'Rg', name: 'Roentgenium', color: '#CC9999', type: 'transition' },
    { symbol: 'Cn', name: 'Copernicium', color: '#CC9999', type: 'transition' }
];

// Combination rules for elements
const combinationRules = {
    // Basic Combinations
    'H+O': { result: 'H2O', name: 'Water', description: 'The most essential compound for life' },
    'H+N': { result: 'NH3', name: 'Ammonia', description: 'A common cleaning compound' },
    'C+O': { result: 'CO2', name: 'Carbon Dioxide', description: 'The gas we exhale' },
    
    // Acids and Bases
    'H+Cl': { result: 'HCl', name: 'Hydrochloric Acid', description: 'A strong acid found in your stomach' },
    'H+F': { result: 'HF', name: 'Hydrofluoric Acid', description: 'A highly corrosive acid' },
    
    // Salts
    'Na+Cl': { result: 'NaCl', name: 'Table Salt', description: 'Common table salt used in cooking' },
    'K+Cl': { result: 'KCl', name: 'Potassium Chloride', description: 'Used as a salt substitute' },
    'Ca+Cl': { result: 'CaCl2', name: 'Calcium Chloride', description: 'Used for de-icing roads' },
    'Zn+I': { result: 'ZnI2', name: 'Zinc Iodide', description: 'A binary ionic compound' },
    
    // Oxides
    'Fe+O': { result: 'Fe2O3', name: 'Iron Oxide', description: 'Common rust' },
    'Al+O': { result: 'Al2O3', name: 'Aluminum Oxide', description: 'Used in sandpaper' },
    'Si+O': { result: 'SiO2', name: 'Silicon Dioxide', description: 'Found in sand and quartz' },
    'Ca+O': { result: 'CaO', name: 'Calcium Oxide', description: 'Also known as quicklime, used in cement' },
    'Mg+O': { result: 'MgO', name: 'Magnesium Oxide', description: 'Used in refractories and antacids' },
    
    // Compounds with Sulfur
    'H+S': { result: 'H2S', name: 'Hydrogen Sulfide', description: 'Smells like rotten eggs' },
    'Fe+S': { result: 'FeS', name: 'Iron Sulfide', description: 'A black mineral' },
    
    // Noble Gas Compounds (rare but possible)
    'Xe+F': { result: 'XeF2', name: 'Xenon Difluoride', description: 'A rare noble gas compound' },
    
    // Interesting Combinations
    'Cu+O': { result: 'CuO', name: 'Copper Oxide', description: 'Black oxide that forms on copper' },
    'Ag+Cl': { result: 'AgCl', name: 'Silver Chloride', description: 'Used in photography' },
    'Au+Cl': { result: 'AuCl3', name: 'Gold Chloride', description: 'Used in gold plating' },
    
    // Common Industrial Compounds
    'N+H': { result: 'NH3', name: 'Ammonia', description: 'Used in fertilizers' },
    'C+H': { result: 'CH4', name: 'Methane', description: 'The simplest hydrocarbon' },
    
    // Additional Binary Molecular Compounds
    'N+O': { result: 'NO', name: 'Nitrogen Monoxide', description: 'A colorless gas used in medicine' },
    'S+Cl': { result: 'S2Cl2', name: 'Disulfur Dichloride', description: 'Used in vulcanization of rubber' },
    'Cl+O': { result: 'Cl2O7', name: 'Dichlorine Heptoxide', description: 'A highly explosive oxide' },
    'C+Cl': { result: 'CCl4', name: 'Carbon Tetrachloride', description: 'Formerly used as a solvent' },
    'P+Cl': { result: 'PCl3', name: 'Phosphorus Trichloride', description: 'Used in organic synthesis' },
    'B+F': { result: 'BF3', name: 'Boron Trifluoride', description: 'A Lewis acid catalyst' },
    'Si+C': { result: 'SiC', name: 'Silicon Carbide', description: 'Known as carborundum, used as abrasive' }
};

// Keep track of discovered compounds in memory (backup to localStorage)
let discoveries = new Set();

// Initialize the interface
document.addEventListener('DOMContentLoaded', () => {
    console.log('[ChemistryCraft] Page loaded, initializing...');
    
    // CLEAN UP OLD CORRUPTED DISCOVERIES (like "Mo Mo")
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
        const userData = DiscoveryService.getUserDataLocal(currentUser.username);
        if (userData && userData.discoveries) {
            // Remove invalid discoveries
            userData.discoveries = userData.discoveries.filter(d => {
                return d.symbol && d.name && d.symbol.length <= 10;
            });
            DiscoveryService.saveUserData(currentUser.username, userData);
            console.log('[ChemistryCraft] Cleaned up corrupted discoveries');
        }

        // Show debug panels only for admin users
        const debugPanels = document.getElementById('debugPanels');
        if (debugPanels) {
            if (currentUser.isAdmin === true) {
                console.log('[ChemistryCraft] Admin user detected, showing debug panels');
                debugPanels.style.display = 'block';
            } else {
                console.log('[ChemistryCraft] Non-admin user, hiding debug panels');
                debugPanels.style.display = 'none';
            }
        }
    }

    const elementGrid = document.getElementById('elementGrid');
    const combineBtn = document.getElementById('combineBtn');
    const resultArea = document.getElementById('resultArea');
    const discoveriesList = document.getElementById('discoveriesList');
    const searchInput = document.getElementById('elementSearch');

    // Populate initial elements
    function populateElements(elements) {
        elementGrid.innerHTML = ''; // Clear existing elements
        elements.forEach(element => {
            const elementDiv = createElementDiv(element);
            elementGrid.appendChild(elementDiv);
        });
    }

    // Initial population
    populateElements(initialElements);

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredElements = initialElements.filter(element => 
            element.name.toLowerCase().includes(searchTerm) ||
            element.symbol.toLowerCase().includes(searchTerm) ||
            element.type.toLowerCase().includes(searchTerm)
        );
        populateElements(filteredElements);
    });

    // Handle combining elements
    combineBtn.addEventListener('click', combineElements);
    
    // LOAD SAVED DISCOVERIES
    loadSavedDiscoveries();
    
    // UPDATE DEBUG PANEL
    updateDebugPanel();
});

function createElementDiv(element) {
    const div = document.createElement('div');
    div.className = 'element';
    div.draggable = true;
    div.style.backgroundColor = element.color;
    div.innerHTML = `
        <div class="element-symbol">${element.symbol}</div>
        <div class="element-name">${element.name}</div>
    `;

    // Add drag event listeners
    div.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(element));
    });

    return div;
}

// Drag and drop handlers
function allowDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function drop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
    const slot = event.currentTarget;
    
    // Clear existing content
    slot.innerHTML = '';
    
    // Add the dropped element
    const elementDiv = createElementDiv(data);
    elementDiv.draggable = false;
    slot.appendChild(elementDiv);
    
    // Enable combine button if both slots are filled
    const slot1 = document.getElementById('slot1');
    const slot2 = document.getElementById('slot2');
    const combineBtn = document.getElementById('combineBtn');
    
    combineBtn.disabled = !(slot1.children.length && slot2.children.length);
}

function combineElements() {
    const slot1 = document.getElementById('slot1').firstElementChild;
    const slot2 = document.getElementById('slot2').firstElementChild;
    
    if (!slot1 || !slot2) return;
    
    const element1 = slot1.querySelector('.element-symbol').textContent;
    const element2 = slot2.querySelector('.element-symbol').textContent;
    
    console.log('[ChemistryCraft] Attempting combination:', element1, '+', element2);
    
    // Try both combinations (order doesn't matter)
    const combination = combinationRules[`${element1}+${element2}`] || combinationRules[`${element2}+${element1}`];
    
    if (combination) {
        displayResult(combination);
        console.log('[ChemistryCraft] Successful combination:', combination.result);
        
        // Check if it's a new discovery
        if (!discoveries.has(combination.result)) {
            console.log('[ChemistryCraft] New discovery found:', combination.result);
            discoveries.add(combination.result);
            addToDiscoveries(combination);
        } else {
            console.log('[ChemistryCraft] Already discovered:', combination.result);
        }
    } else {
        console.log('[ChemistryCraft] No valid combination for:', element1, '+', element2);
        displayNoResult();
    }
}

function displayResult(result) {
    const resultArea = document.getElementById('resultArea');
    resultArea.innerHTML = `
        <div class="result-slot">
            <div class="element" style="background-color: #4CAF50">
                <div class="element-symbol">${result.result}</div>
                <div class="element-name">${result.name}</div>
            </div>
            <div class="result-description">${result.description}</div>
        </div>
    `;
}

function displayNoResult() {
    const resultArea = document.getElementById('resultArea');
    resultArea.innerHTML = `
        <div class="result-slot">
            <div class="slot-label">No reaction occurred</div>
        </div>
    `;
}

function addToDiscoveries(discovery) {
    console.log('[ChemistryCraft] addToDiscoveries called with:', discovery);
    
    // 1. CHECK IF USER IS LOGGED IN
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
        console.error('[ChemistryCraft] ERROR: No user logged in, cannot save discovery');
        alert('Please log in to save discoveries');
        return;
    }
    console.log('[ChemistryCraft] Current user:', currentUser.username);

    // 2. CREATE DISCOVERY DATA OBJECT
    const discoveryData = {
        id: discovery.result,           // e.g., "CH4"
        symbol: discovery.result,       // e.g., "CH4"
        name: discovery.name,           // e.g., "Methane"
        completed: true,
        type: 'compound',
        description: discovery.description
    };
    
    console.log('[ChemistryCraft] Saving discovery to DiscoveryService:', discoveryData);

    // 3. SAVE TO DISCOVERYSERVICE (LOCALSTORAGE)
    try {
        DiscoveryService.addDiscovery(currentUser.username, discoveryData);
        console.log('[ChemistryCraft] ✓ Discovery saved successfully');
    } catch (error) {
        console.error('[ChemistryCraft] ✗ Failed to save discovery:', error);
        return;
    }

    // 4. UPDATE UI - ADD TO DISCOVERIES LIST
    const discoveriesList = document.getElementById('discoveriesList');
    if (!discoveriesList) {
        console.error('[ChemistryCraft] ERROR: discoveriesList element not found');
        return;
    }

    const discoveryItem = document.createElement('div');
    discoveryItem.className = 'discovery-item';
    discoveryItem.innerHTML = `
        <span><strong>${discovery.result}</strong> - ${discovery.name}</span>
    `;
    discoveriesList.appendChild(discoveryItem);
    
    console.log('[ChemistryCraft] ✓ Discovery added to UI');

    // 5. UPDATE DEBUG PANEL
    updateDebugPanel();
}

// Load user's saved discoveries when page loads
function loadSavedDiscoveries() {
    console.log('[ChemistryCraft] Loading saved discoveries...');
    
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
        console.log('[ChemistryCraft] No user logged in, skipping discovery load');
        return;
    }

    console.log('[ChemistryCraft] Loading discoveries for user:', currentUser.username);
    
    // Get user data from local DiscoveryService cache
    const userData = DiscoveryService.getUserDataLocal(currentUser.username);
    if (!userData || !userData.discoveries) {
        console.log('[ChemistryCraft] No saved discoveries found');
        return;
    }

    console.log('[ChemistryCraft] Found', userData.discoveries.length, 'saved discoveries');

    const discoveriesList = document.getElementById('discoveriesList');
    if (!discoveriesList) {
        console.error('[ChemistryCraft] ERROR: discoveriesList element not found');
        return;
    }

    // Clear the list first
    discoveriesList.innerHTML = '';

    // Add each discovery to the UI
    userData.discoveries.forEach(discovery => {
        // Add to the discoveries Set
        discoveries.add(discovery.symbol);
        
        // Create UI element
        const discoveryItem = document.createElement('div');
        discoveryItem.className = 'discovery-item';
        discoveryItem.innerHTML = `
            <span><strong>${discovery.symbol}</strong> - ${discovery.name}</span>
        `;
        discoveriesList.appendChild(discoveryItem);
        
        console.log('[ChemistryCraft] Loaded discovery:', discovery.symbol, '-', discovery.name);
    });

    console.log('[ChemistryCraft] ✓ All discoveries loaded successfully');
}

// Debug panel state
let isDebugExpanded = false;
let selectedUsername = null;

// Toggle debug panel expansion
function toggleDebugExpand() {
    const expandedSection = document.getElementById('debugExpanded');
    const toggleButton = document.querySelector('#debugPanels button');
    isDebugExpanded = !isDebugExpanded;
    expandedSection.style.display = isDebugExpanded ? 'block' : 'none';
    toggleButton.textContent = isDebugExpanded ? '▲' : '▼';
}

// Refresh the list of users in the debug panel
async function refreshUserList() {
    const select = document.getElementById('debugUserSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Loading users...</option>';
    
    try {
        // Get users from AuthService
        const users = AuthService.getAllUsers();
        if (!users || users.length === 0) {
            select.innerHTML = '<option value="">No users found</option>';
            return;
        }

        // Update select options
        select.innerHTML = '<option value="">Select user...</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username + (user.isAdmin ? ' (Admin)' : '');
            select.appendChild(option);
        });

        // Restore selection if any
        if (selectedUsername) {
            select.value = selectedUsername;
        }
    } catch (error) {
        console.error('Error loading users:', error);
        select.innerHTML = '<option value="">Error loading users</option>';
    }
}

// Load and display user data
function loadUserData(username) {
    selectedUsername = username;
    const dataDisplay = document.getElementById('debugUserData');
    if (!dataDisplay) return;
    
    if (!username) {
        dataDisplay.textContent = 'Select a user to view data';
        return;
    }

    try {
        const userData = AuthService.getAllUsers().find(u => u.username === username);
        if (!userData) {
            dataDisplay.textContent = 'User not found';
            return;
        }

    const userDiscoveries = DiscoveryService.getUserDataLocal(username);
        
        // Format user data for display
        const displayData = {
            Username: userData.username,
            'Admin Status': userData.isAdmin ? 'Yes' : 'No',
            'Registration Date': new Date(userData.registrationDate || Date.now()).toLocaleString(),
            'Discoveries': userDiscoveries?.discoveries?.length || 0
        };

        dataDisplay.innerHTML = Object.entries(displayData)
            .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
            .join('');
    } catch (error) {
        console.error('Error loading user data:', error);
        dataDisplay.textContent = 'Error loading user data';
    }
}

// Debug actions
function debugClearDiscoveries() {
    if (!selectedUsername) {
        alert('Please select a user first');
        return;
    }

    if (confirm(`Are you sure you want to clear all discoveries for ${selectedUsername}?`)) {
        try {
            let userData = DiscoveryService.getUserDataLocal(selectedUsername);
            if (userData) {
                userData.discoveries = [];
                DiscoveryService.saveUserData(selectedUsername, userData);
                loadUserData(selectedUsername); // Refresh display
                alert('Discoveries cleared successfully');
            }
        } catch (error) {
            console.error('Error clearing discoveries:', error);
            alert('Error clearing discoveries');
        }
    }
}

function debugResetProgress() {
    if (!selectedUsername) {
        alert('Please select a user first');
        return;
    }

    if (confirm(`Are you sure you want to reset all progress for ${selectedUsername}?`)) {
        try {
            // Clear discoveries
            let userData = DiscoveryService.getUserDataLocal(selectedUsername);
            if (userData) {
                userData.discoveries = [];
                userData.lastActive = Date.now();
                DiscoveryService.saveUserData(selectedUsername, userData);
            }
            loadUserData(selectedUsername); // Refresh display
            alert('Progress reset successfully');
        } catch (error) {
            console.error('Error resetting progress:', error);
            alert('Error resetting progress');
        }
    }
}

// Run migration for selected user (debug helper)
function debugRunMigration() {
    const username = selectedUsername || (AuthService.getCurrentUser() && AuthService.getCurrentUser().username);
    if (!username) {
        alert('Please select a user or sign in first');
        return;
    }

    try {
        const res = DiscoveryService.migrateLegacy(username);
        console.log('[ChemistryCraft] Migration result:', res);
        let msg = `Migration for ${username}:\n`;
        msg += `Found legacy: ${res.foundLegacy}\n`;
        if (res.foundLegacy) {
            msg += `Legacy key: ${res.legacyKey}\n`;
            msg += `Migrated discoveries: ${res.migratedCount}\n`;
        }
        if (res.error) msg += `Error: ${res.error}\n`;
        alert(msg);
        // Refresh UI counts
        updateDebugPanel();
        // Also reload discoveries in UI if we're on the Your Lab page
        if (window.location.pathname.endsWith('your_lab.html')) {
            loadSavedDiscoveries();
        }
    } catch (err) {
        console.error('Migration failed', err);
        alert('Migration failed — see console for details');
    }
}

function debugDeleteUser() {
    if (!selectedUsername) {
        alert('Please select a user first');
        return;
    }

    if (confirm(`Are you sure you want to DELETE user ${selectedUsername}? This cannot be undone!`)) {
        try {
            // Get current users and remove the selected one
            const users = AuthService.getAllUsers().filter(u => u.username !== selectedUsername);
            localStorage.setItem(AuthService.STORAGE_KEYS.USERS, JSON.stringify(users));
            // Remove user's discoveries
            localStorage.removeItem(AuthService.STORAGE_KEYS.USER_PROGRESS + selectedUsername);
            selectedUsername = null;
            refreshUserList();
            document.getElementById('debugUserData').textContent = 'Select a user to view data';
            alert('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
        }
    }
}

// Debug panel to track user and discoveries
function updateDebugPanel() {
    const user = AuthService.getCurrentUser();
    const debugUser = document.getElementById('debugUser');
    const debugMemoryDiscoveries = document.getElementById('debugMemoryDiscoveries');
    const debugStorageDiscoveries = document.getElementById('debugStorageDiscoveries');
    
    if (debugUser) {
        debugUser.textContent = user ? user.username : '(none)';
    }
    
    if (debugMemoryDiscoveries) {
        debugMemoryDiscoveries.textContent = discoveries.size;
    }
    
    if (debugStorageDiscoveries && user) {
    const userData = DiscoveryService.getUserDataLocal(user.username);
        if (userData && userData.discoveries) {
            debugStorageDiscoveries.textContent = userData.discoveries.length;
        } else {
            debugStorageDiscoveries.textContent = '0';
        }
    }
}

// Update debug panel every second to keep it fresh
setInterval(updateDebugPanel, 1000);

// Initialize debug panel when page loads
document.addEventListener('DOMContentLoaded', () => {
    const user = AuthService.getCurrentUser();
    if (user?.isAdmin) {
        const debugPanel = document.getElementById('debugPanels');
        if (debugPanel) {
            debugPanel.style.display = 'block';
            refreshUserList();
        }
    }
});