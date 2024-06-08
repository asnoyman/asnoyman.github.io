// Constants
const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;

// Simulation Variables
let order = 4;
let speed = 100;
let mode = 'blackAndWhite';
let curveMode = 'hilbert'; // 'hilbert' or 'peano'
let curveBase = 2;
let running = false;
let skipFrames = 1;

// Canvas Variables
let cellSizeX;
let cellSizeY;
let path = [];
let index = 0;
let lastTime = 0;

// DOM Elements
let orderSlider;
let intervalSlider;
let skipFramesSlider;
let colourSelect;
let curveSelect;
let startPauseButton;
let resetButton;
let imageUpload;
let imagePreviewDiv;
let imagePreview;

// Setup Function
function setup() {
  createCanvas(600, 600).parent('canvas');
  background(0);

  // Initialize DOM Elements
  orderSlider = document.getElementById('orderSlider');
  intervalSlider = document.getElementById('intervalSlider');
  skipFramesSlider = document.getElementById('skipFramesSlider');
  colourSelect = document.getElementById('colourSelect');
  curveSelect = document.getElementById('curveSelect');
  startPauseButton = document.getElementById('startPauseButton');
  resetButton = document.getElementById('resetButton');
  imageUpload = document.getElementById('imageUpload');
  imagePreviewDiv = document.getElementById('imagePreview');

  // Add Event Listeners
  orderSlider.addEventListener('input', handleOrderChange);
  intervalSlider.addEventListener('input', handleIntervalChange);
  skipFramesSlider.addEventListener('input', handleSkipFramesChange);
  colourSelect.addEventListener('change', handleColourChange);
  curveSelect.addEventListener('change', handleCurveChange);
  imageUpload.addEventListener('change', handleImageUpload);
  startPauseButton.addEventListener('click', handleStartPause);
  resetButton.addEventListener('click', resetSimulation);

  // Initialize Canvas Variables
  calculateCellSize();
  hilbert(order);
}

// Draw Function
function draw() {
  if (running) {
    let currentTime = millis();
    if (currentTime - lastTime > speed) {
      lastTime = currentTime;
      if (index < path.length - 1) {
        index = Math.min(index + skipFrames, path.length - 1);
        drawLines();
      } else {
        running = false;
        startPauseButton.textContent = 'Simulation Ended';
        startPauseButton.disabled = true;
      }
    }
  }
}

// Event Handlers
function handleOrderChange() {
  order = parseInt(orderSlider.value);
  if (curveMode === 'peano') {
    order = Math.min(order, 6);
  }
  calculateCellSize();
  resetSimulation();
}

function handleIntervalChange() {
  speed = parseInt(intervalSlider.value);
}

function handleSkipFramesChange() {
  skipFrames = parseInt(skipFramesSlider.value);
}

function handleColourChange() {
  mode = colourSelect.value;
  colorMode(RGB, 255, 255, 255);
  if (mode !== 'image') {
    resizeCanvas(600, 600);
    calculateCellSize();
    imageUpload.value = null;
    imageUpload.style.display = 'none';
    imagePreview = null;
    imagePreviewDiv.style.display = 'none';
  } else {
    imageUpload.style.display = 'block';
  }
  background(0);
}

function handleCurveChange() {
  curveMode = curveSelect.value;
  if (curveMode === 'hilbert') {
    curveBase = 2;
  } else if (curveMode === 'peano') {
    curveBase = 3;
  }
  resetSimulation();
}

function handleImageUpload() {
  let file = imageUpload.files[0];
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    imageUpload.value = null;
    return;
  }
  let url = URL.createObjectURL(file);
  imagePreview = loadImage(url, function (img) {
    let aspectRatio = img.width / img.height;
    let newWidth = Math.min(600, img.width);
    let newHeight = Math.min(600, newWidth / aspectRatio);
    resizeCanvas(newWidth, newHeight);
    calculateCellSize();
    img.filter(GRAY);
    let previewWidth = newWidth / 2;
    let previewHeight = newHeight / 2;
    imagePreviewDiv.innerHTML = '';
    let previewImg = document.createElement('img');
    previewImg.src = img.canvas.toDataURL();
    previewImg.width = previewWidth;
    previewImg.height = previewHeight;
    imagePreviewDiv.appendChild(previewImg);
    imagePreviewDiv.style.display = 'block';
    imagePreviewDiv.style.width = previewWidth + 'px';
    imagePreviewDiv.style.height = previewHeight + 'px';
    resetSimulation();
  });
}

function handleStartPause() {
  if (mode === 'image' && !imagePreview) {
    alert('Please load an image first');
    return;
  }
  running = !running;
  if (running) {
    startPauseButton.textContent = 'Pause Simulation';
    orderSlider.disabled = true;
    resetButton.disabled = false;
    colourSelect.disabled = true;
    curveSelect.disabled = true;
    imageUpload.disabled = true;
  } else {
    startPauseButton.textContent = 'Start Simulation';
  }
}

// Reset Simulation Function
function resetSimulation() {
  background(0);
  if (curveMode === 'peano') {
    order = Math.min(order, 6);
  }
  path = [];
  index = 0;
  lastTime = 0;
  running = false;
  startPauseButton.textContent = 'Start Simulation';
  startPauseButton.disabled = false;
  orderSlider.disabled = false;
  resetButton.disabled = true;
  colourSelect.disabled = false;
  curveSelect.disabled = false;
  imageUpload.disabled = false;
  calculateCellSize();
  if (curveMode === 'hilbert') {
    hilbert(order);
  } else if (curveMode === 'peano') {
    peano(order);
  }
}

// Draw Lines Function
function drawLines() {
  for (let i = Math.max(0, index - skipFrames); i < index; i++) {
    let pos1 = path[i];
    let pos2 = path[i + 1];
    let strokeColor = getStrokeColor(i);
    stroke(strokeColor);
    strokeWeight(2);
    line(
      pos1.x * cellSizeX + cellSizeX / 2,
      pos1.y * cellSizeY + cellSizeY / 2,
      pos2.x * cellSizeX + cellSizeX / 2,
      pos2.y * cellSizeY + cellSizeY / 2
    );
  }
}

// Get Stroke Color Function
function getStrokeColor(i) {
  if (mode === 'blackAndWhite') {
    return 255;
  } else if (mode === 'grayScale') {
    return 255 - ((i / path.length) * 360 * 5) / 8;
  } else if (mode === 'rainbow') {
    colorMode(HSB, 360, 100, 100);
    return color((i / path.length) * 360, 100, 100);
  } else if (mode === 'image') {
    if (imagePreview) {
      let pixelX = Math.floor(map(path[i].x, 0, curveBase ** order, 0, imagePreview.width));
      let pixelY = Math.floor(map(path[i].y, 0, curveBase ** order, 0, imagePreview.height));
      let pixelColor = imagePreview.get(pixelX, pixelY);
      let grayValue = brightness(pixelColor);
      return (grayValue * 255) / 100;
    }
  }
}

// Function to calculate cell size
function calculateCellSize() {
  cellSizeX = width / curveBase ** order;
  cellSizeY = height / curveBase ** order;
}

// Hilbert Curve Function
function hilbert(order, x = 0, y = 0, direction = UP) {
  if (order === 0) {
    path.push(createVector(x, y));
  } else {
    const size = 2 ** (order - 1);
    if (direction === UP) {
      hilbert(order - 1, x, y, RIGHT);
      hilbert(order - 1, x, y + size, UP);
      hilbert(order - 1, x + size, y + size, UP);
      hilbert(order - 1, x + size, y, LEFT);
    } else if (direction === RIGHT) {
      hilbert(order - 1, x, y, UP);
      hilbert(order - 1, x + size, y, RIGHT);
      hilbert(order - 1, x + size, y + size, RIGHT);
      hilbert(order - 1, x, y + size, DOWN);
    } else if (direction === DOWN) {
      hilbert(order - 1, x + size, y + size, LEFT);
      hilbert(order - 1, x + size, y, DOWN);
      hilbert(order - 1, x, y, DOWN);
      hilbert(order - 1, x, y + size, RIGHT);
    } else if (direction === LEFT) {
      hilbert(order - 1, x + size, y + size, DOWN);
      hilbert(order - 1, x, y + size, LEFT);
      hilbert(order - 1, x, y, LEFT);
      hilbert(order - 1, x + size, y, UP);
    }
  }
}

// Peano Curve Function
function peano(order, x = 0, y = 0, direction = 1) {
  if (order === 0) {
    path.push(createVector(x, y));
  } else {
    const size = 3 ** (order - 1);
    if (direction === 1) {
      // top to bottom, not mirrored
      peano(order - 1, x, y, 1);
      peano(order - 1, x, y + size, 2);
      peano(order - 1, x, y + 2 * size, 1);
      peano(order - 1, x + size, y + 2 * size, 3);
      peano(order - 1, x + size, y + size, 4);
      peano(order - 1, x + size, y, 3);
      peano(order - 1, x + 2 * size, y, 1);
      peano(order - 1, x + 2 * size, y + size, 2);
      peano(order - 1, x + 2 * size, y + 2 * size, 1);
    } else if (direction === 2) {
      // top to bottom, mirrored
      peano(order - 1, x + 2 * size, y, 2);
      peano(order - 1, x + 2 * size, y + size, 1);
      peano(order - 1, x + 2 * size, y + 2 * size, 2);
      peano(order - 1, x + size, y + 2 * size, 4);
      peano(order - 1, x + size, y + size, 3);
      peano(order - 1, x + size, y, 4);
      peano(order - 1, x, y, 2);
      peano(order - 1, x, y + size, 1);
      peano(order - 1, x, y + 2 * size, 2);
    } else if (direction === 3) {
      // bottom to top, not mirrored
      peano(order - 1, x, y + 2 * size, 3);
      peano(order - 1, x, y + size, 4);
      peano(order - 1, x, y, 3);
      peano(order - 1, x + size, y, 1);
      peano(order - 1, x + size, y + size, 2);
      peano(order - 1, x + size, y + 2 * size, 1);
      peano(order - 1, x + 2 * size, y + 2 * size, 3);
      peano(order - 1, x + 2 * size, y + size, 4);
      peano(order - 1, x + 2 * size, y, 3);
    } else if (direction === 4) {
      // bottom to top, mirrored
      peano(order - 1, x + 2 * size, y + 2 * size, 4);
      peano(order - 1, x + 2 * size, y + size, 3);
      peano(order - 1, x + 2 * size, y, 4);
      peano(order - 1, x + size, y, 2);
      peano(order - 1, x + size, y + size, 1);
      peano(order - 1, x + size, y + 2 * size, 2);
      peano(order - 1, x, y + 2 * size, 4);
      peano(order - 1, x, y + size, 3);
      peano(order - 1, x, y, 4);
    }
  }
}
