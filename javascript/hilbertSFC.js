let order = 4;
let speed = 100;
let mode = 'blackAndWhite';
let running = false; // Flag to indicate whether the simulation is running
let skipFrames = 1; // Number of frames to skip

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
let colourSelect;
let startPauseButton;
let resetButton;
let imageUpload;
let imagePreviewDiv;
let imagePreview;

function setup() {
  let canvas = createCanvas(512, 512);
  canvas.parent('canvas');
  background(0);

  orderSlider = document.getElementById('orderSlider');
  intervalSlider = document.getElementById('intervalSlider');
  colourSelect = document.getElementById('colourSelect');
  startPauseButton = document.getElementById('startPauseButton');
  resetButton = document.getElementById('resetButton');
  imageUpload = document.getElementById('imageUpload');
  imagePreviewDiv = document.getElementById('imagePreview');

  let skipFramesSlider = document.getElementById('skipFramesSlider');

  skipFramesSlider.oninput = function () {
    skipFrames = parseInt(skipFramesSlider.value);
  };

  orderSlider.oninput = function () {
    order = parseInt(orderSlider.value);
    cellSize = width / 2 ** order; // Recalculate the cellSize
    resetSimulation();
  };

  intervalSlider.oninput = function () {
    speed = parseInt(intervalSlider.value);
  };

  colourSelect.onchange = function () {
    mode = colourSelect.value;
    if (mode == 'image') {
      imageUpload.style.display = 'block';
      if (imagePreview) {
        imagePreviewDiv.style.display = 'block';
      }
    } else {
      imageUpload.style.display = 'none';
      imagePreviewDiv.style.display = 'none';
    }
  };

  imageUpload.onchange = function () {
    let file = imageUpload.files[0];
    let url = URL.createObjectURL(file);
    imagePreview = loadImage(url, function (img) {
      img.resize(256, 256);
      img.filter(GRAY);
      imagePreviewDiv.style.backgroundImage = 'url(' + img.canvas.toDataURL() + ')';
      imagePreviewDiv.style.display = 'block';
    });
  };

  startPauseButton.onclick = function () {
    if (mode == 'image' && !imagePreview) {
      alert('Please load an image first');
      return;
    }
    running = !running; // Toggle the running flag
    if (running) {
      startPauseButton.textContent = 'Pause Simulation';
      orderSlider.disabled = true;
      resetButton.disabled = false;
      colourSelect.disabled = true;
    } else {
      startPauseButton.textContent = 'Start Simulation';
    }
  };

  resetButton.onclick = function () {
    running = false; // Stop the simulation
    startPauseButton.textContent = 'Start Simulation';
    startPauseButton.disabled = false;
    orderSlider.disabled = false;
    resetButton.disabled = true;
    resetSimulation();
  };

  cellSize = width / 2 ** order;
  hilbert(order);
}

function draw() {
  if (running) {
    // Only run the simulation if the running flag is true
    let currentTime = millis();
    if (currentTime - lastTime > speed) {
      lastTime = currentTime;
      if (index < path.length - 1) {
        index = Math.min(index + skipFrames, path.length - 1);
        for (let i = Math.max(0, index - skipFrames); i < index; i++) {
          let pos1 = path[i];
          let pos2 = path[i + 1];

          if (mode == 'blackAndWhite') {
            stroke(255);
          } else if (mode == 'grayScale') {
            stroke(255 - ((i / path.length) * 360 * 5) / 8);
          } else if (mode == 'rainbow') {
            colorMode(HSB, 360, 100, 100);
            stroke((i / path.length) * 360, 100, 100);
          } else if (mode == 'image') {
            if (imagePreview) {
              let pixelX = Math.floor(map(pos1.x, 0, 2 ** order, 0, imagePreview.width));
              let pixelY = Math.floor(map(pos1.y, 0, 2 ** order, 0, imagePreview.height));
              let pixelColor = imagePreview.get(pixelX, pixelY);
              let grayValue = brightness(pixelColor);
              if (i == 0) {
                grayValue = brightness(imagePreview.get(pixelX, pixelY));
              }
              stroke(grayValue);
            }
          }
          strokeWeight(2);
          line(
            pos1.x * cellSize + (cellSize / 2),
            pos1.y * cellSize + (cellSize / 2),
            pos2.x * cellSize + (cellSize / 2),
            pos2.y * cellSize + (cellSize / 2)
          );
        }
      } else {
        running = false; // Stop the simulation
        startPauseButton.textContent = 'Simulation Ended';
        startPauseButton.disabled = true;
      }
    }
  }
}

function resetSimulation() {
  background(0);
  path = [];
  index = 0;
  lastTime = 0;
  orderSlider.disabled = false;
  colourSelect.disabled = false;

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