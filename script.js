const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images (make sure these paths are correct).
const platformImg = new Image();
platformImg.src = 'img/platform.png';

const doodlerImg = new Image();
doodlerImg.src = 'img/doodler-guy.png';

const backgroundImg = new Image();
backgroundImg.src = 'img/background.png';

// Game Variables
let player;
const platforms = [];
let score = 0;
let isGameOver = false;

const gravity = 0.5;
const jumpForce = -10; // Force applied when jumping

// Player Class
class Player {
    constructor(startY) {
        this.width = 30;
        this.height = 30;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = startY - this.height; // Start from the lowest platform
        this.velocityY = 0; // Initial vertical velocity
        this.image = doodlerImg;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        // Apply gravity
        this.y += this.velocityY;
        this.velocityY += gravity;

        // Screen wrapping
        if (this.x < -this.width) {
            this.x = canvas.width;
        } else if (this.x > canvas.width) {
            this.x = 0;
        }

        // Check for collision with platforms
        let onGround = false;
        platforms.forEach(platform => {
            if (this.isCollidingWith(platform)) {
                if (this.velocityY >= 0) { // Only jump if falling
                    this.velocityY = jumpForce; // Jump
                    onGround = true; // Player is on a platform
                    score += 10; // Increase score when landing on a platform
                }
            }
        });

        // Remove platforms that have passed off the screen
        platforms.forEach((platform, index) => {
            if (platform.y > canvas.height) {
                platforms.splice(index, 1);
            }
        });

        // Climb logic: If the player climbs higher than half of the canvas height,
        // move platforms downward
        if (this.y < canvas.height / 2) {
            platforms.forEach(platform => {
                platform.y += 5; // Move platforms down
            });
            this.y = canvas.height / 2; // Keep player at center height
            score += 1; // Increment score for climbing high
        }

        // Game over condition
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocityY = 0;
            isGameOver = true; // Set game over state
        }
    }

    isCollidingWith(platform) {
        return (
            this.x < platform.x + platform.width &&
            this.x + this.width > platform.x &&
            this.y + this.height <= platform.y + platform.height &&
            this.y + this.height + this.velocityY >= platform.y
        );
    }

    // Move the player left and right based on tilt input
    move(deltaX) {
        this.x += deltaX;
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }
    }
}

// Platform Class
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

// Initialize the Game
function init() {
    createPlatforms();
    player = new Player(getLowestPlatformY()); // Set player starting position on the lowest platform
    score = 0;
    isGameOver = false;
    initAccelerometerControls(); // Initialize accelerometer controls
    requestAnimationFrame(gameLoop);
}

// Function to create random platforms
function createPlatforms() {
    platforms.length = 0; // Clear existing platforms
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * (canvas.width - 100);
        const y = Math.random() * (canvas.height - (i * 100) + 60);
        platforms.push(new Platform(x, y));
    }
}

// Function to get the lowest platform Y coordinate
function getLowestPlatformY() {
    let lowestY = canvas.height; // Start with the bottom of the canvas
    platforms.forEach(platform => {
        if (platform.y < lowestY) {
            lowestY = platform.y; // Find the lowest platform
        }
    });
    return lowestY;
}

// Initialize Accelerometer Controls
function initAccelerometerControls() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission().then(response => {
            if (response === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation, true);
            } else {
                console.error("Device orientation permission not granted");
            }
        }).catch(console.error);
    } else {
        window.addEventListener('deviceorientation', handleOrientation, true);
    }
}

let sensitivity = 15; // Change this value to adjust how sensitive movement is

function handleOrientation(event) {
    const tilt = event.gamma; // Values range from -90 (left) to +90 (right)
    let deltaX = 0;

    // Determine direction based on tilt
    if (tilt > sensitivity) {
        deltaX = 5; // Move right
    } else if (tilt < -sensitivity) {
        deltaX = -5; // Move left
    }

    // Move the player based on tilt
    player.move(deltaX);
}

// Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    if (isGameOver) {
        return showGameOverScreen();
    }

    player.update();
    player.draw();
    platforms.forEach(platform => platform.draw());

    // Update score display
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText('Score: ' + score, 10, 20);

    requestAnimationFrame(gameLoop);
}

// Show Game Over Screen
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