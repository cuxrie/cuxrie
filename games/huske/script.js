const board = document.getElementById('board');
const movesCountEl = document.getElementById('movesCount');
const matchesCountEl = document.getElementById('matchesCount');
const timerEl = document.getElementById('timer');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');

const PAIRS = 12;
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

let cardValues = [];
let moves = 0;
let matches = 0;
let seconds = 0;
let timerInterval = null;
let started = false;
let firstCard = null;
let secondCard = null;
let lockBoard = false;

function createCardValues() {
    const chosenImages = shuffle([...IMAGE_PATHS]).slice(0, PAIRS);
    const values = chosenImages.flatMap((path) => [path, path]);
    return shuffle(values);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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

function updateStats() {
    movesCountEl.textContent = moves;
    matchesCountEl.textContent = `${matches} / ${PAIRS}`;
}

function resetBoardState() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function revealCard(card) {
    if (lockBoard || card === firstCard || card.classList.contains('matched')) return;
    card.classList.add('revealed');
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
    const firstValue = firstCard.dataset.value;
    const secondValue = secondCard.dataset.value;
    if (firstValue === secondValue) {
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
    resetBoardState();
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

function createCard(value) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.value = value;
    card.innerHTML = `
        <div class="card-inner">
          <div class="card-face card-front"></div>
          <div class="card-face card-back">
            <img src="${encodeURI(value)}" alt="Monk card" draggable="false">
          </div>
        </div>
    `;
    card.addEventListener('click', () => revealCard(card));
    return card;
}

function renderBoard() {
    board.innerHTML = '';
    cardValues = createCardValues();
    cardValues.forEach((value) => {
        board.appendChild(createCard(value));
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

restartBtn.addEventListener('click', resetGame);

// Initialize the game on load
window.onload = () => {
    resetGame();
};
