// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'
];

// Audio element
const lineClearSound = new Audio();
lineClearSound.src = 'assets/wow.opus';
lineClearSound.preload = 'auto';
lineClearSound.load();

// Game variables
let canvas;
let ctx;
let nextCanvas;
let nextCtx;
let board = [];
let currentPiece;
let nextPiece;
let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;
let isPaused = false;
let dropInterval;
let dropStart;
let touchStartX = 0;
let touchStartY = 0;
let lastTap = 0;
let animationId = null;

// Block shapes
const SHAPES = [
    // I
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    // J
    [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    // L
    [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    // O
    [
        [1, 1],
        [1, 1]
    ],
    // S
    [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    // T
    [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    // Z
    [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]
];

// DOM elements
const gameCanvas = document.getElementById('game-canvas');
const nextBlockElement = document.getElementById('next-block-canvas');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const resetButton = document.getElementById('reset-button');
const gameOverModal = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const finalLinesElement = document.getElementById('final-lines');
const finalLevelElement = document.getElementById('final-level');
const playAgainButton = document.getElementById('play-again');
const levelUpModal = document.getElementById('level-up');
const newLevelElement = document.getElementById('new-level');
const continueButton = document.getElementById('continue');
const pauseScreen = document.getElementById('pause-screen');
const resumeButton = document.getElementById('resume');

// Initialize game
function init() {
    canvas = gameCanvas;
    ctx = canvas.getContext('2d');
    nextCanvas = nextBlockElement;
    nextCtx = nextCanvas.getContext('2d');

    // Set canvas sizes
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    nextCanvas.width = 4 * BLOCK_SIZE;
    nextCanvas.height = 4 * BLOCK_SIZE;

    // Scale for retina displays
    const scale = window.devicePixelRatio || 1;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.width = canvas.width * scale;
    canvas.height = canvas.height * scale;
    ctx.scale(scale, scale);

    nextCanvas.style.width = nextCanvas.width + 'px';
    nextCanvas.style.height = nextCanvas.height + 'px';
    nextCanvas.width = nextCanvas.width * scale;
    nextCanvas.height = nextCanvas.height * scale;
    nextCtx.scale(scale, scale);

    // Initialize empty board
    createBoard();
    
    // Event Listeners
    document.addEventListener('keydown', handleKeyPress);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);
    resetButton.addEventListener('click', resetGame);
    playAgainButton.addEventListener('click', resetGame);
    continueButton.addEventListener('click', () => levelUpModal.classList.add('hidden'));
    resumeButton.addEventListener('click', togglePause);

    // Draw initial state
    draw();
}

// Create empty board
function createBoard() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// Create new piece
function createPiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[shapeIndex];
    const color = COLORS[shapeIndex];
    
    return {
        shape,
        color,
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0
    };
}

// Draw functions
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    // Draw grid
    drawGrid();
    
    // Draw board
    drawBoard();
    
    // Draw current piece
    if (currentPiece) {
        drawPiece(currentPiece);
    }

    // Draw next piece
    if (nextPiece) {
        drawNextPiece();
    }
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, ROWS * BLOCK_SIZE);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(COLS * BLOCK_SIZE, y * BLOCK_SIZE);
        ctx.stroke();
    }
}

function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(x, y, value);
            }
        });
    });
}

function drawPiece(piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(piece.x + x, piece.y + y, piece.color);
            }
        });
    });
}

function drawNextPiece() {
    const offsetX = (4 - nextPiece.shape[0].length) / 2;
    const offsetY = (4 - nextPiece.shape.length) / 2;

    nextPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(offsetX + x, offsetY + y, nextPiece.color, nextCtx);
            }
        });
    });
}

function drawBlock(x, y, color, context = ctx) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = '#000';
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // Add 3D effect
    context.fillStyle = 'rgba(255, 255, 255, 0.1)';
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE / 4);
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE / 4, BLOCK_SIZE);
}

// Game Logic
function startGame() {
    if (gameOver) {
        resetGame();
    }
    
    gameOver = false;
    isPaused = false;
    score = 0;
    level = 1;
    lines = 0;
    updateScore();
    
    createBoard();
    currentPiece = createPiece();
    nextPiece = createPiece();
    
    // Check if the first piece can be placed
    if (checkCollision()) {
        gameOver = true;
        showGameOver();
        return;
    }
    
    dropStart = Date.now();
    dropInterval = 1000 - (level - 1) * 50;
    
    startButton.disabled = true;
    pauseButton.disabled = false;
    
    if (!animationId) {
        gameLoop();
    }
}

function resetGame() {
    gameOver = false;
    isPaused = false;
    score = 0;
    level = 1;
    lines = 0;
    updateScore();
    
    createBoard();
    currentPiece = createPiece();
    nextPiece = createPiece();
    
    gameOverModal.classList.add('hidden');
    levelUpModal.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    
    startButton.disabled = false;
    pauseButton.disabled = true;
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    draw();
}

function gameLoop() {
    if (gameOver || isPaused) return;
    
    const now = Date.now();
    const delta = now - dropStart;
    
    if (delta > dropInterval) {
        moveDown();
        dropStart = now;
    }
    
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

function moveDown() {
    currentPiece.y++;
    
    if (checkCollision()) {
        currentPiece.y--;
        mergePiece();
        clearLines();
        currentPiece = nextPiece;
        nextPiece = createPiece();
        
        if (checkCollision()) {
            gameOver = true;
            showGameOver();
        }
    }
}

function moveLeft() {
    currentPiece.x--;
    if (checkCollision()) {
        currentPiece.x++;
    }
}

function moveRight() {
    currentPiece.x++;
    if (checkCollision()) {
        currentPiece.x--;
    }
}

function rotate() {
    const originalShape = currentPiece.shape;
    const rows = originalShape.length;
    const cols = originalShape[0].length;
    const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
    
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            rotated[x][rows - 1 - y] = originalShape[y][x];
        }
    }
    
    currentPiece.shape = rotated;
    
    // Wall kick
    if (checkCollision()) {
        // Try moving left
        currentPiece.x--;
        if (checkCollision()) {
            // Try moving right
            currentPiece.x += 2;
            if (checkCollision()) {
                // Revert changes
                currentPiece.x--;
                currentPiece.shape = originalShape;
            }
        }
    }
}

function checkCollision() {
    return currentPiece.shape.some((row, y) => {
        return row.some((value, x) => {
            if (!value) return false;
            
            const newX = currentPiece.x + x;
            const newY = currentPiece.y + y;
            
            return (
                newX < 0 ||
                newX >= COLS ||
                newY >= ROWS ||
                (newY >= 0 && board[newY][newX])
            );
        });
    });
}

function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                }
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            // Remove the line
            board.splice(y, 1);
            // Add new empty line at top
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++; // Check the same line again
        }
    }
    
    if (linesCleared > 0) {
        // Play sound effect
        try {
            lineClearSound.currentTime = 0;
            const playPromise = lineClearSound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Audio play failed:', error);
                    // Try to play again with user interaction
                    document.addEventListener('click', () => {
                        lineClearSound.play().catch(e => console.log('Retry play failed:', e));
                    }, { once: true });
                });
            }
        } catch (error) {
            console.log('Audio error:', error);
        }
        
        // Update score
        lines += linesCleared;
        score += calculateScore(linesCleared);
        
        // Check for level up
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            dropInterval = 1000 - (level - 1) * 50;
            showLevelUp();
        }
        
        updateScore();
    }
}

function calculateScore(linesCleared) {
    const points = [0, 100, 300, 500, 800];
    return points[linesCleared] * level;
}

function updateScore() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
}

function showGameOver() {
    finalScoreElement.textContent = score;
    finalLinesElement.textContent = lines;
    finalLevelElement.textContent = level;
    gameOverModal.classList.remove('hidden');
    startButton.disabled = false;
    pauseButton.disabled = true;
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function showLevelUp() {
    newLevelElement.textContent = level;
    levelUpModal.classList.remove('hidden');
    isPaused = true;
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseScreen.classList.remove('hidden');
    } else {
        pauseScreen.classList.add('hidden');
        dropStart = Date.now();
        gameLoop();
    }
}

// Input Handlers
function handleKeyPress(event) {
    if (gameOver || isPaused) return;
    
    switch (event.keyCode) {
        case 37: // Left arrow
            moveLeft();
            break;
        case 39: // Right arrow
            moveRight();
            break;
        case 40: // Down arrow
            moveDown();
            break;
        case 38: // Up arrow
            rotate();
            break;
        case 32: // Space
            hardDrop();
            break;
        case 80: // P
            togglePause();
            break;
    }
}

function handleTouchStart(event) {
    if (gameOver || isPaused) return;
    
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    
    // Check for double tap
    const now = Date.now();
    if (now - lastTap < 300) {
        hardDrop();
    }
    lastTap = now;
}

function handleTouchMove(event) {
    if (gameOver || isPaused) return;
    
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;
    
    const diffX = touchX - touchStartX;
    const diffY = touchY - touchStartY;
    
    // Horizontal swipe
    if (Math.abs(diffX) > 30) {
        if (diffX > 0) {
            moveRight();
        } else {
            moveLeft();
        }
        touchStartX = touchX;
    }
    
    // Vertical swipe
    if (diffY > 30) {
        moveDown();
        touchStartY = touchY;
    }
}

function handleTouchEnd(event) {
    if (gameOver || isPaused) return;
    
    const touchX = event.changedTouches[0].clientX;
    const touchY = event.changedTouches[0].clientY;
    
    const diffX = touchX - touchStartX;
    const diffY = touchY - touchStartY;
    
    // Tap to rotate
    if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
        rotate();
    }
}

function hardDrop() {
    while (!checkCollision()) {
        currentPiece.y++;
    }
    currentPiece.y--;
    mergePiece();
    clearLines();
    currentPiece = nextPiece;
    nextPiece = createPiece();
    
    if (checkCollision()) {
        gameOver = true;
        showGameOver();
    }
}

// Initialize game when window loads
window.addEventListener('load', init); 