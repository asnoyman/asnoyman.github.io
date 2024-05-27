// Get the canvas element and its context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Initialize game state
let gameState = {
  initialVelocity: 100,
  accelerationRate: 3,
  rotationSpeed: 0.05,
  angle: 0,
  currentPosition: [canvas.width / 2, canvas.height / 2],
  currentVelocity: 100,
  lastFrameTime: 0,
  isGameRunning: false,
  laserBlasts: [],
  isLeftArrowDown: false,
  isRightArrowDown: false,
  meteors: [],
  particles: [],
  score: 0,
  messages: []
};

// Initialize enemy ship state
gameState.enemyShip = {
  position: [canvas.width + 50, Math.random() * canvas.height],
  speed: 100,
  size: 20,
  angle: 0,
  health: 10,
  bonus: 50,
  isAlive: false,
};

// Game Logic Functions

// Function to update game state
function update(time) {
  const deltaTime = (time - gameState.lastFrameTime) / 1000;
  gameState.lastFrameTime = time;

  if (gameState.isGameRunning) {
    gameState.score += deltaTime;
  }

  updateShip(deltaTime);
  updateLaserBlasts(deltaTime);
  updateMeteors(deltaTime);
  updateParticles(deltaTime);
  updateMessages(deltaTime);
  updateEnemyShip(deltaTime);

  drawEverything();

  if (gameState.isGameRunning) {
    requestAnimationFrame(update);
  }
}

// Function to update ship position and velocity
function updateShip(deltaTime) {
  if (gameState.isGameRunning) {
    gameState.currentVelocity += gameState.accelerationRate * deltaTime;

    if (gameState.currentVelocity > 1000) {
      gameState.currentVelocity = 1000;
    }

    gameState.currentPosition[0] += Math.cos(gameState.angle) * gameState.currentVelocity * deltaTime;
    gameState.currentPosition[1] += Math.sin(gameState.angle) * gameState.currentVelocity * deltaTime;

    // Update angle based on arrow key states
    if (gameState.isLeftArrowDown) {
      gameState.angle -= gameState.rotationSpeed;
    }

    if (gameState.isRightArrowDown) {
      gameState.angle += gameState.rotationSpeed;
    }

    // Check for collision with canvas bounds
    if (gameState.currentPosition[0] < 0) {
      gameState.currentPosition[0] = canvas.width; // Wrap around to the right edge
    } else if (gameState.currentPosition[0] > canvas.width) {
      gameState.currentPosition[0] = 0; // Wrap around to the left edge
    }

    if (gameState.currentPosition[1] < 0) {
      gameState.currentPosition[1] = canvas.height; // Wrap around to the bottom edge
    } else if (gameState.currentPosition[1] > canvas.height) {
      gameState.currentPosition[1] = 0; // Wrap around to the top edge
    }
  }
}

// Function to update laser blasts
function updateLaserBlasts(deltaTime) {
  for (let i = 0; i < gameState.laserBlasts.length; i++) {
    const laserBlast = gameState.laserBlasts[i];
    laserBlast.position[0] += Math.cos(laserBlast.angle) * (gameState.currentVelocity + 200) * deltaTime;
    laserBlast.position[1] += Math.sin(laserBlast.angle) * (gameState.currentVelocity + 200) * deltaTime;

    // Check for collision with meteors
    for (let j = 0; j < gameState.meteors.length; j++) {
      const meteor = gameState.meteors[j];
      const distanceToMeteor = Math.sqrt(
        Math.pow(laserBlast.position[0] - meteor.position[0], 2) +
        Math.pow(laserBlast.position[1] - meteor.position[1], 2)
      );
      if (distanceToMeteor < meteor.size) {
        meteor.health -= 1;
        if (meteor.health <= 0) {
          destroyMeteor(meteor);
        }
        gameState.laserBlasts.splice(i, 1);
        i--;
        break;
      }
    }

    // Remove laser blast if it's off the screen
    if (laserBlast.position[0] < 0 || laserBlast.position[0] > canvas.width ||
        laserBlast.position[1] < 0 || laserBlast.position[1] > canvas.height) {
      gameState.laserBlasts.splice(i, 1);
      i--;
    }
  }
}

// Function to update meteors
function updateMeteors(deltaTime) {
  for (let i = 0; i < gameState.meteors.length; i++) {
    const meteor = gameState.meteors[i];
    meteor.position[0] += Math.cos(meteor.angle) * meteor.speed * deltaTime;
    meteor.position[1] += Math.sin(meteor.angle) * meteor.speed * deltaTime;

    // Check for collision with ship
    const distanceToShip = Math.sqrt(
      Math.pow(gameState.currentPosition[0] - meteor.position[0], 2) +
      Math.pow(gameState.currentPosition[1] - meteor.position[1], 2)
    );
    if (distanceToShip < meteor.size + 5) {
      endGame();
    }

    // Remove meteor if it's off the screen
    if (meteor.position[0] < 0 || meteor.position[0] > canvas.width ||
        meteor.position[1] < 0 || meteor.position[1] > canvas.height) {
      gameState.meteors.splice(i, 1);
      i--;
    }
  }

  // Spawn new meteors
  if (Math.random() < 0.0075) { // 5% chance of spawning a new meteor each frame
    spawnMeteor();
  }
}

function spawnMeteor() {
  const side = Math.floor(Math.random() * 4); // Choose a random side to spawn on
  let x, y;
  switch (side) {
    case 0: // Top edge
      x = Math.random() * canvas.width;
      y = 0;
      break;
    case 1: // Right edge
      x = canvas.width;
      y = Math.random() * canvas.height;
      break;
    case 2: // Bottom edge
      x = Math.random() * canvas.width;
      y = canvas.height;
      break;
    case 3: // Left edge
      x = 0;
      y = Math.random() * canvas.height;
      break;
  }
  const angle = Math.atan2(gameState.currentPosition[1] - y, gameState.currentPosition[0] - x);
  const speed = Math.random() * gameState.currentVelocity + 10; // Ensure all speeds are greater than 0
  const size = Math.random() * 20 + 5;
  const health = size < 10 ? 1 : (size < 15 ? 2 : 4);
  gameState.meteors.push({
    position: [x, y],
    angle: angle,
    speed: speed,
    size: size,
    health: health
  });
}

// Function to destroy a meteor
function destroyMeteor(meteor) {
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 50 + 50;
    gameState.particles.push({
      position: [meteor.position[0], meteor.position[1]],
      angle: angle,
      speed: speed,
      size: 2,
      lifetime: 1
    });
  }
  const bonus = Math.floor(50 / meteor.size);
  gameState.score += bonus;
  addMessage(meteor.position, `+${bonus}`);
  gameState.meteors.splice(gameState.meteors.indexOf(meteor), 1);
}

// Function to update enemy ship
function updateEnemyShip(deltaTime) {
  if (gameState.enemyShip.isAlive) {
    gameState.enemyShip.position[0] += Math.cos(gameState.enemyShip.angle) * gameState.enemyShip.speed * deltaTime;
    gameState.enemyShip.position[1] += Math.sin(gameState.enemyShip.angle) * gameState.enemyShip.speed * deltaTime;

    // Check for collision with laser blasts
    for (let i = 0; i < gameState.laserBlasts.length; i++) {
      const laserBlast = gameState.laserBlasts[i];
      const distanceToLaserBlast = Math.sqrt(
        Math.pow(gameState.enemyShip.position[0] - laserBlast.position[0], 2) +
        Math.pow(gameState.enemyShip.position[1] - laserBlast.position[1], 2)
      );
      if (distanceToLaserBlast < gameState.enemyShip.size) {
        gameState.enemyShip.health -= 1;
        gameState.laserBlasts.splice(i, 1);
        i--;
        if (gameState.enemyShip.health <= 0) {
          destroyEnemyShip();
          spawnEnemyShip(gameState.enemyShip.health);
        }
      }
    }

    // Check for collision with player ship
    const distanceToPlayerShip = Math.sqrt(
      Math.pow(gameState.enemyShip.position[0] - gameState.currentPosition[0], 2) +
      Math.pow(gameState.enemyShip.position[1] - gameState.currentPosition[1], 2)
    );
    if (distanceToPlayerShip < gameState.enemyShip.size + 5) {
      endGame();
    }

    // Remove enemy ship if it's off the screen
    if (gameState.enemyShip.position[0] < -50 || gameState.enemyShip.position[0] > canvas.width + 50 ||
        gameState.enemyShip.position[1] < -50 || gameState.enemyShip.position[1] > canvas.height + 50) {
      gameState.enemyShip.isAlive = false;
    }
  } else {
    // Spawn a new enemy ship
    if (Math.random() < 0.01) { // 1% chance of spawning a new enemy ship each frame
      spawnEnemyShip();
    }
  }
}

// Function to destroy enemy ship
function destroyEnemyShip() {
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 50 + 50;
    gameState.particles.push({
      position: [gameState.enemyShip.position[0], gameState.enemyShip.position[1]],
      angle: angle,
      speed: speed,
      size: 2,
      lifetime: 1
    });
  }
  gameState.score += gameState.enemyShip.bonus;
  addMessage(gameState.enemyShip.position, `+${gameState.enemyShip.bonus}`);
  gameState.enemyShip.isAlive = false;
}

// Function to spawn enemy ship
function spawnEnemyShip(health = 10) {
  const side = Math.floor(Math.random() * 4); // Choose a random side to spawn on
  let x, y;
  switch (side) {
    case 0: // Top edge
      x = Math.random() * canvas.width;
      y = 0;
      break;
    case 1: // Right edge
      x = canvas.width;
      y = Math.random() * canvas.height;
      break;
    case 2: // Bottom edge
      x = Math.random() * canvas.width;
      y = canvas.height;
      break;
    case 3: // Left edge
      x = 0;
      y = Math.random() * canvas.height;
      break;
  }
  const angle = Math.atan2(gameState.currentPosition[1] - y, gameState.currentPosition[0] - x);
  const speed = Math.random() * 100 + 50; // Random speed between 50 and 150
  gameState.enemyShip.position = [x, y];
  gameState.enemyShip.angle = angle;
  gameState.enemyShip.speed = speed;
  gameState.enemyShip.health = health;
  gameState.enemyShip.isAlive = true;
}

// Function to update particles
function updateParticles(deltaTime) {
  for (let i = 0; i < gameState.particles.length; i++) {
    const particle = gameState.particles[i];
    particle.position[0] += Math.cos(particle.angle) * particle.speed * deltaTime;
    particle.position[1] += Math.sin(particle.angle) * particle.speed * deltaTime;
    particle.lifetime -= deltaTime;
    if (particle.lifetime <= 0) {
      gameState.particles.splice(i, 1);
      i--;
    }
  }
}

// Function to update messages
function updateMessages(deltaTime) {
  for (let i = 0; i < gameState.messages.length; i++) {
    const message = gameState.messages[i];
    message.lifetime -= deltaTime;
    if (message.lifetime <= 0) {
      gameState.messages.splice(i, 1);
      i--;
    }
  }
}

// Function to add a message
function addMessage(position, text) {
  gameState.messages.push({
    position: position,
    text: text,
    lifetime: 1,
  });
}

// Drawing Functions

// Function to draw everything
function drawEverything() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawShip();
  drawLaserBlasts();
  drawMeteors();
  drawParticles();
  drawMessages();
  drawScore();
  drawEnemyShip();
}

// Function to draw background
function drawBackground() {
  ctx.fillStyle = 'rgb(0, 0, 50)'; // Set the background color to a deep blue/black
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Function to draw ship
function drawShip() {
  ctx.save();
  ctx.translate(gameState.currentPosition[0], gameState.currentPosition[1]);
  ctx.rotate(gameState.angle);
  ctx.beginPath();
  ctx.moveTo(-10, -15);
  ctx.lineTo(10, 0);
  ctx.lineTo(-10, 15);
  ctx.fillStyle = 'red';
  ctx.fill();
  ctx.restore();
}

// Function to draw laser blasts
function drawLaserBlasts() {
  for (const laserBlast of gameState.laserBlasts) {
    ctx.save();
    ctx.translate(laserBlast.position[0], laserBlast.position[1]);
    ctx.rotate(laserBlast.angle);
    ctx.beginPath();
    ctx.rect(0, -1, 10, 2); // Draw a vertical rectangle
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.restore();
  }
}

// Function to draw meteors
function drawMeteors() {
  for (const meteor of gameState.meteors) {
    ctx.beginPath();
    ctx.arc(meteor.position[0], meteor.position[1], meteor.size, 0, 2 * Math.PI);
    ctx.fillStyle = 'grey';
    ctx.fill();
  }
}

// Function to draw particles
function drawParticles() {
  for (const particle of gameState.particles) {
    ctx.beginPath();
    ctx.arc(particle.position[0], particle.position[1], particle.size, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
  }
}

// Function to draw enemy ship
function drawEnemyShip() {
  if (gameState.enemyShip.isAlive) {
    ctx.save();
    ctx.translate(gameState.enemyShip.position[0], gameState.enemyShip.position[1]);
    ctx.rotate(gameState.enemyShip.angle);
    ctx.beginPath();
    ctx.moveTo(-10, -15);
    ctx.lineTo(10, 0);
    ctx.lineTo(-10, 15);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.restore();
  }
}
// Function to draw messages
function drawMessages() {
  for (const message of gameState.messages) {
    ctx.font = '18px Arial';
    ctx.fillStyle = `rgba(255, 255, 255, ${message.lifetime})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message.text, message.position[0], message.position[1]);
  }
}

// Function to draw score
function drawScore() {
  ctx.font = '24px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Score: ${Math.floor(gameState.score)}`, 10, 10);
  ctx.fillText(`High Score: ${Math.floor(localStorage.highScore)}`, 10, 40);
}

// Game Control Functions

// Function to start the game
function startGame() {
  gameState.lastFrameTime = performance.now();
  gameState.isGameRunning = true;

  // Disable the start button and enable the stop and reset buttons
  document.getElementById('startButton').disabled = true;
  document.getElementById('stopButton').disabled = false;
  document.getElementById('resetButton').disabled = false;

  // Start the game loop
  requestAnimationFrame(update);
}

// Function to stop the game
function stopGame() {
  gameState.isGameRunning = false;

  // Enable both the start and reset buttons
  document.getElementById('startButton').disabled = false;
  document.getElementById('resetButton').disabled = false;
  document.getElementById('stopButton').disabled = true;
}

// Function to reset the game
function resetGame() {
  stopGame();
  gameState.currentVelocity = gameState.initialVelocity;
  gameState.angle = 0;
  gameState.currentPosition = [canvas.width / 2, canvas.height / 2];
  gameState.laserBlasts = [];
  gameState.meteors = [];
  gameState.particles = [];
  gameState.score = 0;
  gameState.messages = [];
  gameState.enemyShip.isAlive = false;


  // Play one frame to load the reset game
  requestAnimationFrame(update);

  // Disable the reset button and enable the start button
  document.getElementById('resetButton').disabled = true;
  document.getElementById('startButton').disabled = false;
  document.getElementById('stopButton').disabled = true;
}

// Function to end the game
function endGame() {
  gameState.isGameRunning = false;

  if (gameState.score > localStorage.highScore) {
    localStorage.highScore = gameState.score;
  }

  // Disable the start button and enable the reset button
  document.getElementById('startButton').disabled = true;
  document.getElementById('resetButton').disabled = false;
  document.getElementById('stopButton').disabled = true;
}

// Function to handle key presses
function handleKeyDown(event) {
  if (event.key === 'ArrowLeft') {
    gameState.isLeftArrowDown = true;
  } else if (event.key === 'ArrowRight') {
    gameState.isRightArrowDown = true;
  } else if (event.key === ' ') {
    // Fire laser blast
    gameState.laserBlasts.push({
      position: [gameState.currentPosition[0], gameState.currentPosition[1]],
      angle: gameState.angle
    });
  }
}

// Function to handle key up events
function handleKeyUp(event) {
  if (event.key === 'ArrowLeft') {
    gameState.isLeftArrowDown = false;
  } else if (event.key === 'ArrowRight') {
    gameState.isRightArrowDown = false;
  }
}

if (localStorage.highScore === undefined) {
  localStorage.highScore = 0;
}

// Add event listeners to the document
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Add event listeners to the buttons and document
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('stopButton').addEventListener('click', stopGame);
document.getElementById('resetButton').addEventListener('click', resetGame);

// Draw the initial game state
drawEverything();