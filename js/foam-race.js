/**
 * Elephant Toothpaste Race - Multiplayer Module
 * Two players compete to create the tallest foam explosion!
 */

(function () {
    'use strict';

    // Ingredients configuration
    const INGREDIENTS = [
        { id: 'h2o2_30', name: '30% H₂O₂', emoji: '🧪', power: 30, type: 'reactant' },
        { id: 'h2o2_20', name: '20% H₂O₂', emoji: '🧪', power: 20, type: 'reactant' },
        { id: 'h2o2_10', name: '10% H₂O₂', emoji: '🧪', power: 10, type: 'reactant' },
        { id: 'yeast', name: 'Yeast', emoji: '🍞', speed: 1.5, type: 'catalyst' },
        { id: 'ki', name: 'Potassium Iodide', emoji: '🧂', speed: 3.0, type: 'catalyst' },
        { id: 'soap', name: 'Dish Soap', emoji: '🧼', volume: 2.0, type: 'stabilizer' },
        { id: 'color_r', name: 'Red Dye', emoji: '🔴', color: '#ff4e50', type: 'dye' },
        { id: 'color_b', name: 'Blue Dye', emoji: '🔵', color: '#4facfe', type: 'dye' },
        { id: 'water', name: 'Water', emoji: '🫗', power: 0, speed: 0.5, type: 'filler' }
    ];

    let currentGame = null;
    let unsubscribeGame = null;
    let currentUser = null;
    let isHost = false;
    let elements = {};

    function generateRoomCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    function shuffleArray(array) {
        return [...array].sort(() => Math.random() - 0.5);
    }

    function createInitialGrid() {
        // Create 16 slots with variations
        const pool = [
            ...INGREDIENTS.filter(i => i.id.startsWith('h2o2')), // 3
            ...INGREDIENTS.filter(i => i.id === 'ki' || i.id === 'yeast'), // 2
            INGREDIENTS.find(i => i.id === 'soap'),
            INGREDIENTS.find(i => i.id === 'soap'),
            INGREDIENTS.find(i => i.id === 'color_r'),
            INGREDIENTS.find(i => i.id === 'color_b'),
            ...Array(7).fill(INGREDIENTS.find(i => i.id === 'water')) // fill rest with water
        ];
        return shuffleArray(pool).map(ing => ({ ...ing, collectedBy: null }));
    }

    async function getUserDisplayName(uid) {
        const db = firebase.firestore();
        const doc = await db.collection('users').doc(uid).get();
        return doc.exists ? doc.data().username : 'Player';
    }

    function showScreen(name) {
        document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
        document.getElementById(name).classList.add('active');
    }

    async function createGame() {
        if (!currentUser) return alert('Signed in required');
        const db = firebase.firestore();
        const roomCode = generateRoomCode();
        const name = await getUserDisplayName(currentUser.uid);

        const gameData = {
            roomCode,
            player1Uid: currentUser.uid,
            player1Name: name,
            player2Uid: null,
            player2Name: null,
            p1Inventory: [],
            p2Inventory: [],
            currentTurn: 1,
            grid: createInitialGrid(),
            status: 'waiting',
            p1FoamHeight: 0,
            p2FoamHeight: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('foamGames').doc(roomCode).set(gameData);
        isHost = true;
        subscribeToGame(roomCode);
    }

    async function joinGame() {
        const code = elements.joinCodeInput.value.toUpperCase();
        if (code.length !== 6) return alert('Invalid code');
        const db = firebase.firestore();
        const gameRef = db.collection('foamGames').doc(code);
        const snap = await gameRef.get();
        if (!snap.exists) return alert('Game not found');

        const name = await getUserDisplayName(currentUser.uid);
        await gameRef.update({
            player2Uid: currentUser.uid,
            player2Name: name,
            status: 'playing'
        });
        isHost = false;
        subscribeToGame(code);
    }

    function subscribeToGame(code) {
        if (unsubscribeGame) unsubscribeGame();
        unsubscribeGame = firebase.firestore().collection('foamGames').doc(code)
            .onSnapshot(doc => {
                if (!doc.exists) return leaveGame();
                currentGame = doc.data();
                renderGame();
            });
    }

    function renderGame() {
        if (currentGame.status === 'waiting') {
            showScreen('waitingScreen');
            elements.roomCodeDisplay.textContent = currentGame.roomCode;
            return;
        }

        if (currentGame.status === 'completed') {
            showScreen('victoryScreen');
            calculateWinner();
            return;
        }

        showScreen('gameScreen');
        elements.p1Name.textContent = currentGame.player1Name;
        elements.p2Name.textContent = currentGame.player2Name || 'Joining...';

        renderInventory('p1Inventory', currentGame.p1Inventory);
        renderInventory('p2Inventory', currentGame.p2Inventory);
        renderGrid();
        updateTurnIndicator();

        // Sync Foam Heights
        elements.p1Foam.style.height = currentGame.p1FoamHeight + '%';
        elements.p2Foam.style.height = currentGame.p2FoamHeight + '%';
    }

    function renderInventory(id, items) {
        const cont = document.getElementById(id);
        cont.innerHTML = items.map(i => `<span>${i.emoji}</span>`).join('');
    }

    function renderGrid() {
        elements.ingredientGrid.innerHTML = '';
        const amP1 = currentGame.player1Uid === currentUser.uid;
        const myTurn = (currentGame.currentTurn === 1 && amP1) || (currentGame.currentTurn === 2 && !amP1);

        currentGame.grid.forEach((ing, idx) => {
            const card = document.createElement('div');
            card.className = 'ingredient-card';
            if (ing.collectedBy) {
                card.classList.add('disabled');
                card.classList.add(ing.collectedBy === 1 ? 'p1-selected' : 'p2-selected');
            }
            card.innerHTML = ing.emoji;
            if (!ing.collectedBy && myTurn) {
                card.onclick = () => collectIngredient(idx);
            }
            elements.ingredientGrid.appendChild(card);
        });
    }

    function updateTurnIndicator() {
        const amP1 = currentGame.player1Uid === currentUser.uid;
        const myTurn = (currentGame.currentTurn === 1 && amP1) || (currentGame.currentTurn === 2 && !amP1);
        elements.turnIndicator.textContent = myTurn ? "Your turn! Choose an ingredient." : "Partner's turn...";
        elements.p1Card.classList.toggle('active', currentGame.currentTurn === 1);
        elements.p2Card.classList.toggle('active', currentGame.currentTurn === 2);
    }

    async function collectIngredient(idx) {
        const amP1 = currentGame.player1Uid === currentUser.uid;
        const grid = [...currentGame.grid];
        const ing = grid[idx];
        grid[idx].collectedBy = amP1 ? 1 : 2;

        const p1Inv = [...currentGame.p1Inventory];
        const p2Inv = [...currentGame.p2Inventory];
        if (amP1) p1Inv.push(ing); else p2Inv.push(ing);

        const totalSelected = grid.filter(g => g.collectedBy).length;
        let status = 'playing';
        let nextTurn = currentGame.currentTurn === 1 ? 2 : 1;

        // Game ends when 8 ingredients (4 per player) are picked
        if (totalSelected >= 8) {
            status = 'completed';
        }

        await firebase.firestore().collection('foamGames').doc(currentGame.roomCode).update({
            grid, p1Inventory: p1Inv, p2Inventory: p2Inv, currentTurn: nextTurn, status
        });
    }

    function calculateWinner() {
        const p1Score = calculateScore(currentGame.p1Inventory);
        const p2Score = calculateScore(currentGame.p2Inventory);

        elements.p1Foam.style.height = (p1Score / 2) + '%';
        elements.p2Foam.style.height = (p2Score / 2) + '%';

        if (p1Score > p2Score) {
            elements.winnerText.textContent = `🏆 ${currentGame.player1Name} Wins!`;
        } else if (p2Score > p1Score) {
            elements.winnerText.textContent = `🏆 ${currentGame.player2Name} Wins!`;
        } else {
            elements.winnerText.textContent = "🤝 It's a Tie!";
        }

        elements.victoryDetails.innerHTML = `
            <p>${currentGame.player1Name} Foam Height: ${p1Score.toFixed(0)}cm</p>
            <p>${currentGame.player2Name} Foam Height: ${p2Score.toFixed(0)}cm</p>
        `;
    }

    function calculateScore(inv) {
        let power = 0;
        let speed = 1;
        let volume = 1; e
        inv.forEach(i => {
            if (i.power) power += i.power;
            if (i.speed) speed = Math.max(speed, i.speed);
            if (i.volume) volume *= i.volume;
        });
        return power * speed * volume;
    }

    function leaveGame() {
        if (unsubscribeGame) unsubscribeGame();
        showScreen('lobbyScreen');
    }

    function init() {
        elements = {
            joinCodeInput: document.getElementById('joinCodeInput'),
            createGameBtn: document.getElementById('createGameBtn'),
            joinGameBtn: document.getElementById('joinGameBtn'),
            waitingScreen: document.getElementById('waitingScreen'),
            roomCodeDisplay: document.getElementById('roomCodeDisplay'),
            gameScreen: document.getElementById('gameScreen'),
            p1Name: document.getElementById('p1Name'),
            p2Name: document.getElementById('p2Name'),
            p1Card: document.getElementById('p1Card'),
            p2Card: document.getElementById('p2Card'),
            turnIndicator: document.getElementById('turnIndicator'),
            p1Foam: document.getElementById('p1Foam'),
            p2Foam: document.getElementById('p2Foam'),
            ingredientGrid: document.getElementById('ingredientGrid'),
            victoryScreen: document.getElementById('victoryScreen'),
            winnerText: document.getElementById('winnerText'),
            victoryDetails: document.getElementById('victoryDetails'),
            playAgainBtn: document.getElementById('playAgainBtn')
        };

        elements.createGameBtn.onclick = createGame;
        elements.joinGameBtn.onclick = joinGame;
        elements.playAgainBtn.onclick = leaveGame;

        firebase.auth().onAuthStateChanged(user => {
            currentUser = user;
        });
    }

    init();
})();
