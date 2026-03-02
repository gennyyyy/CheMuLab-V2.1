/**
 * Balloon Race - Multiplayer Module
 * Two players compete to inflate the biggest balloon!
 */

(function () {
    'use strict';

    const INGREDIENTS = [
        { id: 'soda_high', name: 'High-Grade Soda', emoji: '🧂', gas: 30, type: 'base' },
        { id: 'soda_std', name: 'Standard Soda', emoji: '🍚', gas: 15, type: 'base' },
        { id: 'vinegar_20', name: '20% Vinegar', emoji: '🧴', speed: 3.0, type: 'acid' },
        { id: 'vinegar_5', name: '5% Vinegar', emoji: '🫗', speed: 1.0, type: 'acid' },
        { id: 'lemon', name: 'Lemon Juice', emoji: '🍋', speed: 1.5, type: 'acid' },
        { id: 'water', name: 'Water', emoji: '💧', gas: 0, speed: 0.1, type: 'filler' }
    ];

    let currentGame = null;
    let unsubscribeGame = null;
    let currentUser = null;
    let elements = {};

    function generateRoomCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    function createInitialGrid() {
        const pool = [
            INGREDIENTS[0], INGREDIENTS[0], INGREDIENTS[1], INGREDIENTS[1],
            INGREDIENTS[2], INGREDIENTS[2], INGREDIENTS[3], INGREDIENTS[3],
            INGREDIENTS[4], INGREDIENTS[4],
            ...Array(6).fill(INGREDIENTS[5])
        ];
        return pool.sort(() => Math.random() - 0.5).map(ing => ({ ...ing, selectedBy: null }));
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

        await db.collection('balloonGames').doc(roomCode).set({
            roomCode,
            player1Uid: currentUser.uid,
            player1Name: name,
            player2Uid: null,
            p1Inv: [], p2Inv: [],
            grid: createInitialGrid(),
            currentTurn: 1,
            status: 'waiting'
        });
        subscribeToGame(roomCode);
    }

    async function joinGame() {
        const code = elements.joinCodeInput.value.toUpperCase();
        if (code.length !== 6) return alert('Invalid code');
        const db = firebase.firestore();
        const gameRef = db.collection('balloonGames').doc(code);
        const snap = await gameRef.get();
        if (!snap.exists) return alert('No game');

        const name = await getUserDisplayName(currentUser.uid);
        await gameRef.update({
            player2Uid: currentUser.uid,
            player2Name: name,
            status: 'playing'
        });
        subscribeToGame(code);
    }

    function subscribeToGame(code) {
        if (unsubscribeGame) unsubscribeGame();
        unsubscribeGame = firebase.firestore().collection('balloonGames').doc(code)
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
        elements.p2Name.textContent = currentGame.player2Name;

        renderGrid();
        updateTurn();
    }

    function renderGrid() {
        elements.ingredientGrid.innerHTML = '';
        const amP1 = currentGame.player1Uid === currentUser.uid;
        const myTurn = (currentGame.currentTurn === 1 && amP1) || (currentGame.currentTurn === 2 && !amP1);

        currentGame.grid.forEach((ing, idx) => {
            const card = document.createElement('div');
            card.className = 'ingredient-card';
            if (ing.selectedBy) {
                card.classList.add('disabled');
                card.classList.add(ing.selectedBy === 1 ? 'p1-sel' : 'p2-sel');
            }
            card.innerHTML = ing.emoji;
            if (!ing.selectedBy && myTurn) card.onclick = () => pickIngredient(idx);
            elements.ingredientGrid.appendChild(card);
        });
    }

    function updateTurn() {
        const amP1 = currentGame.player1Uid === currentUser.uid;
        const myTurn = (currentGame.currentTurn === 1 && amP1) || (currentGame.currentTurn === 2 && !amP1);
        elements.turnIndicator.textContent = myTurn ? "Your turn!" : "Waiting for partner...";

        // Sync Balloon Sizes
        const p1Score = calculateScore(currentGame.p1Inv);
        const p2Score = calculateScore(currentGame.p2Inv);
        elements.p1Balloon.style.transform = `translateX(-50%) scale(${1 + p1Score / 100})`;
        elements.p2Balloon.style.transform = `translateX(-50%) scale(${1 + p2Score / 100})`;
    }

    async function pickIngredient(idx) {
        const amP1 = currentGame.player1Uid === currentUser.uid;
        const grid = [...currentGame.grid];
        grid[idx].selectedBy = amP1 ? 1 : 2;

        const p1Inv = [...currentGame.p1Inv];
        const p2Inv = [...currentGame.p2Inv];
        if (amP1) p1Inv.push(grid[idx]); else p2Inv.push(grid[idx]);

        const total = grid.filter(g => g.selectedBy).length;
        let status = 'playing';
        if (total >= 6) status = 'completed';

        await firebase.firestore().collection('balloonGames').doc(currentGame.roomCode).update({
            grid, p1Inv, p2Inv, status, currentTurn: currentGame.currentTurn === 1 ? 2 : 1
        });
    }

    function calculateScore(inv) {
        let gasTotal = 0;
        let speedMult = 1;
        inv.forEach(i => {
            if (i.gas) gasTotal += i.gas;
            if (i.speed) speedMult *= i.speed;
        });
        return gasTotal * speedMult;
    }

    function calculateWinner() {
        const s1 = calculateScore(currentGame.p1Inv);
        const s2 = calculateScore(currentGame.p2Inv);
        if (s1 > s2) elements.winnerText.textContent = `${currentGame.player1Name} Wins! 🎈`;
        else if (s2 > s1) elements.winnerText.textContent = `${currentGame.player2Name} Wins! 🎈`;
        else elements.winnerText.textContent = "It's a Tie!";
    }

    function leaveGame() {
        if (unsubscribeGame) unsubscribeGame();
        showScreen('lobbyScreen');
    }

    function init() {
        elements = {
            createGameBtn: document.getElementById('createGameBtn'),
            joinGameBtn: document.getElementById('joinGameBtn'),
            joinCodeInput: document.getElementById('joinCodeInput'),
            roomCodeDisplay: document.getElementById('roomCodeDisplay'),
            p1Balloon: document.getElementById('p1Balloon'),
            p2Balloon: document.getElementById('p2Balloon'),
            p1Name: document.getElementById('p1Name'),
            p2Name: document.getElementById('p2Name'),
            ingredientGrid: document.getElementById('ingredientGrid'),
            turnIndicator: document.getElementById('turnIndicator'),
            winnerText: document.getElementById('winnerText'),
            playAgainBtn: document.getElementById('playAgainBtn')
        };
        elements.createGameBtn.onclick = createGame;
        elements.joinGameBtn.onclick = joinGame;
        elements.playAgainBtn.onclick = leaveGame;
        firebase.auth().onAuthStateChanged(u => currentUser = u);
    }
    init();
})();
