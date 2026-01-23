document.addEventListener('DOMContentLoaded', () => {
    // Game variables
    let currentScore = 0;
    let currentStreak = 0;
    let currentCorrectAnswer = null;
    let isGameActive = true;

    // DOM Elements
    const questionEl = document.getElementById('question');
    const optionsEl = document.getElementById('options');
    const scoreEl = document.getElementById('score');
    const streakEl = document.getElementById('streak');
    const feedbackEl = document.getElementById('feedback');
    const nextBtn = document.getElementById('nextBtn');

    // Init Game
    function initGame() {
        nextBtn.addEventListener('click', generateQuestion);
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

        // Pick random reaction
        const targetReaction = reactionsData[Math.floor(Math.random() * reactionsData.length)];
        currentCorrectAnswer = targetReaction;

        // Set Question Text (show reactants, ask for products)
        questionEl.innerHTML = `${targetReaction.reactants} → ?`;

        // Generate Distractors
        const distractors = [];
        let attempts = 0;
        while (distractors.length < 3 && attempts < 50) {
            attempts++;
            const randomReaction = reactionsData[Math.floor(Math.random() * reactionsData.length)];

            // Avoid duplicates and correct answer
            if (randomReaction.id !== targetReaction.id &&
                !distractors.find(d => d.id === randomReaction.id)) {
                distractors.push(randomReaction);
            }
        }

        // Combine and Shuffle Options
        const options = [...distractors, targetReaction];
        options.sort(() => Math.random() - 0.5);

        // Render Options
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt.products;
            btn.onclick = () => handleAnswer(opt, btn);
            optionsEl.appendChild(btn);
        });
    }

    // Handle User Answer
    function handleAnswer(selectedReaction, btnElement) {
        if (!isGameActive) return;
        isGameActive = false;

        const isCorrect = selectedReaction.id === currentCorrectAnswer.id;

        // Highlight buttons
        const allButtons = optionsEl.querySelectorAll('.option-btn');
        allButtons.forEach(btn => {
            if (btn.textContent === currentCorrectAnswer.products) {
                btn.classList.add('correct');
            }
            if (btn === btnElement && !isCorrect) {
                btn.classList.add('wrong');
            }
        });

        // Update Score/Feedback
        if (isCorrect) {
            currentScore += 10 + (currentStreak * 2);
            currentStreak++;
            feedbackEl.textContent = 'Correct! Great Job!';
            feedbackEl.style.color = 'green';
        } else {
            currentStreak = 0;
            feedbackEl.textContent = `Wrong! The answer was ${currentCorrectAnswer.products}`;
            feedbackEl.style.color = 'red';
        }

        scoreEl.textContent = currentScore;
        streakEl.textContent = currentStreak;

        // Show Next Button
        nextBtn.style.display = 'inline-block';
    }

    // Start
    initGame();
});
