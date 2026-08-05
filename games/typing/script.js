const quoteDisplay = document.getElementById('quote-display');
const typingInput = document.getElementById('typing-input');
const timerEl = document.getElementById('timer');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');

const quotePool = [
    "The Girl you just called fat? She shit herself & lost 15kgs. The Boy you just called stupid? He shit himself. The Girl you just called ugly? She spends hours shitting and farting. The Boy you just tripped? He shit his pants. There's more to people than you think.",
    "Number one. Steady hand. One day, Kim Jong Un need new heart. I do operation. But mistake! Kim Jong Un die! SSD very mad!! I hide fishing boat, come to America. No English, no food, no money. Darryl give me job. Now I have house, American car and new woman. Darryl save life. My big secret. I kill Kim Jong Un on purpose. I good surgeon. The best!",
    "Hey guys, did you know that in terms of male human and female Pokemon breeding, Vaporeon is the most compatible Pokemon for humans? Not only are they in the field egg group, which is mostly comprised of mammals, Vaporeon are an average of 3'03' tall and 63.9 pounds, this means they're large enough to be able handle human dicks",
    "Earlier today I was really horny, and I saw what I thought to be a blank dvd. I thought, DVDs have a tight hole, they might feel pretty good. So I put my soft pp into the hole of the DVD, and for a few seconds as I started getting harder, it felt pretty good, but then, once I was fully erect, it started being painful.",
    "Due to their mostly water based biology, there's no doubt in my mind that an aroused Vaporeon would be incredibly wet, so wet that you could easily have sex with one for hours without getting sore. They can also learn the moves Attract, Baby-Doll Eyes, Captivate, Charm, and Tail Whip, along with not having fur to hide nipples, so it'd be incredibly easy for one to get you in the mood."
];

let currentQuote = "";
let timer;
let timeElapsed = 0;
let isStarted = false;
let startTime;

function init() {
    const randomIndex = Math.floor(Math.random() * quotePool.length);
    currentQuote = quotePool[randomIndex];

    typingInput.value = "";
    timeElapsed = 0;
    isStarted = false;
    clearInterval(timer);
    timerEl.innerText = "00:00";
    wpmEl.innerText = "0";
    accuracyEl.innerText = "100%";
    messageEl.textContent = "Type the text above to begin!";
    
    quoteDisplay.innerHTML = '';
    const quote_array = currentQuote.split('');
    quote_array.forEach(char => {
        const span = document.createElement('span');
        span.innerText = char;
        quoteDisplay.appendChild(span);
    });

    typingInput.focus();
}

typingInput.addEventListener('input', () => {
    if (!isStarted && typingInput.value.length > 0) {
        startTimer();
    }

    const inputVal = typingInput.value;
    const spans = quoteDisplay.querySelectorAll('span');
    let correctChars = 0;

    spans.forEach((span, index) => {
        const char = span.innerText;
        if (inputVal[index] === undefined) {
            span.className = '';
        } else if (inputVal[index] === char) {
            span.classList.add('correct');
            span.classList.remove('incorrect');
            correctChars++;
        } else {
            span.classList.add('incorrect');
            span.classList.remove('correct');
        }
    });

    // Calculate Accuracy
    let accuracy = 0;
    if (inputVal.length > 0) {
        accuracy = Math.floor((correctChars / inputVal.length) * 100);
    } else {
        accuracy = 100;
    }
    accuracyEl.innerText = `${accuracy}%`;

    // SIMPLIFIED SUCCESS CONDITION:
    if (inputVal.length >= currentQuote.length) {
        clearInterval(timer);
        messageEl.style.color = "#22c55e"; // Green highlight for victory
        messageEl.textContent = "You finished the mess.";
    } else {
        messageEl.textContent = "Keep typing...";
        messageEl.style.color = "#cbe7ff"; 
    }
});

function startTimer() {
    isStarted = true;
    startTime = new Date();
    timer = setInterval(() => {
        timeElapsed = Math.floor((new Date() - startTime) / 1000);
        const mins = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
        const secs = (timeElapsed % 60).toString().padStart(2, '0');
        timerEl.innerText = `${mins}:${secs}`;

        const timeInMinutes = timeElapsed / 60;
        if (timeInMinutes > 0) {
            const wpm = Math.round((typingInput.value.length / 5) / timeInMinutes);
            wpmEl.innerText = wpm;
        }
    }, 1000);
}

restartBtn.addEventListener('click', () => {
    messageEl.style.color = "#cbe7ff"; 
    init();
});

window.onload = init;