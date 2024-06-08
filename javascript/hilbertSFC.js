// Constants
const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;

// Simulation Variables
let order = 4;
let speed = 100;
let mode = 'blackAndWhite';
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
let colourSelect;
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
  colourSelect = document.getElementById('colourSelect');
  startPauseButton = document.getElementById('startPauseButton');
  resetButton = document.getElementById('resetButton');
  imageUpload = document.getElementById('imageUpload');
  imagePreviewDiv = document.getElementById('imagePreview');
  let skipFramesSlider = document.getElementById('skipFramesSlider');

  // Add Event Listeners
  orderSlider.addEventListener('input', handleOrderChange);
  intervalSlider.addEventListener('input', handleIntervalChange);
  skipFramesSlider.addEventListener('input', handleSkipFramesChange);
  colourSelect.addEventListener('change', handleColourChange);
  imageUpload.addEventListener('change', handleImageUpload);
  startPauseButton.addEventListener('click', handleStartPause);
  resetButton.addEventListener('click', handleReset);

  // Initialize Canvas Variables
  cellSizeX = width / 2 ** order;
  cellSizeY = height / 2 ** order;
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
  cellSizeX = width / 2 ** order;
  cellSizeY = height / 2 ** order;
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
    cellSizeX = 600 / 2 ** order;
    cellSizeY = 600 / 2 ** order;
    imageUpload.value = null;
    imageUpload.style.display = 'none';
    imagePreview = null;
    imagePreviewDiv.style.display = 'none';
  } else {
    imageUpload.style.display = 'block';
  }
  background(0);
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
    cellSizeX = newWidth / 2 ** order;
    cellSizeY = newHeight / 2 ** order;
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
    imageUpload.disabled = true;
  } else {
    startPauseButton.textContent = 'Start Simulation';
  }
}

function handleReset() {
  resetSimulation();
}

// Reset Simulation Function
function resetSimulation() {
  background(0);
  path = [];
  index = 0;
  lastTime = 0;
  running = false;
  startPauseButton.textContent = 'Start Simulation';
  startPauseButton.disabled = false;
  orderSlider.disabled = false;
  resetButton.disabled = true;
  colourSelect.disabled = false;
  imageUpload.disabled = false;
  hilbert(order);
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
      let pixelX = Math.floor(map(path[i].x, 0, 2 ** order, 0, imagePreview.width));
      let pixelY = Math.floor(map(path[i].y, 0, 2 ** order, 0, imagePreview.height));
      let pixelColor = imagePreview.get(pixelX, pixelY);
      let grayValue = brightness(pixelColor);
      return (grayValue * 255) / 100;
    }
  }
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
