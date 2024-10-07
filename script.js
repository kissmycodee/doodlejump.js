const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const platformImg = loadImage('img/platform.png');
const doodlerImg = loadImage('img/doodler-guy.png');
const backgroundImg = loadImage('img/background.png');

// Load jump sound
const jumpSound = new Audio('audio/jump.mp3'); // Ensure correct path

// Game Variables
let player;
const platforms = [];
let score = 0;
let isGameOver = false;
const gravity = 0.5;
const jumpForce = -15;
const NEW_PLATFORM_THRESHOLD = 300;
const MAX_PLATFORMS = 100; // Maximum number of platforms on screen
const PLATFORM_SPACING = 100; // Minimum space between platforms

// Movement direction variables
let moveLeft = false;
let moveRight = false;

class Player {
    constructor(startY) {
        this.width = 30;
        this.height = 30;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = startY - this.height;
        this.velocityY = 0;
        this.image = doodlerImg;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        // Player physics and position updates
        this.y += this.velocityY;
        this.velocityY += gravity;

        // Update horizontal position based on directional movement
        if (moveLeft) {
            this.move(-5); // Adjust speed as necessary
        }
        if (moveRight) {
            this.move(5);
        }

        this.handlePlatformCollisions();

        if (this.y < NEW_PLATFORM_THRESHOLD) {
            this.generatePlatformsAndUpdateScore();
        }

        this.checkOffScreenPlatforms();
        this.checkGameOver();
    }

    handlePlatformCollisions() {
        platforms.forEach(platform => {
            if (this.isCollidingWith(platform) && this.velocityY >= 0) {
                this.velocityY = jumpForce;

                // Play the jump sound
                jumpSound.currentTime = 0; // Reset sound playback
                jumpSound.play();
                
                score += 10; // Increase score for jumping
            }
        });
    }

    generatePlatformsAndUpdateScore() {
        if (platforms.length < MAX_PLATFORMS) {
            generateNewPlatforms();
        }
        platforms.forEach(platform => platform.y += 5);
        this.y = NEW_PLATFORM_THRESHOLD;
        score++;
    }

    checkOffScreenPlatforms() {
        for (let i = platforms.length - 1; i >= 0; i--) {
            if (platforms[i].y > canvas.height) {
                platforms.splice(i, 1);
            }
        }
    }

    checkGameOver() {
        if (this.y + this.height > canvas.height) {
            this.triggerGameOver();
        }
    }

    triggerGameOver() {
        this.y = canvas.height - this.height;
        this.velocityY = 0;
        isGameOver = true;
    }

    isCollidingWith(platform) {
        return (
            this.x < platform.x + platform.width &&
            this.x + this.width > platform.x &&
            this.y + this.height <= platform.y + platform.height &&
            this.y + this.height + this.velocityY >= platform.y
        );
    }

    move(deltaX) {
        this.x += deltaX;

        if (this.x < -this.width) {
            this.x = canvas.width;
        } else if (this.x > canvas.width) {
            this.x = -this.width;
        }
    }
}

class Platform {
    constructor(x, y) {
        this.width = 100;
        this.height = 10;
        this.x = x;
        this.y = y;
        this.image = platformImg;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Utility function to load images
function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

// Function to create initial platforms
function createPlatforms() {
    platforms.length = 0;
    const numberOfPlatforms = 10; // Set initial platforms
    for (let i = 0; i < numberOfPlatforms; i++) {
        const x = Math.random() * (canvas.width - 100);
        const y = i * PLATFORM_SPACING; // Ensure spacing
        platforms.push(new Platform(x, y));
    }
}

// Function to generate new platforms
function generateNewPlatforms() {
    const numberOfNewPlatforms = 3; // Define how many to generate each time
    for (let i = 0; i < numberOfNewPlatforms; i++) {
        const x = Math.random() * (canvas.width - 100);
        const y = Math.random() * (NEW_PLATFORM_THRESHOLD - PLATFORM_SPACING); // Limit height of new platforms
        if (platforms.every(platform => Math.abs(platform.y - y) >= PLATFORM_SPACING)) {
            platforms.push(new Platform(x, y));
        }
    }
}

// Function to initialize the game
function init() {
    createPlatforms();
    player = new Player(getLowestPlatformY());
    score = 0;
    isGameOver = false;
    requestAnimationFrame(gameLoop);
}

// Function to find Y coordinate of the lowest platform
function getLowestPlatformY() {
    return platforms.reduce((lowestY, platform) => Math.min(lowestY, platform.y), canvas.height);
}

// Event listeners for touch and keyboard controls
canvas.addEventListener('touchstart', (event) => {
    const touchX = event.touches[0].clientX;
    if (touchX < canvas.width / 2) {
        moveLeft = true;
    } else {
        moveRight = true;
    }
});

canvas.addEventListener('touchend', () => {
    moveLeft = false;
    moveRight = false;
});

window.addEventListener('keydown', (event) => {
    if (!isGameOver) {
        if (event.key === 'ArrowLeft') {
            moveLeft = true;
        } else if (event.key === 'ArrowRight') {
            moveRight = true;
        }
    } else if (event.key === ' ') {
        init(); // Restart game on spacebar
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') {
        moveLeft = false;
    } else if (event.key === 'ArrowRight') {
        moveRight = false;
    }
});

// Game Loop Function
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    if (isGameOver) {
        return showGameOverScreen();
    }

    player.update();
    player.draw();
    platforms.forEach(platform => platform.draw());
    displayScore();
    requestAnimationFrame(gameLoop);
}

// Function to display the score
function displayScore() {
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
}

// Function to show game over screen
function showGameOverScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '32px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2 - 20);
    ctx.font = '16px Arial';
    ctx.fillText('Press space to restart', canvas.width / 2 - 75, canvas.height / 2 + 10);
}

// Start the game
init();