/**
 * Volcano Experiment - Collaborative Multiplayer Module
 * Two players work together to collect all ingredients and trigger the volcano eruption!
 */

(function () {
    'use strict';

    // Ingredients configuration
    const INGREDIENTS = [
        { id: 'soda', name: 'Baking Soda', emoji: '🧂' },
        { id: 'vinegar', name: 'Vinegar', emoji: '🫗' },
        { id: 'soap', name: 'Dish Soap', emoji: '🧴' },
        { id: 'color', name: 'Food Color', emoji: '🔴' }
    ];

    // Game state
    let currentGame = null;
    let unsubscribeGame = null;
    let currentUser = null;
    let isHost = false;

    // DOM Elements (will be initialized on DOMContentLoaded)
    let elements = {};

    // Generate random room code
    function generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Shuffle array utility
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Create initial ingredient grid (16 cards - 4 of each type)
    function createInitialGrid() {
        const allIngredients = [];
        INGREDIENTS.forEach(ing => {
            for (let i = 0; i < 4; i++) {
                allIngredients.push({ ...ing, collected: false, collectedBy: null });
            }
        });
        return shuffleArray(allIngredients);
    }

    // Get current user's display name
    async function getUserDisplayName(uid) {
        try {
            const db = firebase.firestore();
            const userDoc = await db.collection('users').doc(uid).get();
            if (userDoc.exists && userDoc.data().username) {
                return userDoc.data().username;
            }
            const user = firebase.auth().currentUser;
            if (user && user.displayName) return user.displayName;
            if (user && user.email) return user.email.split('@')[0];
            return 'Player';
        } catch (e) {
            console.warn('Could not get display name:', e);
            return 'Player';
        }
    }

    // Show specific screen
    function showScreen(screenName) {
        document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(screenName);
        if (screen) screen.classList.add('active');
    }

    // Create a new game room
    async function createGame() {
        if (!currentUser) {
            alert('Please sign in to play multiplayer!');
            return;
        }

        const db = firebase.firestore();
        const roomCode = generateRoomCode();
        const playerName = await getUserDisplayName(currentUser.uid);

        const gameData = {
            roomCode: roomCode,
            player1Uid: currentUser.uid,
            player1Name: playerName,
            player2Uid: null,
            player2Name: null,
            currentTurn: 1, // Player 1 starts
            grid: createInitialGrid(),
            sharedInventory: { soda: 0, vinegar: 0, soap: 0, color: 0 },
            status: 'waiting', // waiting, playing, completed
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await db.collection('volcanoGames').doc(roomCode).set(gameData);
            isHost = true;
            subscribeToGame(roomCode);
            showScreen('waitingScreen');
            elements.roomCodeDisplay.textContent = roomCode;
            elements.copyCodeBtn.onclick = () => {
                navigator.clipboard.writeText(roomCode);
                elements.copyCodeBtn.textContent = 'Copied!';
                setTimeout(() => elements.copyCodeBtn.textContent = '📋 Copy', 2000);
            };
        } catch (error) {
            console.error('Error creating game:', error);
            alert('Failed to create game. Please try again.');
        }
    }

    // Join an existing game
    async function joinGame() {
        if (!currentUser) {
            alert('Please sign in to play multiplayer!');
            return;
        }

        const roomCode = elements.joinCodeInput.value.trim().toUpperCase();
        if (!roomCode || roomCode.length !== 6) {
            alert('Please enter a valid 6-character room code.');
            return;
        }

        const db = firebase.firestore();
        const playerName = await getUserDisplayName(currentUser.uid);

        try {
            const gameRef = db.collection('volcanoGames').doc(roomCode);
            const gameDoc = await gameRef.get();

            if (!gameDoc.exists) {
                alert('Game not found! Check the room code.');
                return;
            }

            const gameData = gameDoc.data();

            if (gameData.player1Uid === currentUser.uid) {
                // Rejoining own game
                isHost = true;
                subscribeToGame(roomCode);
                return;
            }

            if (gameData.player2Uid && gameData.player2Uid !== currentUser.uid) {
                alert('This game is already full!');
                return;
            }

            if (!gameData.player2Uid) {
                // Join as player 2
                await gameRef.update({
                    player2Uid: currentUser.uid,
                    player2Name: playerName,
                    status: 'playing'
                });
            }

            isHost = false;
            subscribeToGame(roomCode);
        } catch (error) {
            console.error('Error joining game:', error);
            alert('Failed to join game. Please try again.');
        }
    }

    // Subscribe to real-time game updates
    function subscribeToGame(roomCode) {
        if (unsubscribeGame) unsubscribeGame();

        const db = firebase.firestore();
        unsubscribeGame = db.collection('volcanoGames').doc(roomCode)
            .onSnapshot((doc) => {
                if (!doc.exists) {
                    alert('Game was ended by the host.');
                    showScreen('lobbyScreen');
                    return;
                }
                currentGame = { id: doc.id, ...doc.data() };
                renderGame();
            }, (error) => {
                console.error('Game subscription error:', error);
            });
    }

    // Render the game state
    function renderGame() {
        if (!currentGame) return;

        // Update player panels
        const amPlayer1 = currentGame.player1Uid === currentUser.uid;
        elements.player1Name.textContent = currentGame.player1Name || 'Waiting...';
        elements.player2Name.textContent = currentGame.player2Name || 'Waiting...';

        // Highlight which player you are
        elements.player1Panel.classList.toggle('you', amPlayer1);
        elements.player2Panel.classList.toggle('you', !amPlayer1);

        if (currentGame.status === 'waiting') {
            showScreen('waitingScreen');
            elements.roomCodeDisplay.textContent = currentGame.roomCode;
            return;
        }

        if (currentGame.status === 'completed') {
            showScreen('gameScreen');
            renderGrid();
            updateSharedProgress();
            showVictory();
            return;
        }

        // Game is playing
        showScreen('gameScreen');
        renderGrid();
        updateTurnIndicator();
        updateSharedProgress();
        highlightActivePlayer();
    }

    // Render ingredient grid
    function renderGrid() {
        elements.ingredientGrid.innerHTML = '';
        currentGame.grid.forEach((ing, index) => {
            const card = document.createElement('div');
            card.className = 'ingredient-card';
            if (ing.collected) {
                card.classList.add('collected');
                if (ing.collectedBy === 1) card.classList.add('p1-collected');
                else card.classList.add('p2-collected');
            }
            card.dataset.index = index;
            card.innerHTML = `
                <span>${ing.emoji}</span>
                <span class="name">${ing.name}</span>
            `;
            if (!ing.collected && isMyTurn()) {
                card.addEventListener('click', () => collectIngredient(index));
            }
            elements.ingredientGrid.appendChild(card);
        });
    }

    // Check if it's current user's turn
    function isMyTurn() {
        if (!currentGame || currentGame.status !== 'playing') return false;
        const amPlayer1 = currentGame.player1Uid === currentUser.uid;
        return (currentGame.currentTurn === 1 && amPlayer1) ||
            (currentGame.currentTurn === 2 && !amPlayer1);
    }

    // Update turn indicator
    function updateTurnIndicator() {
        const isMyTurnNow = isMyTurn();
        const playerNum = currentGame.currentTurn;
        const playerName = playerNum === 1 ? currentGame.player1Name : currentGame.player2Name;
        const emoji = playerNum === 1 ? '🔴' : '🔵';

        if (isMyTurnNow) {
            elements.turnIndicator.textContent = `${emoji} Your turn! Click an ingredient to add it.`;
            elements.turnIndicator.style.background = '#c8e6c9';
        } else {
            elements.turnIndicator.textContent = `${emoji} ${playerName}'s turn...`;
            elements.turnIndicator.style.background = '#fff3cd';
        }
    }

    // Highlight active player panel
    function highlightActivePlayer() {
        elements.player1Panel.classList.toggle('active', currentGame.currentTurn === 1);
        elements.player2Panel.classList.toggle('active', currentGame.currentTurn === 2);
    }

    // Update shared progress display
    function updateSharedProgress() {
        const inv = currentGame.sharedInventory;
        elements.sharedSoda.textContent = inv.soda;
        elements.sharedVinegar.textContent = inv.vinegar;
        elements.sharedSoap.textContent = inv.soap;
        elements.sharedColor.textContent = inv.color;

        // Update progress bar
        const total = inv.soda + inv.vinegar + inv.soap + inv.color;
        const percentage = (total / 16) * 100;
        elements.progressFill.style.width = percentage + '%';
        elements.progressText.textContent = `${total}/16 ingredients collected`;
    }

    // Collect an ingredient
    async function collectIngredient(index) {
        if (!isMyTurn() || !currentGame) return;

        const grid = [...currentGame.grid];
        if (grid[index].collected) return;

        const amPlayer1 = currentGame.player1Uid === currentUser.uid;
        grid[index].collected = true;
        grid[index].collectedBy = amPlayer1 ? 1 : 2;

        const inventory = { ...currentGame.sharedInventory };
        inventory[grid[index].id]++;

        // Check if all ingredients collected
        const total = inventory.soda + inventory.vinegar + inventory.soap + inventory.color;
        const isComplete = total >= 16;

        const nextTurn = currentGame.currentTurn === 1 ? 2 : 1;

        try {
            const db = firebase.firestore();
            await db.collection('volcanoGames').doc(currentGame.id).update({
                grid: grid,
                sharedInventory: inventory,
                currentTurn: nextTurn,
                status: isComplete ? 'completed' : 'playing'
            });
        } catch (error) {
            console.error('Error updating game:', error);
        }
    }

    // Show victory screen
    function showVictory() {
        elements.turnIndicator.textContent = '🎉 You both did it! The volcano erupts!';
        elements.turnIndicator.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        elements.turnIndicator.style.color = '#fff';

        // Trigger eruption
        elements.lava.classList.add('erupting');
        elements.lavaParticles.classList.add('erupting');

        elements.gameOverPanel.style.display = 'block';
    }

    // Leave current game
    async function leaveGame() {
        if (unsubscribeGame) {
            unsubscribeGame();
            unsubscribeGame = null;
        }

        if (currentGame && isHost) {
            // Host leaving deletes the game
            try {
                const db = firebase.firestore();
                await db.collection('volcanoGames').doc(currentGame.id).delete();
            } catch (e) {
                console.warn('Could not delete game:', e);
            }
        }

        currentGame = null;
        isHost = false;
        showScreen('lobbyScreen');
        resetGameUI();
    }

    // Reset game UI
    function resetGameUI() {
        elements.lava.classList.remove('erupting');
        elements.lavaParticles.classList.remove('erupting');
        elements.gameOverPanel.style.display = 'none';
        elements.turnIndicator.style.color = '';
        elements.progressFill.style.width = '0%';
    }

    // Initialize on DOM ready
    function init() {
        // Cache DOM elements
        elements = {
            lobbyScreen: document.getElementById('lobbyScreen'),
            waitingScreen: document.getElementById('waitingScreen'),
            gameScreen: document.getElementById('gameScreen'),
            createGameBtn: document.getElementById('createGameBtn'),
            joinGameBtn: document.getElementById('joinGameBtn'),
            joinCodeInput: document.getElementById('joinCodeInput'),
            roomCodeDisplay: document.getElementById('roomCodeDisplay'),
            copyCodeBtn: document.getElementById('copyCodeBtn'),
            cancelWaitBtn: document.getElementById('cancelWaitBtn'),
            leaveGameBtn: document.getElementById('leaveGameBtn'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            player1Panel: document.getElementById('player1Panel'),
            player2Panel: document.getElementById('player2Panel'),
            player1Name: document.getElementById('player1Name'),
            player2Name: document.getElementById('player2Name'),
            ingredientGrid: document.getElementById('ingredientGrid'),
            turnIndicator: document.getElementById('turnIndicator'),
            sharedSoda: document.getElementById('shared-soda'),
            sharedVinegar: document.getElementById('shared-vinegar'),
            sharedSoap: document.getElementById('shared-soap'),
            sharedColor: document.getElementById('shared-color'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            lava: document.getElementById('lava'),
            lavaParticles: document.getElementById('lavaParticles'),
            gameOverPanel: document.getElementById('gameOverPanel')
        };

        // Event listeners
        elements.createGameBtn?.addEventListener('click', createGame);
        elements.joinGameBtn?.addEventListener('click', joinGame);
        elements.cancelWaitBtn?.addEventListener('click', leaveGame);
        elements.leaveGameBtn?.addEventListener('click', leaveGame);
        elements.playAgainBtn?.addEventListener('click', leaveGame);

        // Allow joining with Enter key
        elements.joinCodeInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') joinGame();
        });

        // Listen for auth state
        firebase.auth().onAuthStateChanged((user) => {
            currentUser = user;
            if (!user) {
                showScreen('lobbyScreen');
                if (unsubscribeGame) unsubscribeGame();
            }
        });

        showScreen('lobbyScreen');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
