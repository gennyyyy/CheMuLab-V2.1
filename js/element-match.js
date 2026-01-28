document.addEventListener('DOMContentLoaded', () => {
    // Game variables
    let currentScore = 0;
    let currentStreak = 0;
    let currentCorrectAnswer = null;
    let isGameActive = true;
    let lives = 3;

    // DOM Elements
    const questionEl = document.getElementById('question');
    const optionsEl = document.getElementById('options');
    const scoreEl = document.getElementById('score');
    const streakEl = document.getElementById('streak');
    const livesEl = document.getElementById('lives');
    const feedbackEl = document.getElementById('feedback');
    const nextBtn = document.getElementById('nextBtn');
    
    // Game Over Elements
    const gameOverScreen = document.getElementById('gameOverScreen');
    const finalScoreEl = document.getElementById('finalScore');
    const restartBtn = document.getElementById('restartBtn');
    
    // Main Game Elements Container (to hide when game over)
    // In this structure, we might just hide the question/options/feedback
    // But let's verify if we need a container. For now, we'll toggle visibility of specific elements.

    // Init Game
    function initGame() {
        nextBtn.addEventListener('click', generateQuestion);
        restartBtn.addEventListener('click', restartGame);
        restartGame();
    }
    
    function restartGame() {
        currentScore = 0;
        currentStreak = 0;
        lives = 3;
        scoreEl.textContent = currentScore;
        streakEl.textContent = currentStreak;
        livesEl.textContent = lives;
        
        // Hide Game Over, Show Game
        gameOverScreen.style.display = 'none';
        questionEl.style.display = 'block';
        optionsEl.style.display = 'grid';
        feedbackEl.style.display = 'block';
        document.querySelector('.score-board').style.display = 'flex'; // Ensure scoreboard is visible
        
        generateQuestion();
    }

    // Generate a new question
    function generateQuestion() {
        // Reset state
        isGameActive = true;
        feedbackEl.textContent = '';
        feedbackEl.style.color = 'inherit';
        optionsEl.innerHTML = '';
        nextBtn.style.display = 'none';

        // Pick random element
        const targetElement = elementsData[Math.floor(Math.random() * elementsData.length)];
        currentCorrectAnswer = targetElement;

        // Decide Question Type 
        // 0: Symbol -> Name
        // 1: Name -> Symbol
        const questionType = Math.floor(Math.random() * 2);

        // Set Question Text
        if (questionType === 0) {
            questionEl.innerHTML = `What is the name of <span style="color:#007bff">${targetElement.symbol}</span>?`;
        } else {
            questionEl.innerHTML = `What is the symbol for <span style="color:#007bff">${targetElement.name}</span>?`;
        }

        // Generate Distractors (Smart: Strongly prefer very close neighbors)
        const distractors = [];
        const neighborRange = 5; // look for elements within +/- 5 atomic number

        let attempts = 0;
        while (distractors.length < 3 && attempts < 50) {
            attempts++;
            let randomEl;

            // 80% chance to pick a close neighbor
            if (Math.random() < 0.8) {
                // Pick a neighbor
                const offset = Math.floor(Math.random() * (neighborRange * 2 + 1)) - neighborRange;
                const neighborNum = targetElement.atomic_number + offset;
                randomEl = elementsData.find(e => e.atomic_number === neighborNum);
            }

            if (!randomEl) {
                // Fallback to purely random
                randomEl = elementsData[Math.floor(Math.random() * elementsData.length)];
            }

            // Avoid duplicates and correct answer
            if (randomEl &&
                randomEl.atomic_number !== targetElement.atomic_number &&
                !distractors.find(d => d.atomic_number === randomEl.atomic_number)) {
                distractors.push(randomEl);
            }
        }

        // Combine and Shuffle Options
        const options = [...distractors, targetElement];
        options.sort(() => Math.random() - 0.5);

        // Render Options
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';

            // Set button text based on question type
            if (questionType === 1) {
                btn.textContent = opt.symbol;
            } else {
                btn.textContent = opt.name;
            }

            btn.onclick = () => handleAnswer(opt, btn, questionType);
            optionsEl.appendChild(btn);
        });
    }

    // Handle User Answer
    function handleAnswer(selectedElement, btnElement, questionType) {
        if (!isGameActive) return;
        isGameActive = false;

        const isCorrect = selectedElement.atomic_number === currentCorrectAnswer.atomic_number;

        // Highlight buttons
        const allButtons = optionsEl.querySelectorAll('.option-btn');
        allButtons.forEach(btn => {
            // Logic: we need to match the text content to the correct answer's property
            // questionType 1 is Name -> Symbol, so buttons have Symbols.
            // Others (0 and 2) have buttons with Names.
            const correctText = questionType === 1 ? currentCorrectAnswer.symbol : currentCorrectAnswer.name;

            if (btn.textContent === correctText) {
                btn.classList.add('correct');
            }
            // If this was the clicked button and it's wrong, highlight red
            if (btn === btnElement && !isCorrect) {
                btn.classList.add('wrong');
            }
        });

        // Update Score/Feedback
        if (isCorrect) {
            currentScore += 10 + (currentStreak * 2); // Bonus for streak
            currentStreak++;
            feedbackEl.textContent = 'Correct! Great Job!';
            feedbackEl.style.color = 'green';
            scoreEl.textContent = currentScore;
            streakEl.textContent = currentStreak;
            
            // Show Next Button
            nextBtn.style.display = 'inline-block';
        } else {
            currentStreak = 0;
            lives--;
            livesEl.textContent = lives;
            streakEl.textContent = currentStreak;
            
            feedbackEl.textContent = `Wrong! The answer was ${currentCorrectAnswer.name} (${currentCorrectAnswer.symbol})`;
            feedbackEl.style.color = 'red';

            if (lives <= 0) {
                endGame();
            } else {
                nextBtn.style.display = 'inline-block';
            }
        }
    }
    
    function endGame() {
        finalScoreEl.textContent = currentScore;
        
        // Hide Game Elements
        questionEl.style.display = 'none';
        optionsEl.style.display = 'none';
        feedbackEl.style.display = 'none';
        nextBtn.style.display = 'none';
        // score-board stays visible or hidden? Let's hide it to clean up view
        document.querySelector('.score-board').style.display = 'none';

        // Show Game Over
        gameOverScreen.style.display = 'block';
    }

    // Start
    initGame();
});
