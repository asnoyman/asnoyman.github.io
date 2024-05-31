let gameState = {
  initialVelocity: 100,
  accelerationRate: 3,
  rotationSpeed: 0.065,
  angle: 0,
  currentPosition: [0, 0],
  currentVelocity: 100,
  lastFrameTime: 0,
  isGameRunning: false,
  laserBlasts: [],
  isLeftArrowDown: false,
  isRightArrowDown: false,
  meteors: [],
  particles: [],
  score: 0,
  messages: [],
};

gameState.enemyShip = {
  position: [0, 0],
  speed: 100,
  size: 20,
  angle: 0,
  health: 10,
  bonus: 50,
  isAlive: false,
};

function setup() {
  const canvas = createCanvas(800, 600);
  canvas.parent('canvas-holder');
  gameState.currentPosition = [width / 2, height / 2];
  gameState.enemyShip.position = [width + 50, random(height)];
  frameRate(60);
  updateButtons("reset");
}

function draw() {
  const deltaTime = (millis() - gameState.lastFrameTime) / 1000;
  gameState.lastFrameTime = millis();

  if (gameState.isGameRunning) {
    gameState.score += deltaTime;
  }

  updateShip(deltaTime);
  updateLaserBlasts(deltaTime);
  updateMeteors(deltaTime);
  updateParticles(deltaTime);
  updateMessages(deltaTime);
  updateEnemyShip(deltaTime);

  background(0, 0, 50);
  noStroke();
  drawShip();
  drawLaserBlasts();
  drawMeteors();
  drawParticles();
  drawMessages();
  drawScore();
  drawEnemyShip();

  if (!gameState.isGameRunning) {
    noLoop();
  }
}

function updateShip(deltaTime) {
  if (gameState.isGameRunning) {
    gameState.currentVelocity += gameState.accelerationRate * deltaTime;

    if (gameState.currentVelocity > 1000) {
      gameState.currentVelocity = 1000;
    }

    gameState.currentPosition[0] += cos(gameState.angle) * gameState.currentVelocity * deltaTime;
    gameState.currentPosition[1] += sin(gameState.angle) * gameState.currentVelocity * deltaTime;

    if (gameState.isLeftArrowDown) {
      gameState.angle -= gameState.rotationSpeed;
    }

    if (gameState.isRightArrowDown) {
      gameState.angle += gameState.rotationSpeed;
    }

    if (gameState.currentPosition[0] < 0) {
      gameState.currentPosition[0] = width;
    } else if (gameState.currentPosition[0] > width) {
      gameState.currentPosition[0] = 0;
    }

    if (gameState.currentPosition[1] < 0) {
      gameState.currentPosition[1] = height;
    } else if (gameState.currentPosition[1] > height) {
      gameState.currentPosition[1] = 0;
    }
  }
}

function updateLaserBlasts(deltaTime) {
  for (let i = 0; i < gameState.laserBlasts.length; i++) {
    const laserBlast = gameState.laserBlasts[i];
    laserBlast.position[0] += cos(laserBlast.angle) * (gameState.currentVelocity + 200) * deltaTime;
    laserBlast.position[1] += sin(laserBlast.angle) * (gameState.currentVelocity + 200) * deltaTime;

    for (let j = 0; j < gameState.meteors.length; j++) {
      const meteor = gameState.meteors[j];

      // Check for collision with meteor
      if (collideCircleCircle(
          laserBlast.position[0], laserBlast.position[1], 5, 
          meteor.position[0], meteor.position[1], meteor.size
        )) {
        meteor.health -= 1;
        if (meteor.health <= 0) {
          destroyMeteor(meteor);
        }
        gameState.laserBlasts.splice(i, 1);
        i--;
        break;
      }
    }

    if (laserBlast.position[0] < 0 || laserBlast.position[0] > width ||
        laserBlast.position[1] < 0 || laserBlast.position[1] > height) {
      gameState.laserBlasts.splice(i, 1);
      i--;
    }
  }
}

function updateMeteors(deltaTime) {
  for (let i = 0; i < gameState.meteors.length; i++) {
    const meteor = gameState.meteors[i];
    meteor.position[0] += cos(meteor.angle) * meteor.speed * deltaTime;
    meteor.position[1] += sin(meteor.angle) * meteor.speed * deltaTime;

    const shipHitbox = getRotatedShipHitbox(gameState.currentPosition, gameState.angle);
    if (collideCirclePoly(meteor.position[0], meteor.position[1], meteor.size, shipHitbox)) {
      endGame();
    }

    if (meteor.position[0] < 0 || meteor.position[0] > width ||
        meteor.position[1] < 0 || meteor.position[1] > height) {
      gameState.meteors.splice(i, 1);
      i--;
    }
  }

  if (random(1) < 0.0075) {
    spawnMeteor();
  }
}

function spawnMeteor() {
  const side = floor(random(4));
  let x, y;
  switch (side) {
    case 0:
      x = random(width);
      y = 0;
      break;
    case 1:
      x = width;
      y = random(height);
      break;
    case 2:
      x = random(width);
      y = height;
      break;
    case 3:
      x = 0;
      y = random(height);
      break;
  }
  const angle = atan2(gameState.currentPosition[1] - y, gameState.currentPosition[0] - x);
  const speed = random(gameState.currentVelocity) + 10;
  const size = random(30) + 10;
  const health = size < 20 ? 1 : (size < 30 ? 2 : 4);
  gameState.meteors.push({
    position: [x, y],
    angle: angle,
    speed: speed,
    size: size,
    health: health
  });
}

function destroyMeteor(meteor) {
  for (let i = 0; i < 10; i++) {
    const angle = random(TWO_PI);
    const speed = random(50) + 50;
    gameState.particles.push({
      position: [meteor.position[0], meteor.position[1]],
      angle: angle,
      speed: speed,
      size: 2,
      lifetime: 1
    });
  }
  const bonus = floor(100 / meteor.size);
  gameState.score += bonus;
  addMessage(meteor.position, `+${bonus}`);
  gameState.meteors.splice(gameState.meteors.indexOf(meteor), 1);
}

function updateEnemyShip(deltaTime) {
  if (gameState.enemyShip.isAlive) {
    gameState.enemyShip.position[0] += cos(gameState.enemyShip.angle) * gameState.enemyShip.speed * deltaTime;
    gameState.enemyShip.position[1] += sin(gameState.enemyShip.angle) * gameState.enemyShip.speed * deltaTime;

    for (let i = 0; i < gameState.laserBlasts.length; i++) {
      const laserBlast = gameState.laserBlasts[i];
      const distanceToLaserBlast = dist(
        gameState.enemyShip.position[0], gameState.enemyShip.position[1],
        laserBlast.position[0], laserBlast.position[1]
      );
      if (distanceToLaserBlast < gameState.enemyShip.size) {
        gameState.enemyShip.health -= 1;
        gameState.laserBlasts.splice(i, 1);
        i--;
        if (gameState.enemyShip.health <= 0) {
          destroyEnemyShip();
        }
      }
    }

    const shipHitbox = getRotatedShipHitbox(gameState.currentPosition, gameState.angle);
    const enemyShipHitbox = getRotatedShipHitbox(gameState.enemyShip.position, gameState.enemyShip.angle);
    if (collidePolyPoly(shipHitbox, enemyShipHitbox)) {
      endGame();
    }

    if (gameState.enemyShip.position[0] < -50 || gameState.enemyShip.position[0] > width + 50 ||
        gameState.enemyShip.position[1] < -50 || gameState.enemyShip.position[1] > height + 50) {
      spawnEnemyShip(gameState.enemyShip.health);
    }
  } else {
    if (random(1) < 0.01) {
      spawnEnemyShip();
    }
  }
}

function destroyEnemyShip() {
  for (let i = 0; i < 10; i++) {
    const angle = random(TWO_PI);
    const speed = random(50) + 50;
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

function spawnEnemyShip(health = 10) {
  const side = floor(random(4));
  let x, y;
  switch (side) {
    case 0:
      x = random(width);
      y = 0;
      break;
    case 1:
      x = width;
      y = random(height);
      break;
    case 2:
      x = random(width);
      y = height;
      break;
    case 3:
      x = 0;
      y = random(height);
      break;
  }
  const angle = atan2(gameState.currentPosition[1] - y, gameState.currentPosition[0] - x);
  const speed = random(100) + 50;
  gameState.enemyShip.position = [x, y];
  gameState.enemyShip.angle = angle;
  gameState.enemyShip.speed = speed;
  gameState.enemyShip.health = health;
  gameState.enemyShip.isAlive = true;
}

function updateParticles(deltaTime) {
  for (let i = 0; i < gameState.particles.length; i++) {
    const particle = gameState.particles[i];
    particle.position[0] += cos(particle.angle) * particle.speed * deltaTime;
    particle.position[1] += sin(particle.angle) * particle.speed * deltaTime;
    particle.lifetime -= deltaTime;
    if (particle.lifetime <= 0) {
      gameState.particles.splice(i, 1);
      i--;
    }
  }
}

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

function addMessage(position, text) {
  gameState.messages.push({
    position: position,
    text: text,
    lifetime: 1,
  });
}

function getRotatedShipHitbox(position, angle) {
  const hitboxPoints = [
    createVector(-10, -15),
    createVector(10, 0),
    createVector(-10, 15),
  ];

  // Rotate the hitbox points around the ship's center
  for (let i = 0; i < hitboxPoints.length; i++) {
    hitboxPoints[i].rotate(angle);
    hitboxPoints[i].add(position[0], position[1]);
  }

  return hitboxPoints;
}

function drawShip() {
  push();
  translate(gameState.currentPosition[0], gameState.currentPosition[1]);
  rotate(gameState.angle);
  fill('red');
  beginShape();
  vertex(-10, -15);
  vertex(10, 0);
  vertex(-10, 15);
  endShape(CLOSE);
  pop();
}

function drawLaserBlasts() {
  for (const laserBlast of gameState.laserBlasts) {
    push();
    translate(laserBlast.position[0], laserBlast.position[1]);
    rotate(laserBlast.angle);
    fill('white');
    rect(0, -1, 10, 2);
    pop();
  }
}

function drawMeteors() {
  for (const meteor of gameState.meteors) {
    fill('grey');
    ellipse(meteor.position[0], meteor.position[1], meteor.size);
  }
}

function drawParticles() {
  for (const particle of gameState.particles) {
    fill('white');
    ellipse(particle.position[0], particle.position[1], particle.size);
  }
}

function drawEnemyShip() {
  if (gameState.enemyShip.isAlive) {
    push();
    translate(gameState.enemyShip.position[0], gameState.enemyShip.position[1]);
    rotate(gameState.enemyShip.angle);
    fill('green');
    beginShape();
    vertex(-10, -15);
    vertex(10, 0);
    vertex(-10, 15);
    endShape(CLOSE);
    pop();

    const healthBarWidth = 30;
    const healthBarHeight = 5;
    const healthBarX = gameState.enemyShip.position[0] - healthBarWidth / 2;
    const healthBarY = gameState.enemyShip.position[1] - 20;

    // Draw the red health bar
    fill('red');
    noStroke();
    const healthPercentage = gameState.enemyShip.health / 10;
    rect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);

    // Draw the white outline
    noFill();
    stroke('white');
    rect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
  }
}

function drawMessages() {
  for (const message of gameState.messages) {
    fill(255, 255, 255, message.lifetime * 255);
    textAlign(CENTER, CENTER);
    text(message.text, message.position[0], message.position[1]);
  }
}

function drawScore() {
  fill('white');
  textAlign(LEFT, TOP);
  textSize(24);
  text(`Score: ${floor(gameState.score)}`, 10, 10);
  text(`High Score: ${floor(localStorage.highScore)}`, 10, 40);
}

function startGame() {
  gameState.lastFrameTime = millis();
  gameState.isGameRunning = true;
  loop();
  updateButtons("start");
}

function stopGame() {
  gameState.isGameRunning = false;
  updateButtons("stop");
}

function resetGame() {
  stopGame();
  gameState.currentVelocity = gameState.initialVelocity;
  gameState.angle = 0;
  gameState.currentPosition = [width / 2, height / 2];
  gameState.laserBlasts = [];
  gameState.meteors = [];
  gameState.particles = [];
  gameState.score = 0;
  gameState.messages = [];
  gameState.enemyShip.isAlive = false;
  loop();
  noLoop();
  updateButtons("reset");
}

function endGame() {
  gameState.isGameRunning = false;

  if (gameState.score > localStorage.highScore) {
    localStorage.highScore = gameState.score;
  }
}

function keyPressed() {
if (gameState.isGameRunning) {
  if (keyCode === LEFT_ARROW) {
    gameState.isLeftArrowDown = true;
  } else if (keyCode === RIGHT_ARROW) {
    gameState.isRightArrowDown = true;
  } else if (key === ' ') {
    gameState.laserBlasts.push({
      position: [gameState.currentPosition[0], gameState.currentPosition[1]],
      angle: gameState.angle
    });
  }
}
}

function keyReleased() {
  if (keyCode === LEFT_ARROW) {
    gameState.isLeftArrowDown = false;
  } else if (keyCode === RIGHT_ARROW) {
    gameState.isRightArrowDown = false;
  }
}

function updateButtons(state) {
  const startButton = document.querySelector('button[onclick="startGame()"]');
  const stopButton = document.querySelector('button[onclick="stopGame()"]');
  const resetButton = document.querySelector('button[onclick="resetGame()"]');

  if (state === "start") {
    startButton.disabled = true;
    stopButton.disabled = false;
    resetButton.disabled = false;
  } else if (state === "stop") {
    startButton.disabled = false;
    stopButton.disabled = true;
    resetButton.disabled = false;
  } else if (state === "reset") {
    startButton.disabled = false;
    stopButton.disabled = true;
    resetButton.disabled = true;
  }
}

if (localStorage.highScore === undefined) {
  localStorage.highScore = 0;
}