let vertices;
let currentX, currentY;
let triangleSize = 200;
let pointSize = 2;
let pointsPerFrame = 100;
let isAnimating = false;
let animationButton;
let buttonState = 'start';
let triangleSizeSlider, pointSizeSlider, speedSlider;
let triangleSizeLabel, pointSizeLabel, speedLabel;

function setup() {
  // Create canvas inside the container
  let canvas = createCanvas(800, 600);
  canvas.parent('canvas-container');
  
  // Set background color to match site's background
  background(217, 234, 247); // #d9eaf7
  
  // Create UI controls
  createUIControls();
  
  // Initialize triangle vertices based on default size
  updateTriangleVertices();
  
  // Draw initial triangle
  drawTriangle();
}

function createUIControls() {
  // Get the existing controls div from HTML
  let controlsDiv = select('#controls');
  
  // Create slider containers
  let triangleSizeContainer = createDiv();
  triangleSizeContainer.parent(controlsDiv);
  triangleSizeContainer.addClass('control-row');
  
  let pointSizeContainer = createDiv();
  pointSizeContainer.parent(controlsDiv);
  pointSizeContainer.addClass('control-row');
  
  let speedContainer = createDiv();
  speedContainer.parent(controlsDiv);
  speedContainer.addClass('control-row');
  
  // Create sliders
  triangleSizeLabel = createP('Triangle Size:');
  triangleSizeLabel.parent(triangleSizeContainer);
  triangleSizeLabel.addClass('control-label');
  
  triangleSizeSlider = createSlider(50, 300, triangleSize, 10);
  triangleSizeSlider.parent(triangleSizeContainer);
  triangleSizeSlider.addClass('control-slider');
  triangleSizeSlider.input(updateTriangleVertices);
  
  let triangleSizeValue = createSpan(triangleSize);
  triangleSizeValue.parent(triangleSizeContainer);
  triangleSizeValue.id('triangle-size-value');
  
  pointSizeLabel = createP('Point Size:');
  pointSizeLabel.parent(pointSizeContainer);
  pointSizeLabel.addClass('control-label');
  
  pointSizeSlider = createSlider(1, 10, pointSize, 1);
  pointSizeSlider.parent(pointSizeContainer);
  pointSizeSlider.addClass('control-slider');
  pointSizeSlider.input(updatePointSize);
  
  let pointSizeValue = createSpan(pointSize);
  pointSizeValue.parent(pointSizeContainer);
  pointSizeValue.id('point-size-value');
  
  speedLabel = createP('Points Per Frame:');
  speedLabel.parent(speedContainer);
  speedLabel.addClass('control-label');
  
  speedSlider = createSlider(10, 500, pointsPerFrame, 10);
  speedSlider.parent(speedContainer);
  speedSlider.addClass('control-slider');
  speedSlider.input(updateSpeed);
  
  let speedValue = createSpan(pointsPerFrame);
  speedValue.parent(speedContainer);
  speedValue.id('speed-value');
  
  // Create button container
  let buttonContainer = createDiv();
  buttonContainer.parent(controlsDiv);
  buttonContainer.addClass('button-container');
  
  // Create animation button with three states
  animationButton = createButton('Start');
  animationButton.parent(buttonContainer);
  animationButton.addClass('control-button start-button');
  animationButton.mousePressed(handleButtonClick);
}

function updateTriangleVertices() {
  triangleSize = triangleSizeSlider.value();
  select('#triangle-size-value').html(triangleSize);
  
  vertices = [
    {x: width/2, y: height/2-triangleSize},
    {x: width/2-triangleSize, y: height/2+triangleSize},
    {x: width/2+triangleSize, y: height/2+triangleSize}
  ];
  
  // Reset the canvas and redraw the triangle
  background(217, 234, 247); // #d9eaf7 - site's background color
  drawTriangle();
  
  // Reset the current point position
  currentX = undefined;
  currentY = undefined;
}

function drawTriangle() {
  noFill();
  stroke(34, 98, 236);
  strokeWeight(1);
  triangle(
    vertices[0].x, vertices[0].y,
    vertices[1].x, vertices[1].y,
    vertices[2].x, vertices[2].y
  );
}

function handleButtonClick() {
  switch(buttonState) {
    case 'start':
      // Start the animation
      isAnimating = true;
      buttonState = 'stop';
      animationButton.html('Stop');
      animationButton.removeClass('start-button');
      animationButton.addClass('stop-button');
      break;
      
    case 'stop':
      // Stop the animation
      isAnimating = false;
      buttonState = 'reset';
      animationButton.html('Reset');
      animationButton.removeClass('stop-button');
      animationButton.addClass('reset-button');
      break;
      
    case 'reset':
      // Reset the canvas and prepare to start again
      isAnimating = false;
      buttonState = 'start';
      animationButton.html('Start');
      animationButton.removeClass('reset-button');
      animationButton.addClass('start-button');
      
      // Clear the canvas and redraw the triangle
      background(217, 234, 247); // #d9eaf7
      drawTriangle();
      currentX = undefined;
      currentY = undefined;   
      redraw();   
      break;
  }
}

function updatePointSize() {
  pointSize = pointSizeSlider.value();
  select('#point-size-value').html(pointSize);
}

function updateSpeed() {
  pointsPerFrame = speedSlider.value();
  select('#speed-value').html(pointsPerFrame);
}

function draw() {
  if (!isAnimating) return;
  
  for (let i = 0; i < pointsPerFrame; i++) {
    let selectedVertex = random(vertices);
    
    if (currentX === undefined || currentY === undefined) {
      // First point - use barycentric coordinates for a random point inside the triangle
      let a = random(1);
      let b = random(1 - a);
      let c = 1 - a - b;
      currentX = vertices[0].x * a + vertices[1].x * b + vertices[2].x * c;
      currentY = vertices[0].y * a + vertices[1].y * b + vertices[2].y * c;
    } else {
      // Move halfway toward a randomly selected vertex
      currentX = (currentX + selectedVertex.x) / 2;
      currentY = (currentY + selectedVertex.y) / 2;
    }
    
    // Draw the point
    strokeWeight(pointSize);
    stroke(34, 98, 236);
    point(currentX, currentY);
  }
}