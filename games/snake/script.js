const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const statusMsg = document.getElementById('statusMsg');
const restartBtn = document.getElementById('restartBtn');

// --- FIXED CONFIGURATION ---
// We define the "World" as 20x20 units. 
// This ensures there are NO extra spaces and no invisible walls.
const GRID_SIZE = 15; 
const MAP_SIZE = 15; 

let snake, food, dx, dy, nextDx, nextDy;
let score = 0;
let gameLoop;

// Set the internal canvas resolution to a fixed size
function init() {
    canvas.width = 600; // Fixed width
    canvas.height = 600; // Fixed height

    score = 0;
    scoreDisplay.innerText = score;
    statusMsg.textContent = "Press Arrows/WASD to start!";
    statusMsg.style.color = "#cbe1ff";

    // Snake starts in the middle of the 20x20 grid
    snake = [
        {x: 7, y: 8},
        {x: 7, y: 9},
        {x: 7, y: 10}
    ];

    dx = 0;
    dy = 0;
    nextDx = 0;
    nextDy = 0;

    createFood();

    if (gameLoop) clearInterval(gameLoop);
    // The game logic now runs perfectly on a fixed 20x20 grid
    gameLoop = setInterval(update, 100);
}

function createFood() {
    food = {
        x: Math.floor(Math.random() * MAP_SIZE),
        y: Math.floor(Math.random() * MAP_SIZE)
    };
    // Ensure food doesn't spawn on snake body
    for (let part of snake) {
        if (part.x === food.x && part.y === food.y) {
            createFood();
            break;
        }
    }
}

function update() {
    // Update directions based on input buffer
    dx = nextDx;
    dy = nextDy;

    if (dx !== 0 || dy !== 0) {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        snake.unshift(head);

        // Check if food eaten
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreDisplay.innerText = score;
            createFood();
        } else {
            snake.pop();
        }

        // BOUNDARY CHECK: This is the part that fixes the "middle" death.
        // Because we use a fixed 20x20 grid, the "edges" are now perfectly aligned.
        if (head.x < 0 || head.x >= MAP_SIZE || head.y < 0 || head.y >= MAP_SIZE) {
            gameOver();
            return;
        }

        // SELF COLLISION
        for (let i = 1; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
                gameOver();
                break;
            }
        }
    }

    draw();
}

function draw() {
    // Clear the board
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    // We multiply by (canvas.width / MAP_SIZE) to ensure it scales perfectly
    let scaleX = canvas.width / MAP_SIZE;
    let scaleY = canvas.height / MAP_SIZE;

    ctx.arc(food.x * scaleX + scaleX/2, food.y * scaleY + scaleY/2, (scaleX/2) - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw Snake
    snake.forEach((part, index) => {
        ctx.fillStyle = (index === 0) ? '#38bdf8' : '#1e293b';
        ctx.strokeStyle = '#0f172a';
        ctx.fillRect(part.x * scaleX, part.y * scaleY, scaleX, scaleY);
        ctx.strokeRect(part.x * scaleX, part.y * scaleY, scaleX, scaleY);
    });
}

function gameOver() {
    statusMsg.textContent = "Game Over! Score: " + score;
    statusMsg.style.color = "#ef4444";
    clearInterval(gameLoop);
}

// Listen for controls
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    // Directional Logic: Only allow turns that aren't 180-degree reversals
    if ((key === 'arrowup' || key === 'w') && dy !== 1) {
        nextDx = 0; nextDy = -1;
    } else if ((key === 'arrowdown' || key === 's') && dy !== -1) {
        nextDx = 0; nextDy = 1;
    } else if ((key === 'arrowleft' || key === 'a') && dx !== 1) {
        nextDx = -1; nextDy = 0;
    } else if ((key === 'arrowright' || key === 'd') && dx !== -1) {
        nextDx = 1; nextDy = 0;
    }

    // Immediate update of current movement for smooth input
    dx = nextDx;
    dy = nextDy;

    if (dx !== 0 || dy !== 0) {
        statusMsg.textContent = "Eat the food!";
        statusMsg.style.color = "#cbe7ff";
    }
});

restartBtn.addEventListener('click', init);

// Boot up game
window.onload = init;
