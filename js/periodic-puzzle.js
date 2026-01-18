document.addEventListener('DOMContentLoaded', () => {
    // First 18 elements in order with their grid positions
    const puzzleElements = [
        { symbol: 'H', row: 1, col: 1 },
        { symbol: 'He', row: 1, col: 6 },
        { symbol: 'Li', row: 2, col: 1 },
        { symbol: 'Be', row: 2, col: 2 },
        { symbol: 'B', row: 2, col: 3 },
        { symbol: 'C', row: 2, col: 4 },
        { symbol: 'N', row: 2, col: 5 },
        { symbol: 'O', row: 2, col: 6 },
        { symbol: 'F', row: 3, col: 1 },
        { symbol: 'Ne', row: 3, col: 6 },
        { symbol: 'Na', row: 4, col: 1 },
        { symbol: 'Mg', row: 4, col: 2 },
        { symbol: 'Al', row: 4, col: 3 },
        { symbol: 'Si', row: 4, col: 4 },
        { symbol: 'P', row: 4, col: 5 },
        { symbol: 'S', row: 4, col: 6 },
        { symbol: 'Cl', row: 5, col: 1 },
        { symbol: 'Ar', row: 5, col: 6 }
    ];

    // DOM Elements
    const puzzleGrid = document.getElementById('puzzleGrid');
    const piecesTray = document.getElementById('piecesTray');
    const checkBtn = document.getElementById('checkBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultMessage = document.getElementById('resultMessage');

    let draggedPiece = null;

    // Create puzzle grid (5 rows x 6 cols)
    function createGrid() {
        puzzleGrid.innerHTML = '';
        for (let row = 1; row <= 5; row++) {
            for (let col = 1; col <= 6; col++) {
                const slot = document.createElement('div');
                slot.className = 'puzzle-slot';
                slot.dataset.row = row;
                slot.dataset.col = col;

                // Check if this position should have an element
                const element = puzzleElements.find(e => e.row === row && e.col === col);
                if (element) {
                    slot.dataset.expected = element.symbol;
                } else {
                    slot.style.visibility = 'hidden';
                }

                // Drag and drop events
                slot.addEventListener('dragover', handleDragOver);
                slot.addEventListener('dragleave', handleDragLeave);
                slot.addEventListener('drop', handleDrop);

                puzzleGrid.appendChild(slot);
            }
        }
    }

    // Create pieces
    function createPieces() {
        piecesTray.innerHTML = '';

        // Shuffle the elements
        const shuffled = [...puzzleElements].sort(() => Math.random() - 0.5);

        shuffled.forEach(el => {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.textContent = el.symbol;
            piece.draggable = true;
            piece.dataset.symbol = el.symbol;

            piece.addEventListener('dragstart', handleDragStart);
            piece.addEventListener('dragend', handleDragEnd);

            piecesTray.appendChild(piece);
        });
    }

    // Drag handlers
    function handleDragStart(e) {
        draggedPiece = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.symbol);
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
        draggedPiece = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
        if (e.target.classList.contains('puzzle-slot') && !e.target.classList.contains('filled')) {
            e.target.classList.add('droppable');
        }
    }

    function handleDragLeave(e) {
        e.target.classList.remove('droppable');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.target.classList.remove('droppable');

        if (!draggedPiece) return;
        if (!e.target.classList.contains('puzzle-slot')) return;
        if (e.target.classList.contains('filled')) return;

        const symbol = e.dataTransfer.getData('text/plain');

        // Place the piece
        e.target.textContent = symbol;
        e.target.classList.add('filled');
        e.target.dataset.placed = symbol;

        // Remove from tray
        draggedPiece.remove();

        resultMessage.textContent = '';
    }

    // Check answer
    function checkAnswer() {
        const slots = document.querySelectorAll('.puzzle-slot[data-expected]');
        let correct = 0;
        let total = slots.length;

        slots.forEach(slot => {
            slot.classList.remove('correct', 'wrong');

            if (slot.dataset.placed === slot.dataset.expected) {
                slot.classList.add('correct');
                correct++;
            } else if (slot.dataset.placed) {
                slot.classList.add('wrong');
            }
        });

        if (correct === total) {
            resultMessage.textContent = '🎉 Perfect! All elements are in the correct position!';
            resultMessage.style.color = 'green';
        } else {
            resultMessage.textContent = `You got ${correct}/${total} correct. Keep trying!`;
            resultMessage.style.color = correct > total / 2 ? 'orange' : 'red';
        }
    }

    // Reset puzzle
    function resetPuzzle() {
        resultMessage.textContent = '';
        createGrid();
        createPieces();
    }

    // Event listeners
    checkBtn.addEventListener('click', checkAnswer);
    resetBtn.addEventListener('click', resetPuzzle);

    // Initialize
    createGrid();
    createPieces();
});
