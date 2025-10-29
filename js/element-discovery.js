// Element Discovery Integration

class ElementDiscovery {
    constructor() {
        this.currentUser = AuthService.getCurrentUser();
        this.initialize();
    }

    initialize() {
        // Add click handlers to elements
        const elements = document.querySelectorAll('.element');
        elements.forEach(element => {
            element.addEventListener('click', () => this.handleElementClick(element));
        });

        // Load discovered elements
        this.loadDiscoveredElements();
    }

    handleElementClick(elementDiv) {
        if (!this.currentUser) return;

        const atomicNumber = elementDiv.getAttribute('data-atomic-number');
        const symbol = elementDiv.querySelector('.symbol').textContent;
        
        // Create discovery object
        const discovery = {
            id: atomicNumber,
            symbol: symbol,
            name: this.getElementName(symbol),
            completed: true,
            type: elementDiv.className.replace('element ', '')
        };

        // Add to discoveries
        DiscoveryService.addDiscovery(this.currentUser.username, discovery);
        
        // Add visual feedback
        elementDiv.classList.add('discovered');
        this.showDiscoveryAnimation(elementDiv);
    }

    loadDiscoveredElements() {
        if (!this.currentUser) return;

        const discoveries = DiscoveryService.getDiscoveries(this.currentUser.username);
        discoveries.forEach(discovery => {
            const element = document.querySelector(`[data-atomic-number="${discovery.id}"]`);
            if (element) {
                element.classList.add('discovered');
            }
        });
    }

    showDiscoveryAnimation(elementDiv) {
        const animation = document.createElement('div');
        animation.className = 'discovery-animation';
        animation.textContent = '🔍 Discovered!';
        elementDiv.appendChild(animation);

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            .discovered {
                position: relative;
                animation: pulse 0.5s ease-out;
            }

            .discovery-animation {
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(135, 206, 235, 0.9);
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                animation: float-up 1s ease-out forwards;
                pointer-events: none;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            @keyframes float-up {
                0% { opacity: 1; transform: translate(-50%, 0); }
                100% { opacity: 0; transform: translate(-50%, -20px); }
            }
        `;
        document.head.appendChild(style);

        // Remove animation element after it's done
        setTimeout(() => animation.remove(), 1000);
    }

    getElementName(symbol) {
        // Element name mapping
        const elementNames = {
            'H': 'Hydrogen', 'He': 'Helium', 'Li': 'Lithium', 'Be': 'Beryllium',
            'B': 'Boron', 'C': 'Carbon', 'N': 'Nitrogen', 'O': 'Oxygen',
            'F': 'Fluorine', 'Ne': 'Neon', 'Na': 'Sodium', 'Mg': 'Magnesium',
            'Al': 'Aluminum', 'Si': 'Silicon', 'P': 'Phosphorus', 'S': 'Sulfur',
            'Cl': 'Chlorine', 'Ar': 'Argon'
            // Add more elements as needed
        };
        return elementNames[symbol] || symbol;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ElementDiscovery();
});