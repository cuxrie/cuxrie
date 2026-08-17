const board = document.getElementById('board');
const movesCountEl = document.getElementById('movesCount');
const matchesCountEl = document.getElementById('matchesCount');
const timerEl = document.getElementById('timer');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');
const shuffleToggle = document.getElementById('shuffleChallengeToggle'); 

const PAIRS = 12;
// This list stays in JS memory and is never printed into the HTML.
const IMAGE_PATHS = [
    'monks/monk default.png',
    'monks/monk diff0.png',
    'monks/monk diff1.png',
    'monks/monk diff2.png',
    'monks/monk diff3.png',
    'monks/monk diff4.png',
    'monks/monk diff5.png',
    'monks/monk diff6.png',
    'monks/monk diff7.png',
    'monks/monk diff8.png',
    'monks/monk diff9.png',
    'monks/monk diff10.png'
];

let moves = 0;
let matches = 0;
let seconds = 0;
let timerInterval = null;
let started = false;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let shuffleChallengeEnabled = true; 

// Helper to draw onto canvas
function drawImageToCanvas(canvasElement, imageUrl) {
    const ctx = canvasElement.getContext('2d');
    const img = new Image();
    img.src = encodeURI(imageUrl); 
    img.onload = () => {
        canvasElement.width = img.width;
        canvasElement.height = img.height;
        ctx.drawImage(img, 0, 0);
    };
}

function createCard(value) {
    const card = document.createElement('div');
    card.className = 'card';
    
    card.internalValue = value; 

    card.innerHTML = `
        <div class="card-inner">
          <div class="card-face card-front"></div>
          <div class="card-face card-back">
            <canvas></canvas>
          </div>
        </div>
    `;
    return card;
}

function attachCardListeners(card) {
    card.addEventListener('click', cardClickHandler);
}

function cardClickHandler() {
    const card = this;
    revealCard(card);
}

function revealCard(card) {
    if (lockBoard || card === firstCard || card.classList.contains('matched')) return;
    
    card.classList.add('revealed');

    const canvas = card.querySelector('canvas');
    if (canvas && card.internalValue) {
        drawImageToCanvas(canvas, card.internalValue);
    }

    if (!started) {
        started = true;
        startTimer();
    }
    if (!firstCard) {
        firstCard = card;
        messageEl.textContent = 'Select another card to find a match.';
        return;
    }
    secondCard = card;
    moves += 1;
    updateStats();
    checkForMatch();
}

function checkForMatch() {
    if (firstCard.internalValue === secondCard.internalValue) {
        disableMatchedCards();
    } else {
        unflipNonMatchingCards();
    }
}

function disableMatchedCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matches += 1;
    updateStats();
    
    // Wait for the animation
    setTimeout(() => {
        if (matches < PAIRS) {
            // --- MODIFICATION HERE: Check the challenge state ---
            if (shuffleChallengeEnabled) {
                shuffleUnmatchedCards();
            } else {
                // If shuffling is off, just reset the internal pointers
                resetBoardState();
            }
        } else {
            // If game is over, just reset internal pointers
            resetBoardState();
        }
    }, 100); 

    if (matches === PAIRS) {
        stopTimer();
        messageEl.textContent = `Victory! You finished in ${moves} moves and ${formatTime(seconds)}.`;
    } else {
        messageEl.textContent = `Nice match! ${PAIRS - matches} pairs to go.`;
    }
}

function unflipNonMatchingCards() {
    lockBoard = true;
    messageEl.textContent = 'No match. Try again.';
    setTimeout(() => {
        firstCard.classList.remove('revealed');
        secondCard.classList.remove('revealed');
        resetBoardState();
        messageEl.textContent = 'Pick a new card.';
    }, 900);
}

function updateStats() {
    movesCountEl.textContent = moves;
    matchesCountEl.textContent = `${matches} / ${PAIRS}`;
}

function formatTime(sec) {
    const minutes = String(Math.floor(sec / 60)).padStart(2, '0');
    const secondsPart = String(sec % 60).padStart(2, '0');
    return `${minutes}:${secondsPart}`;
}

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        seconds += 1;
        timerEl.textContent = formatTime(seconds);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetBoardState() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function shuffleUnmatchedCards() {
    const allCards = Array.from(board.children);

    // Only cards that have not been matched participate in the shuffle.
    const unmatchedCards = allCards.filter(
        card => !card.classList.contains('matched')
    );

    if (unmatchedCards.length <= 1) return;

    // Extract the values from the unmatched cards.
    const values = unmatchedCards.map(card => card.internalValue);

    // Shuffle the values, not the DOM elements.
    shuffle(values);

    // Assign the shuffled values back to the existing card positions.
    unmatchedCards.forEach((card, index) => {
        card.internalValue = values[index];
    });

    // Clear references to the cards involved in the previous turn.
    resetBoardState();
}

function renderBoard() {
    board.innerHTML = '';
    let indices = [];
    for(let i=0; i<PAIRS; i++) { indices.push(i); }
    const shuffledIndices = shuffle([...indices, ...indices]);

    shuffledIndices.forEach((idx) => {
        board.appendChild(createCard(IMAGE_PATHS[idx]));
    });
    
    // Attach all listeners after the entire board is built
    Array.from(board.children).forEach(card => {
        attachCardListeners(card);
    });
}

function resetGame() {
    stopTimer();
    seconds = 0;
    timerEl.textContent = formatTime(seconds);
    moves = 0;
    matches = 0;
    started = false;
    updateStats();
    messageEl.textContent = 'Game reset. Flip a card to begin.';
    resetBoardState();
    renderBoard();
}

// --- NEW: Event listener for the challenge toggle ---
shuffleToggle.addEventListener('change', (event) => {
    shuffleChallengeEnabled = event.target.checked;
    resetGame();
});

restartBtn.addEventListener('click', resetGame);
window.onload = () => {
    resetGame();
};
