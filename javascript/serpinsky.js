let x1 = width/2;
let y1 = height/2-200;
let x2 = width/2-200;
let y2 = height/2+200;
let x3 = width/2+200;
let y3 = height/2+200;
let vertices = [{x: x1, y: y1}, {x: x2, y: y2}, {x: x3, y: y3}];


function setup() {
  createCanvas(800, 600);
  noFill();
  stroke(34,98, 236);
  triangle(width/2, height/2-200, width/2-200, height/2+200, width/2+200, height/2+200);
}

// function draw() {
//   let selectedVertex = random(vertices);

//   // let randX = random(x1, x3);
//   // let randY;
//   // let r = random(1);
//   // if (r < 0.5) {
//   //   randY = map(randX, x1, x2, y1, y2);
//   // } else {
//   //   randY = map(randX, x2, x3, y2, y3);
//   // }

//   strokeWeight(4);
//   point(selectedVertex.x, selectedVertex.y);
//   // point((randX + selectedVertex.x) / 2, (randY + selectedVertex.y) / 2);
// }

function mousePressed() {
  let selectedVertex = random(vertices);

  // let randX = random(x1, x3);
  // let randY;
  // let r = random(1);
  // if (r < 0.5) {
  //   randY = map(randX, x1, x2, y1, y2);
  // } else {
  //   randY = map(randX, x2, x3, y2, y3);
  // }

  strokeWeight(4);
  point(selectedVertex);
}

function mouseReleased() {
  
}