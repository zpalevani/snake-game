const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const restartBtn = document.getElementById('restartBtn');

// Game Constants
const GRID_SIZE = 20;
const TILE_COUNT = 20; // 400px / 20px = 20 tiles
const INITIAL_SPEED = 150; // ms per frame
const SPEED_DECREMENT = 2; // Decrease ms (increase speed) per apple
const MIN_SPEED = 50; // Cap max speed

// Game State
let snake = [];
let apple = { x: 0, y: 0 };
let dx = 0;
let dy = 0;
let score = 0;
let isGameRunning = false;
let isPaused = false;
let currentSpeed = INITIAL_SPEED;
let lastRenderTime = 0;

// Initialize Game
function initGame() {
    // Snake starts in middle, length 2
    const mid = Math.floor(TILE_COUNT / 2);
    snake = [
        { x: mid, y: mid },
        { x: mid, y: mid + 1 } // Tail below head initially
    ];

    // Reset state
    dx = 0;
    dy = 0;
    score = 0;
    currentSpeed = INITIAL_SPEED;
    isGameRunning = false;
    isPaused = false;

    scoreElement.textContent = score;
    placeApple();
    draw();

    // Show start screen
    startScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
}

function startGame() {
    if (isGameRunning) return;

    isGameRunning = true;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    window.requestAnimationFrame(main);
}

function main(currentTime) {
    if (!isGameRunning) return;

    window.requestAnimationFrame(main);

    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < currentSpeed / 1000) return;

    lastRenderTime = currentTime;

    if (!isPaused && (dx !== 0 || dy !== 0)) {
        update();
    }

    draw();
}

function update() {
    // Calculate new head position
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check Wall Collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Check Self Collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head); // Add new head

    // Check Apple Collision
    if (head.x === apple.x && head.y === apple.y) {
        score += 5;
        scoreElement.textContent = score;

        // Increase speed
        if (currentSpeed > MIN_SPEED) {
            currentSpeed -= SPEED_DECREMENT;
        }

        placeApple();
        // Don't pop tail, so snake grows
    } else {
        snake.pop(); // Remove tail if no apple eaten
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Apple
    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(
        apple.x * GRID_SIZE + GRID_SIZE / 2,
        apple.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow for other elements if needed

    // Draw Snake
    snake.forEach((segment, index) => {
        // Head color vs Body color
        if (index === 0) {
            ctx.fillStyle = '#00ff88';
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 10;
        } else {
            ctx.fillStyle = '#00cc6a';
            ctx.shadowBlur = 0;
        }

        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
    });
}

function placeApple() {
    let validPosition = false;
    while (!validPosition) {
        apple.x = Math.floor(Math.random() * TILE_COUNT);
        apple.y = Math.floor(Math.random() * TILE_COUNT);

        validPosition = true;
        // Make sure apple doesn't spawn on snake
        for (let segment of snake) {
            if (segment.x === apple.x && segment.y === apple.y) {
                validPosition = false;
                break;
            }
        }
    }
}

function gameOver() {
    isGameRunning = false;
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Input Handling
document.addEventListener('keydown', (e) => {
    // Prevent default scrolling for arrow keys and space
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].indexOf(e.code) > -1) {
        e.preventDefault();
    }

    // Determine if we should allow the key press to start the game
    // Only start if we are on the start screen (not game over)
    const canStart = !isGameRunning && !startScreen.classList.contains('hidden') && gameOverScreen.classList.contains('hidden');

    // Check current direction/orientation to prevent immediate reversal
    // If snake is stationary (dy=0), check body segments to determine facing
    const goingUp = dy === -1 || (dy === 0 && snake[0].y < snake[1].y);
    const goingDown = dy === 1 || (dy === 0 && snake[0].y > snake[1].y);
    const goingLeft = dx === -1 || (dx === 0 && snake[0].x < snake[1].x);
    const goingRight = dx === 1 || (dx === 0 && snake[0].x > snake[1].x);

    switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
            if (goingDown) break;
            dx = 0; dy = -1;
            if (canStart) startGame();
            break;
        case 'arrowdown':
        case 's':
            if (goingUp) break;
            dx = 0; dy = 1;
            if (canStart) startGame();
            break;
        case 'arrowleft':
        case 'a':
            if (goingRight) break;
            dx = -1; dy = 0;
            if (canStart) startGame();
            break;
        case 'arrowright':
        case 'd':
            if (goingLeft) break;
            dx = 1; dy = 0;
            if (canStart) startGame();
            break;
        case ' ':
            if (isGameRunning) {
                // Stop movement
                dx = 0;
                dy = 0;
            }
            break;
    }
});

restartBtn.addEventListener('click', () => {
    initGame();
    startGame();
});

// Initial Setup
initGame();
