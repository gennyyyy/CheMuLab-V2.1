/**
 * pH Color Challenge - Multiplayer Module
 * Match the target color by adjusting your beaker's pH!
 */

(function () {
    'use strict';

    const SUBSTANCES = [
        { id: 'citric', name: 'Citric Acid', emoji: '🍋', phChange: -2 },
        { id: 'vinegar', name: 'Vinegar', emoji: '🧴', phChange: -1 },
        { id: 'soda', name: 'Baking Soda', emoji: '🍚', phChange: 2 },
        { id: 'ammonia', name: 'Ammonia', emoji: '🧪', phChange: 3 },
        { id: 'water', name: 'Distilled Water', emoji: '💧', phChange: 0 }
    ];

    const PH_COLORS = {
        2: '#ef4444', // Red
        4: '#f472b6', // Pink
        7: '#8b5cf6', // Purple
        10: '#10b981', // green/teal
        12: '#fbbf24'  // Yellow
    };

    let currentGame = null;
    let unsubscribeGame = null;
    let currentUser = null;
    let elements = {};

    function getPHColor(ph) {
        if (ph <= 3) return PH_COLORS[2];
        if (ph <= 5) return PH_COLORS[4];
        if (ph <= 8) return PH_COLORS[7];
        if (ph <= 11) return PH_COLORS[10];
        return PH_COLORS[12];
    }

    function createInitialGrid() {
        const pool = [
            SUBSTANCES[0], SUBSTANCES[0], SUBSTANCES[1], SUBSTANCES[1],
            SUBSTANCES[2], SUBSTANCES[2], SUBSTANCES[3], SUBSTANCES[3],
            ...Array(8).fill(SUBSTANCES[4])
        ];
        return pool.sort(() => Math.random() - 0.5).map(s => ({ ...s, pickedBy: null }));
    }

    async function getUserName(uid) {
        const db = firebase.firestore();
        const doc = await db.collection('users').doc(uid).get();
        return doc.exists ? doc.data().username : 'Player';
    }

    async function createGame() {
        if (!currentUser) return alert('Signed in required');
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const name = await getUserName(currentUser.uid);
        const targetPH = [2, 4, 10, 12][Math.floor(Math.random() * 4)];

        await firebase.firestore().collection('phGames').doc(roomCode).set({
            roomCode, targetPH,
            player1Uid: currentUser.uid, player1Name: name, player2Uid: null,
            p1PH: 7, p2PH: 7,
            grid: createInitialGrid(), currentTurn: 1, status: 'waiting'
        });
        subscribe(roomCode);
    }

    async function joinGame() {
        const code = elements.joinCodeInput.value.toUpperCase();
        if (code.length !== 6) return alert('Invalid code');
        const db = firebase.firestore();
        const ref = db.collection('phGames').doc(code);
        const snap = await ref.get();
        if (!snap.exists) return alert('No game');

        const name = await getUserName(currentUser.uid);
        await ref.update({ player2Uid: currentUser.uid, player2Name: name, status: 'playing' });
        subscribe(code);
    }

    function subscribe(code) {
        if (unsubscribeGame) unsubscribeGame();
        unsubscribeGame = firebase.firestore().collection('phGames').doc(code).onSnapshot(doc => {
            if (!doc.exists) return;
            currentGame = doc.data();
            render();
        });
    }

    function render() {
        if (currentGame.status === 'waiting') {
            document.getElementById('lobbyScreen').classList.remove('active');
            document.getElementById('waitingScreen').classList.add('active');
            elements.roomCodeDisplay.textContent = currentGame.roomCode;
            return;
        }

        if (currentGame.status === 'completed') {
            document.getElementById('gameScreen').classList.remove('active');
            document.getElementById('victoryScreen').classList.add('active');
            const d1 = Math.abs(currentGame.p1PH - currentGame.targetPH);
            const d2 = Math.abs(currentGame.p2PH - currentGame.targetPH);
            if (d1 < d2) elements.winnerText.textContent = `${currentGame.player1Name} Wins!`;
            else if (d2 < d1) elements.winnerText.textContent = `${currentGame.player2Name} Wins!`;
            else elements.winnerText.textContent = "Tie!";
            return;
        }

        document.getElementById('waitingScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.add('active');
        elements.p1Name.textContent = currentGame.player1Name;
        elements.p2Name.textContent = currentGame.player2Name;

        elements.targetColorBox.style.background = getPHColor(currentGame.targetPH);
        elements.p1Liquid.style.background = getPHColor(currentGame.p1PH);
        elements.p2Liquid.style.background = getPHColor(currentGame.p2PH);

        renderGrid();
    }

    function renderGrid() {
        elements.grid.innerHTML = '';
        const amP1 = currentGame.player1Uid === currentUser.uid;
        const myTurn = (currentGame.currentTurn === 1 && amP1) || (currentGame.currentTurn === 2 && !amP1);

        currentGame.grid.forEach((s, idx) => {
            const card = document.createElement('div');
            card.className = 'ing-card' + (s.pickedBy ? ' disabled' : '');
            if (s.pickedBy === 1) card.style.borderColor = 'red';
            if (s.pickedBy === 2) card.style.borderColor = 'blue';
            card.innerHTML = s.emoji;
            if (!s.pickedBy && myTurn) card.onclick = () => pick(idx);
            elements.grid.appendChild(card);
        });
    }

    async function pick(idx) {
        const amP1 = currentGame.player1Uid === currentUser.uid;
        const grid = [...currentGame.grid];
        grid[idx].pickedBy = amP1 ? 1 : 2;

        let p1PH = currentGame.p1PH;
        let p2PH = currentGame.p2PH;
        if (amP1) p1PH += grid[idx].phChange; else p2PH += grid[idx].phChange;

        const total = grid.filter(g => g.pickedBy).length;
        let status = 'playing';
        if (total >= 8) status = 'completed';

        await firebase.firestore().collection('phGames').doc(currentGame.roomCode).update({
            grid, p1PH, p2PH, status, currentTurn: currentGame.currentTurn === 1 ? 2 : 1
        });
    }

    function init() {
        elements = {
            createGameBtn: document.getElementById('createGameBtn'),
            joinGameBtn: document.getElementById('joinGameBtn'),
            joinCodeInput: document.getElementById('joinCodeInput'),
            roomCodeDisplay: document.getElementById('roomCodeDisplay'),
            p1Name: document.getElementById('p1Name'),
            p2Name: document.getElementById('p2Name'),
            p1Liquid: document.getElementById('p1Liquid'),
            p2Liquid: document.getElementById('p2Liquid'),
            targetColorBox: document.getElementById('targetColorBox'),
            grid: document.getElementById('ingredientGrid'),
            winnerText: document.getElementById('winnerText'),
            playAgainBtn: document.getElementById('playAgainBtn')
        };
        elements.createGameBtn.onclick = createGame;
        elements.joinGameBtn.onclick = joinGame;
        elements.playAgainBtn.onclick = () => location.reload();
        firebase.auth().onAuthStateChanged(u => currentUser = u);
    }
    init();
})();
