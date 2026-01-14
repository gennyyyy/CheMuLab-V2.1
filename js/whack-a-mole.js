document.addEventListener('DOMContentLoaded', () => {
    // Heavy metals to catch
    const heavyMetals = ['Pb', 'Hg', 'Cd', 'As', 'Tl', 'Cr', 'U', 'Pu', 'Ra', 'Po'];

    // Game state
    let score = 0;
    let timeLeft = 30;
    let gameInterval = null;
    let moleInterval = null;
    let isGameRunning = false;

    // DOM Elements
    const moleGrid = document.getElementById('moleGrid');
    const scoreEl = document.getElementById('score');
    const timeEl = document.getElementById('time');
    const timerFill = document.getElementById('timerFill');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const gameOverEl = document.getElementById('gameOver');
    const finalScoreEl = document.getElementById('finalScore');

    // Create grid
    function createGrid() {
        moleGrid.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const hole = document.createElement('div');
            hole.className = 'mole-hole';
            hole.dataset.index = i;
            hole.addEventListener('click', handleClick);
            moleGrid.appendChild(hole);
        }
    }

    // Get random element
    function getRandomElement() {
        return elementsData[Math.floor(Math.random() * elementsData.length)];
    }

    // Check if heavy metal
    function isHeavyMetal(symbol) {
        return heavyMetals.includes(symbol);
    }

    // Pop up moles
    function popMoles() {
        const holes = document.querySelectorAll('.mole-hole');

        // Clear all holes first
        holes.forEach(hole => {
            hole.textContent = '';
            hole.classList.remove('active', 'heavy-metal');
            hole.dataset.element = '';
        });

        // Show 3-5 random elements
        const numMoles = 3 + Math.floor(Math.random() * 3);
        const usedIndices = [];

        for (let i = 0; i < numMoles; i++) {
            let idx;
            do {
                idx = Math.floor(Math.random() * 16);
            } while (usedIndices.includes(idx));
            usedIndices.push(idx);

            const element = getRandomElement();
            const hole = holes[idx];
            hole.textContent = element.symbol;
            hole.dataset.element = element.symbol;
            hole.classList.add('active');

            if (isHeavyMetal(element.symbol)) {
                hole.classList.add('heavy-metal');
            }
        }
    }

    // Handle click
    function handleClick(e) {
        if (!isGameRunning) return;

        const hole = e.target;
        const element = hole.dataset.element;

        if (!element) return; // Empty hole

        if (isHeavyMetal(element)) {
            // Correct! Caught a heavy metal
            score += 10;
            hole.classList.add('clicked-correct');
        } else {
            // Wrong! Not a heavy metal
            score -= 5;
            hole.classList.add('clicked-wrong');
        }

        // Clear this hole
        setTimeout(() => {
            hole.textContent = '';
            hole.classList.remove('active', 'heavy-metal', 'clicked-correct', 'clicked-wrong');
            hole.dataset.element = '';
        }, 200);

        scoreEl.textContent = score;
    }

    // Start game
    function startGame() {
        score = 0;
        timeLeft = 30;
        isGameRunning = true;

        scoreEl.textContent = score;
        timeEl.textContent = timeLeft;
        timerFill.style.width = '100%';
        startBtn.style.display = 'none';
        gameOverEl.style.display = 'none';

        createGrid();

        // Pop moles every 1.2 seconds
        popMoles();
        moleInterval = setInterval(popMoles, 1200);

        // Timer countdown
        gameInterval = setInterval(() => {
            timeLeft--;
            timeEl.textContent = timeLeft;
            timerFill.style.width = (timeLeft / 30 * 100) + '%';

            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    // End game
    function endGame() {
        isGameRunning = false;
        clearInterval(gameInterval);
        clearInterval(moleInterval);

        finalScoreEl.textContent = score;
        gameOverEl.style.display = 'block';

        // Clear grid
        const holes = document.querySelectorAll('.mole-hole');
        holes.forEach(hole => {
            hole.textContent = '';
            hole.classList.remove('active', 'heavy-metal');
        });
    }

    // Event listeners
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    // Initial grid
    createGrid();
});
