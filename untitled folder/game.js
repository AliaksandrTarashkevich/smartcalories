const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game constants
const PLATFORM_HEIGHT = 20;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 50;
const BULLET_SIZE = 10;
const BULLET_SPEED = 5;
const GRAVITY = 0.5;
const JUMP_FORCE = 12;
const VERTICAL_SPEED = 8;

// Colors
const SKY_COLOR = '#87CEEB';
const GROUND_COLOR = '#90EE90';
const PLATFORM_COLOR = '#8B4513';

// Game state
let score = 0;
let gameOver = false;
let dodgedBullets = new Set(); // Track unique bullets that passed the player

// Player object
const player = {
    x: 100,
    y: canvas.height - PLATFORM_HEIGHT - PLAYER_HEIGHT,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    velocityY: 0,
    currentPlatform: 0 // Track current platform index
};

// Platform positions (3 levels)
const platforms = [
    { y: canvas.height - PLATFORM_HEIGHT }, // Bottom
    { y: canvas.height * 0.66 }, // Middle
    { y: canvas.height * 0.33 }  // Top
];

// Bullets array
let bullets = [];
let bulletId = 0; // Unique identifier for bullets

// Game controls
let keys = {
    up: false,
    down: false
};

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp') {
        keys.up = true;
        if (!gameOver) moveUp();
    }
    if (e.code === 'ArrowDown') {
        keys.down = true;
        if (!gameOver) moveDown();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowUp') {
        keys.up = false;
    }
    if (e.code === 'ArrowDown') {
        keys.down = false;
    }
});

// Movement functions
function moveUp() {
    if (player.currentPlatform < platforms.length - 1) {
        player.currentPlatform++;
        player.y = platforms[player.currentPlatform].y - player.height;
    }
}

function moveDown() {
    if (player.currentPlatform > 0) {
        player.currentPlatform--;
        player.y = platforms[player.currentPlatform].y - player.height;
    }
}

// Spawn bullets
function spawnBullet() {
    const platformIndex = Math.floor(Math.random() * 3);
    const bulletY = platforms[platformIndex].y - BULLET_SIZE / 2;
    bullets.push({
        id: bulletId++,
        x: canvas.width,
        y: bulletY,
        size: BULLET_SIZE,
        passed: false
    });
}

// Set bullet spawn interval
setInterval(spawnBullet, 2000);

// Check collision
function checkCollision(bullet) {
    return (
        player.x < bullet.x + bullet.size &&
        player.x + player.width > bullet.x &&
        player.y < bullet.y + bullet.size &&
        player.y + player.height > bullet.y
    );
}

// Reset game
function resetGame() {
    score = 0;
    gameOver = false;
    bullets = [];
    dodgedBullets.clear();
    player.y = canvas.height - PLATFORM_HEIGHT - PLAYER_HEIGHT;
    player.currentPlatform = 0;
}

// Check if click is within button bounds
function isClickInButton(x, y) {
    const buttonX = canvas.width / 2 - 50;
    const buttonY = canvas.height / 2 + 60;
    const buttonWidth = 100;
    const buttonHeight = 40;
    
    return x >= buttonX && x <= buttonX + buttonWidth &&
           y >= buttonY && y <= buttonY + buttonHeight;
}

// Add click listener for restart button
canvas.addEventListener('click', (e) => {
    if (gameOver) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (isClickInButton(x, y)) {
            resetGame();
        }
    }
});

// Update game state
function update() {
    if (gameOver) return;

    // Update bullets
    bullets = bullets.filter(bullet => {
        bullet.x -= BULLET_SPEED;
        
        // Check if bullet passed the player
        if (!bullet.passed && bullet.x < player.x && !dodgedBullets.has(bullet.id)) {
            bullet.passed = true;
            dodgedBullets.add(bullet.id);
            score++;
        }
        
        if (checkCollision(bullet)) {
            gameOver = true;
        }
        
        return bullet.x + bullet.size > 0;
    });
}

// Draw game elements
function draw() {
    // Draw sky
    ctx.fillStyle = SKY_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 2/3);

    // Draw ground
    ctx.fillStyle = GROUND_COLOR;
    ctx.fillRect(0, canvas.height * 2/3, canvas.width, canvas.height * 1/3);

    // Draw platforms
    ctx.fillStyle = PLATFORM_COLOR;
    for (let platform of platforms) {
        ctx.fillRect(0, platform.y, canvas.width, PLATFORM_HEIGHT);
    }

    // Draw player (pixel style)
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw simple face for the player
    ctx.fillStyle = '#FFF';
    ctx.fillRect(player.x + player.width * 0.7, player.y + player.height * 0.2, 4, 4); // Eye
    ctx.fillRect(player.x + player.width * 0.3, player.y + player.height * 0.6, 12, 2); // Mouth

    // Draw bullets
    ctx.fillStyle = '#FF0000';
    for (let bullet of bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size);
    }

    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);

    // Draw game over screen
    if (gameOver) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Game Over text
        ctx.fillStyle = '#FFF';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 40);
        
        // Draw restart button
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(canvas.width/2 - 50, canvas.height/2 + 60, 100, 40);
        ctx.fillStyle = '#FFF';
        ctx.font = '20px Arial';
        ctx.fillText('Restart', canvas.width/2, canvas.height/2 + 85);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 