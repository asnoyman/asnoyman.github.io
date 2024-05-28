let boids = [];
let r = 10;
let maxforce = 0.3;
let maxspeed = 4;
let desiredseparation = 25;
let neighbordist = 30;
let mouseDown = false;
let onSlider = false;
let onButton = false;
let boidCount = 50;
let boidCountElement;
let clouds = [];
let showClouds = false;

function setup() {
  createCanvas(800, 600);
  background(135, 206, 235); // Sky blue color
  for (let i = 0; i < boidCount; i++) {
    boids.push(new Boid());
  }

  for (let i = 0; i < 3; i++) {
    clouds.push(new Cloud());
  }

  // Create sliders
  rSlider = createSliderWithLabel('Boid Size', 3, 20, r, 10, 130);
  maxforceSlider = createSliderWithLabel('Max Force', 0.1, 0.5, maxforce, 10, 180, 0.1);
  maxspeedSlider = createSliderWithLabel('Max Speed', 2, 10, maxspeed, 10, 230);
  desiredseparationSlider = createSliderWithLabel('Desired Separation', 10, 50, desiredseparation, 10, 280);
  neighbordistSlider = createSliderWithLabel('Neighbor Distance', 20, 100, neighbordist, 10, 330);

  let removeBoidsButton = createButton('Remove Some Boids').style('color', '#0A5AFE').style("font-weight", "bold").position(160, 130);
  removeBoidsButton.mousePressed(removeBoids);
  removeBoidsButton.mouseOver(() => onButton = true);
  removeBoidsButton.mouseOut(() => onButton = false);
  boidCountElement = createP('Boid Count: ' + boidCount).style('color', '#0A5AFE').style("font-weight", "bold").position(160, 100);

  let showCloudsCheckbox = createCheckbox('Show Clouds', false).style('color', '#0A5AFE').style("font-weight", "bold").position(160, 180);
  showCloudsCheckbox.changed(() => showClouds = showCloudsCheckbox.checked());
  showCloudsCheckbox.mouseOver(() => onButton = true);
  showCloudsCheckbox.mouseOut(() => onButton = false);

}

function createSliderWithLabel(label, min, max, value, x, y, step = 1) {
  let slider = createSlider(min, max, value, step);
  slider.position(x, y);
  slider.mouseOver(() => onSlider = true);
  slider.mouseOut(() => onSlider = false);
  createP(label).style('color', '#0A5AFE').style("font-weight", "bold").position(x, y - 30);
  return slider;
}

function draw() {
  background(135, 206, 235);

  // Update global variables from sliders
  r = rSlider.value();
  maxforce = maxforceSlider.value();
  maxspeed = maxspeedSlider.value();
  desiredseparation = desiredseparationSlider.value();
  neighbordist = neighbordistSlider.value();

  // Render clouds
  for (let i = clouds.length - 1; i >= 0; i--) {
    clouds[i].update();
    if (showClouds) clouds[i].display();
    if (clouds[i].x > width + 100) clouds.splice(i, 1);
  }
  if (random(1) < 0.001 && clouds.length < 5) {
    clouds.push(new Cloud());
  }

  // Render boids
  for (let i = 0; i < boids.length; i++) {
    boids[i].run(boids);
  }

  if (mouseDown && !onSlider && !onButton) {
    boids.push(new Boid(mouseX, mouseY));
    boidCount++;
    boidCountElement.html('Boid Count: ' + boidCount);
  }
}

function mousePressed() {
  mouseDown = true;
}

function mouseReleased() {
  mouseDown = false;
}

function removeBoids() {
  let numBoidsToRemove = Math.ceil(boids.length * 0.1);
  for (let i = 0; i < numBoidsToRemove; i++) {
    let indexToRemove = Math.floor(Math.random() * boids.length);
    boids.splice(indexToRemove, 1);
  }
  boidCount -= numBoidsToRemove;
  boidCountElement.html('Boid Count: ' + boidCount);
}


class Boid {
  constructor(x, y) {
    if (x && y) {
      this.position = createVector(x, y);
    } else {
      this.position = createVector(random(width), random(height));
    }
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();
  }

  run(boids) {
    this.flock(boids);
    this.update();
    this.borders();
    this.render();
  }

  flock(boids) {
    let sep = this.separate(boids); // Separation
    let ali = this.align(boids); // Alignment
    let coh = this.cohesion(boids); // Cohesion
    sep.mult(1.5);
    ali.mult(1.0);
    coh.mult(1.0);
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.position); // A vector pointing from the position to the target
    desired.setMag(maxspeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(maxforce); // Limit to maximum steering force
    return steer;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  separate(boids) {
    let steer = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if ((d > 0) && (d < desiredseparation)) {
        let diff = p5.Vector.sub(this.position, boids[i].position);
        diff.normalize();
        diff.div(d); // Weight by distance
        steer.add(diff);
        count++;
      }
    }
    if (count > 0) {
      steer.div(count);
    }
    if (steer.mag() > 0) {
      steer.setMag(maxspeed);
      steer.sub(this.velocity);
      steer.limit(maxforce);
    }
    return steer;
  }

  align(boids) {
    let sum = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(boids[i].velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(maxspeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(maxforce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  cohesion(boids) {
    let sum = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(boids[i].position);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    } else {
      return createVector(0, 0);
    }
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  borders() {
    if (this.position.x < -r) this.position.x = width + r;
    if (this.position.y < -r) this.position.y = height + r;
    if (this.position.x > width + r) this.position.x = -r;
    if (this.position.y > height + r) this.position.y = -r;
  }

  render() {
    fill(230, 122, 226); // A purple color
    noStroke();
    push(); // Save the current transformation
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading());
    beginShape();
    vertex(r, 0);
    vertex(-r, -r / 2);
    vertex(-r, r / 2);
    endShape(CLOSE);
    // Draw semi-circle
    arc(-r, 0, r, r, PI / 2, 3 * PI / 2);
    pop(); // Restore the transformation
  }
}

class Cloud {
  constructor() {
    this.x = random(-200, -100);
    this.y = random(0, height * 0.9);
    this.speed = random(0.3, 0.8);
    this.size = random(0.8, 1.5);
  }

  update() {
    this.x += this.speed;
  }

  display() {
      fill(250)
      noStroke();
      ellipse(this.x, this.y, 70 * this.size, 50 * this.size);
      ellipse(this.x + 10, this.y + 10, 70 * this.size, 50 * this.size);
      ellipse(this.x - 20, this.y + 10, 70 * this.size, 50 * this.size);
  }
}