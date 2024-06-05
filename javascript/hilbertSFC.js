let order = 4;
let speed = 100;
let mode = "blackAndWhite";

let cellSize;
let path = [];
let index = 0;
let lastTime = 0;

let UP = 0;
let RIGHT = 1;
let DOWN = 2;
let LEFT = 3;

let orderSlider;
let intervalSlider;
let modeSelect;
let startPauseButton;
let resetButton;

function setup() {
  let canvas = createCanvas(512, 512);
  canvas.parent('canvas');
  background(0);

  orderSlider = document.getElementById("orderSlider");
  intervalSlider = document.getElementById("intervalSlider");
  modeSelect = document.getElementById("modeSelect");
  startPauseButton = document.getElementById("startPauseButton");
  resetButton = document.getElementById("resetButton");

  orderSlider.oninput = function() {
    order = parseInt(orderSlider.value);
    resetSimulation();
  }

  intervalSlider.oninput = function() {
    speed = parseInt(intervalSlider.value);
  }

  modeSelect.onchange = function() {
    mode = modeSelect.value;
  }

  startPauseButton.onclick = function() {
    if (startPauseButton.textContent == "Start Simulation") {
      startPauseButton.textContent = "Pause Simulation";
      resetButton.disabled = false;
    } else {
      startPauseButton.textContent = "Start Simulation";
    }
  }

  resetButton.onclick = function() {
    resetSimulation();
  }

  cellSize = width / (2 ** order);
  hilbert(order);
}

function draw() {
  let currentTime = millis();
  if (currentTime - lastTime > speed) {
    lastTime = currentTime;
    if (index < path.length - 1) {
      index++;
      let pos1 = path[index - 1];
      let pos2 = path[index];

      if (mode == "blackAndWhite") {
        stroke(255);
      } else if (mode == "rainbow") {
        colorMode(HSB, 360, 100, 100);
        stroke(index / path.length * 360, 100, 100);
      } else if (mode == "random") {
        if (index == 1) {
          hue = random(360);
        } else {
          hue = (hue + random(-10, 10)) % 360;
        }
        colorMode(HSB, 360, 100, 100);
        stroke(hue, 100, 100);
      }

      strokeWeight(2);
      line(pos1.x * cellSize + cellSize / 2, pos1.y * cellSize + cellSize / 2, pos2.x * cellSize + cellSize / 2, pos2.y * cellSize + cellSize / 2);
    }
  }
}

function resetSimulation() {
  background(0);
  path = [];
  index = 0;
  lastTime = 0;
  hilbert(order);
}

// Define the Hilbert curve function
function hilbert(order, x = 0, y = 0, direction = UP) {
  // Base case: if the order is 0, add the current point to the path
  if (order == 0) {
    path.push(createVector(x, y));
  } else {
    // Calculate the size of the current quadrant
    const size = 2 ** (order - 1);
    if (direction == UP) {
      hilbert(order - 1, x, y, RIGHT);
      hilbert(order - 1, x, y + size, UP);
      hilbert(order - 1, x + size, y + size, UP);
      hilbert(order - 1, x + size, y, LEFT);
    } else if (direction == RIGHT) {
      hilbert(order - 1, x, y, UP);
      hilbert(order - 1, x + size, y, RIGHT);
      hilbert(order - 1, x + size, y + size, RIGHT);
      hilbert(order - 1, x, y + size, DOWN);
    } else if (direction == DOWN) {
      hilbert(order - 1, x + size, y + size, LEFT);
      hilbert(order - 1, x + size, y, DOWN);
      hilbert(order - 1, x, y, DOWN);
      hilbert(order - 1, x, y + size, RIGHT);
    } else if (direction == LEFT) {
      hilbert(order - 1, x + size, y + size, DOWN);
      hilbert(order - 1, x, y + size, LEFT);
      hilbert(order - 1, x, y, LEFT);
      hilbert(order - 1, x + size, y, UP);
    }
  }
}