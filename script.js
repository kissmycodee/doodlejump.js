   const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // Load images
        const platformImg = new Image();
        platformImg.src = 'img/platform.png';

        const doodlerImg = new Image();
        doodlerImg.src = 'img/doodler-guy.png';

        const backgroundImg = new Image();
        backgroundImg.src = 'img/background.png';

        // Game Variables
        let player;
        const platforms = [];
        const enemies = [];
        let score = 0;
        let isGameOver = false;

        const gravity = 0.5;

        // Player Class
        class Player {
            constructor() {
                this.width = 30;
                this.height = 30;
                this.x = canvas.width / 2 - this.width / 2;
                this.y = canvas.height - this.height - 30; // Positioned slightly above the bottom
                this.velocityY = -5;  // Initial upward velocity for constant jumping
                this.image = doodlerImg;
            }

            draw() {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            }

            update() {
                // Update Y position
                this.y += this.velocityY;
                this.velocityY += gravity; // Apply gravity

                // Ensure player wraps around the screen
                if (this.x < -this.width) {
                    this.x = canvas.width;
                } else if (this.x > canvas.width) {
                    this.x = 0;
                }

                // Check for collision with platforms
                let onGround = false;

                platforms.forEach(platform => {
                    if (this.isCollidingWith(platform)) {
                        this.velocityY = -10; // Jump effect when landing on a platform
                        onGround = true; // Set onGround to true if the player landed on a platform
                    }
                });

                // If not on ground, keep falling
                if (!onGround && this.y + this.height < canvas.height) {
                    this.velocityY += gravity; // Apply gravity while not on a platform
                }

                // Prevent going beyond the canvas height
                if (this.y + this.height > canvas.height) {
                    this.y = canvas.height - this.height;
                    this.velocityY = 0;
                }
            }

            isCollidingWith(platform) {
                return (this.x < platform.x + platform.width &&
                        this.x + this.width > platform.x &&
                        this.y + this.height <= platform.y + platform.height &&
                        this.y + this.height + this.velocityY >= platform.y);
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
            player = new Player();
            createPlatforms();
            score = 0;
            isGameOver = false;
            requestAnimationFrame(gameLoop);
        }

        // Create Random Platforms
        function createPlatforms() {
            platforms.length = 0; // Clear existing platforms
            for (let i = 0; i < 5; i++) {
                const x = Math.random() * (canvas.width - 100);
                const y = Math.random() * (canvas.height - (i * 100) + 60);
                platforms.push(new Platform(x, y));
            }
        }

        // Handle Key Events
        window.addEventListener('keydown', (event) => {
            if (!isGameOver) {
                if (event.key === 'ArrowLeft') {
                    player.x -= 15;
                } else if (event.key === 'ArrowRight') {
                    player.x += 15;
                }
                // Allow wrapping around
                if (player.x < -player.width) {
                    player.x = canvas.width;
                } else if (player.x > canvas.width) {
                    player.x = 0;
                }
            } else if (event.key === ' ') {
                init(); // Restart the game
            }
        });

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

            // Update score based on player's Y position
            if (player.y < canvas.height - player.height) {
                score = Math.floor(-player.y / 5);
            }

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