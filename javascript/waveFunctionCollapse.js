let CELL_SIZE_OPTIONS = [300, 150, 100, 60, 30, 15, 10, 5];

let CELL_SIZE;
let grid = [];
let simpleRailsTileTypes = [];
let complexRailsTileTypes = [];
let circuitBoardTileTypes = [];
let tileTypes = [];

let tileSizeSlider;
let intervalSlider;
let highlightBaseTileCheckbox;
let isSimulationStarted = false;
let isSimulationPaused = false;

function preload() {
  {
    const simpleRailBaseTiles = [
      {
        up: "aaa",
        right: "aaa",
        down: "aaa",
        left: "aaa",
        imgPath: '../data/tiles/train-tracks/blank.png'
      },
      {
        up: "aba",
        right: "aba",
        down: "aaa",
        left: "aba",
        imgPath: '../data/tiles/train-tracks/up.png'
      }
    ];
    const complexRailBaseTiles =  [
      {
        up: "aaa",
        right: "aaa",
        down: "aaa",
        left: "aaa",
        imgPath: '../data/tiles/rail/tile0.png'
      },
      {
        up: "aba",
        right: "aba",
        down: "aba",
        left: "aaa",
        imgPath: '../data/tiles/rail/tile1.png'
      },
      // {
      //   up: "baa",
      //   right: "aab",
      //   down: "aaa",
      //   left: "aaa",
      //   imgPath: '../data/tiles/rail/tile2.png'
      // },
      // {
      //   up: "baa",
      //   right: "aaa",
      //   down: "aab",
      //   left: "aaa",
      //   imgPath: '../data/tiles/rail/tile3.png'
      // },
      {
        up: "aba",
        right: "aba",
        down: "aaa",
        left: "aaa",
        imgPath: '../data/tiles/rail/tile4.png'
      },
      {
        up: "aba",
        right: "aaa",
        down: "aba",
        left: "aaa",
        imgPath: '../data/tiles/rail/tile5.png'
      },
      {
        up: "aba",
        right: "aba",
        down: "aba",
        left: "aba",
        imgPath: '../data/tiles/rail/tile6.png'
      }
    ];
    const curcuitBoardBaseTiles =  [
      {
        up: "aaa",
        right: "aaa",
        down: "aaa",
        left: "aaa",
        imgPath: '../data/tiles/circuit/0.png'
      }, {
        up: "bbb",
        right: "bbb",
        down: "bbb",
        left: "bbb",
        imgPath: '../data/tiles/circuit/1.png'
      }, {
        up: "bbb",
        right: "bcb",
        down: "bbb",
        left: "bbb",
        imgPath: '../data/tiles/circuit/2.png'
      }, {
        up: "bbb",
        right: "bdb",
        down: "bbb",
        left: "bdb",
        imgPath: '../data/tiles/circuit/3.png'
      }, {
        up: "abb",
        right: "bcb",
        down: "bba",
        left: "aaa",
        imgPath: '../data/tiles/circuit/4.png'
      }, {
        up: "abb",
        right: "bbb",
        down: "bbb",
        left: "bba",
        imgPath: '../data/tiles/circuit/5.png'
      }, {
        up: "bbb",
        right: "bcb",
        down: "bbb",
        left: "bcb",
        imgPath: '../data/tiles/circuit/6.png'
      }, {
        up: "bdb",
        right: "bcb",
        down: "bdb",
        left: "bcb",
        imgPath: '../data/tiles/circuit/7.png'
      }, {
        up: "bdb",
        right: "bbb",
        down: "bcb",
        left: "bbb",
        imgPath: '../data/tiles/circuit/8.png'
      }, {
        up: "bcb",
        right: "bcb",
        down: "bbb",
        left: "bcb",
        imgPath: '../data/tiles/circuit/9.png'
      }, {
        up: "bcb",
        right: "bcb",
        down: "bcb",
        left: "bcb",
        imgPath: '../data/tiles/circuit/10.png'
      }, {
        up: "bcb",
        right: "bcb",
        down: "bbb",
        left: "bbb",
        imgPath: '../data/tiles/circuit/11.png'
      }, {
        up: "bbb",
        right: "bcb",
        down: "bbb",
        left: "bcb",
        imgPath: '../data/tiles/circuit/12.png'
      }
    ];
  
    for (let baseTile of simpleRailBaseTiles) {
      for (let rotation = 0; rotation < 360; rotation += 90) {
        let newTile = createTile(baseTile, rotation);
        newTile.baseTileIndex = simpleRailBaseTiles.indexOf(baseTile);
        if (!isDuplicateTile(newTile, simpleRailsTileTypes)) {
          simpleRailsTileTypes.push(newTile);
        }
      }
    }
    
    for (let baseTile of complexRailBaseTiles) {
      for (let rotation = 0; rotation < 360; rotation += 90) {
        let newTile = createTile(baseTile, rotation);
        newTile.baseTileIndex = complexRailBaseTiles.indexOf(baseTile);
        if (!isDuplicateTile(newTile, complexRailsTileTypes)) {
          complexRailsTileTypes.push(newTile);
        }
      }
    }
    
    for (let baseTile of curcuitBoardBaseTiles) {
      for (let rotation = 0; rotation < 360; rotation += 90) {
        let newTile = createTile(baseTile, rotation);
        newTile.baseTileIndex = curcuitBoardBaseTiles.indexOf(baseTile);
        if (!isDuplicateTile(newTile, circuitBoardTileTypes)) {
          circuitBoardTileTypes.push(newTile);
        }
      }
    }
  
    tileTypes = simpleRailsTileTypes;
  }
}

function createTile(baseTile, rotation) {
  const newTile = { ...baseTile, img: loadImage(baseTile.imgPath), rotation };
  for (let i = 0; i < rotation / 90; i++) {
    rotateTile(newTile);
  }
  return newTile;
}

function rotateTile(tile) {
  const temp = tile.up;
  tile.up = tile.left;
  tile.left = tile.down;
  tile.down = tile.right;
  tile.right = temp;
}

function isDuplicateTile(newTile, tiles) {
  return tiles.some((tile) => {
    return (
      tile.up === newTile.up &&
      tile.right === newTile.right &&
      tile.down === newTile.down &&
      tile.left === newTile.left
    );
  });
}

function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent('canvas');
  background(0);
  
  tileSizeSlider = document.getElementById('tileSizeSlider');
  tileSizeSlider.oninput = updateGridSize;
  
  intervalSlider = document.getElementById('intervalSlider');

  highlightBaseTileCheckbox = document.getElementById('highlightBaseTileCheckbox');
  
  startPauseButton.onclick = startPauseSimulation;
  resetButton.onclick = resetSimulation;

  const tileSetRadios = document.getElementsByName('tileSet');
  for (let radio of tileSetRadios) {
    radio.onchange = function() {
      switch (this.value) {
        case 'simpleRails':
          tileTypes = simpleRailsTileTypes;
          updateTilePreview();
          break;
        case 'complexRails':
          tileTypes = complexRailsTileTypes;
          updateTilePreview();
          break;
        case 'circuitBoard':
          tileTypes = circuitBoardTileTypes;
          updateTilePreview();
          break;
      }
      grid = createGrid();
    };
  }

  updateTilePreview();

  updateGridSize();
}

function updateTilePreview() {
  let tilePreviewDiv = document.getElementById('tile-preview');
  
  while (tilePreviewDiv.firstChild) {
    tilePreviewDiv.removeChild(tilePreviewDiv.firstChild);
  }
  
  let baseTiles;
  switch (document.querySelector('input[name="tileSet"]:checked').value) {
    case 'simpleRails':
      baseTiles = simpleRailsTileTypes.filter(tile => tile.rotation === 0);
      break;
    case 'complexRails':
      baseTiles = complexRailsTileTypes.filter(tile => tile.rotation === 0);
      break;
    case 'circuitBoard':
      baseTiles = circuitBoardTileTypes.filter(tile => tile.rotation === 0);
      break;
  }
  
  let totalMargin = (baseTiles.length - 1) * 10;
  let tileSize = Math.min(100, (600 - totalMargin) / baseTiles.length);
  
  for (let baseTile of baseTiles) {
    let img = document.createElement('img');
    img.src = baseTile.imgPath;
    img.width = tileSize;
    img.height = tileSize;
    tilePreviewDiv.appendChild(img);
  }
}

function draw() {
  background(0);
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j].img) {
        push();
        translate(grid[i][j].x + CELL_SIZE / 2, grid[i][j].y + CELL_SIZE / 2);
        rotate(radians(grid[i][j].rotation));
        imageMode(CENTER);
        image(grid[i][j].img, 0, 0, CELL_SIZE, CELL_SIZE);
        pop();
      } else {
        noFill();
        stroke(255);
        rect(grid[i][j].x, grid[i][j].y, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function updateGridSize() {
  const tileSizeIndex = tileSizeSlider.value;
  CELL_SIZE = CELL_SIZE_OPTIONS[tileSizeIndex];
  grid = createGrid();
}

function createGrid() {
  const grid = [];
  for (let i = 0; i < height / CELL_SIZE; i++) {
    grid[i] = [];
    for (let j = 0; j < width / CELL_SIZE; j++) {
      grid[i][j] = createCell(j, i);
    }
  }
  return grid;
}

function createCell(j, i) {
  return {
    x: j * CELL_SIZE,
    y: i * CELL_SIZE,
    img: null,
    rotation: 0,
    availableTiles: Array(tileTypes.length).fill().map((_, index) => index),
  };
}

function startPauseSimulation() {
  if (!isSimulationStarted) {
    isSimulationStarted = true;
    isSimulationPaused = false;
    tileSizeSlider.disabled = true;
    intervalSlider.disabled = true;
    resetButton.disabled = false;
    const tileSetRadios = document.getElementsByName('tileSet');
    Array.prototype.forEach.call(tileSetRadios, function(radio) {
      radio.disabled = true;
    });
    startPauseButton.textContent = 'Pause Simulation';
    randomizeCell();
    setTimeout(simulationLoop, intervalSlider.value);
  } else {
    isSimulationPaused = !isSimulationPaused;
    if (isSimulationPaused) {
      startPauseButton.textContent = 'Play Simulation';
    } else {
      startPauseButton.textContent = 'Pause Simulation';
      simulationLoop();
    }
  }
}

function resetSimulation() {
  isSimulationStarted = false;
  isSimulationPaused = false;
  tileSizeSlider.disabled = false;
  intervalSlider.disabled = false;
  startPauseButton.textContent = 'Start Simulation';
  startPauseButton.disabled = false;
  resetButton.disabled = true;
  const tileSetRadios = document.getElementsByName('tileSet');
    Array.prototype.forEach.call(tileSetRadios, function(radio) {
      radio.disabled = false;
    });
  let tilePreviewDiv = document.getElementById('tile-preview');
  let imgElements = tilePreviewDiv.getElementsByTagName('img');
  for (let img of imgElements) {
    img.classList.remove('highlighted');
  }
  updateGridSize();
}

function simulationLoop() {
  if (isSimulationStarted && !isSimulationPaused) {
    randomizeCell();
    if (isSimulationStarted) {
      setTimeout(simulationLoop, intervalSlider.value);
    } else {
      startPauseButton.textContent = 'Simulation Ended';
      startPauseButton.disabled = true;
    }
  }
}


function randomizeCell() {
  let randomCell = getRandomMinOptionCell(grid);

  if (randomCell !== undefined) {
    let i = randomCell.i;
    let j = randomCell.j;
    let availableTiles = grid[i][j].availableTiles;
    
    if (availableTiles.length > 0) {
      let randomTile = random(availableTiles);
      grid[i][j].img = tileTypes[randomTile].img;
      grid[i][j].rotation = tileTypes[randomTile].rotation;

      // Highlight the base tile in the tile preview
      let tilePreviewDiv = document.getElementById('tile-preview');
      let imgElements = tilePreviewDiv.getElementsByTagName('img');
      for (let img of imgElements) {
        img.classList.remove('highlighted');
      }
      if (highlightBaseTileCheckbox.checked) {
        imgElements[tileTypes[randomTile].baseTileIndex].classList.add('highlighted');
      }

      // Update available tiles for adjacent cells
      let queue = [];
      let adjacentCells = getValidAdjacentCells(grid, i, j);
      
      for (let cell of adjacentCells) {
        let i = cell.i;
        let j = cell.j;
        let originalLength = grid[i][j].availableTiles.length;
        
        // Update available tiles for this cell
        updateAvailableTilesFromPlacedTile(grid, i, j);
        
        // If the available tiles for this cell changed, add it to the queue
        if (grid[i][j].availableTiles.length < originalLength) {
          queue.push(...getValidAdjacentCells(grid, i, j));
        }
      }
      
      // Ripple effect
      while (queue.length > 0) {
        let cell = queue.shift();
        let i = cell.i;
        let j = cell.j;
        let originalLength = grid[i][j].availableTiles.length;
        
        // Update available tiles for this cell
        updateAvailableTilesFromNeighbourOptions(grid, i, j);
        
        // If the available tiles for this cell changed, add its neighbors to the queue
        if (grid[i][j].availableTiles.length < originalLength) {
          const newCells = getValidAdjacentCells(grid, i, j).filter(newCell => !queue.find(cell => cell.i === newCell.i && cell.j === newCell.j));
          queue.push(...newCells);
        }
      }
    } else {
      // If no valid tiles are found, stop the simulation
      updateGridSize();
      console.log("No valid tiles found. Resetting simulation.");
    }
  } else {
    isSimulationStarted = false;
  }
}

// Helper function to get a random cell with the minimum number of available tiles
function getRandomMinOptionCell(grid) {
  const availableCells = getAvailableCells(grid);
  let minOptions = Infinity;
  let minCells = [];
  for (let cell of availableCells) {
    let options = grid[cell.i][cell.j].availableTiles.length;
    if (options < minOptions) {
      minOptions = options;
      minCells = [cell];
    } else if (options === minOptions) {
      minCells.push(cell);
    }
  }
  return random(minCells);
}

// Helper function to get all available cells in the grid
function getAvailableCells(grid) {
  const availableCells = [];
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j].img === null) {
        availableCells.push({ i, j });
      }
    }
  }
  return availableCells;
}

// Helper function to get the valid adjacent cells of a cell
function getValidAdjacentCells(grid, i, j) {
  const adjacentCells = [];
  if (i > 0) adjacentCells.push({ i: i - 1, j });
  if (i < grid.length - 1) adjacentCells.push({ i: i + 1, j });
  if (j > 0) adjacentCells.push({ i, j: j - 1 });
  if (j < grid[i].length - 1) adjacentCells.push({ i, j: j + 1 });
  return adjacentCells;
}

function updateAvailableTilesFromPlacedTile(grid, i, j) {
  const directions = ['up', 'down', 'left', 'right'];
  for (let direction of directions) {
    let neighborI = i, neighborJ = j;
    switch (direction) {
      case 'up':
        neighborI--;
        break;
      case 'down':
        neighborI++;
        break;
      case 'left':
        neighborJ--;
        break;
      case 'right':
        neighborJ++;
        break;
    }
    if (neighborI >= 0 && neighborI < grid.length && neighborJ >= 0 && neighborJ < grid[i].length) {
      const neighborTile = grid[neighborI][neighborJ];
      if (neighborTile.img) {
        const neighborType = tileTypes.find(tile => tile.img === neighborTile.img);
        grid[i][j].availableTiles = grid[i][j].availableTiles.filter(tile => {
          const tileType = tileTypes[tile];
          return isCodeCompatible(tileType[direction], neighborType[getOppositeDirection(direction)]);
        });
      }
    }
  }
}

function updateAvailableTilesFromNeighbourOptions(grid, i, j) {
  const directions = ['up', 'down', 'left', 'right'];
  for (let direction of directions) {
    let adjacentI = i, adjacentJ = j;
    switch (direction) {
      case 'up':
        adjacentI--;
        break;
      case 'down':
        adjacentI++;
        break;
      case 'left':
        adjacentJ--;
        break;
      case 'right':
        adjacentJ++;
        break;
    }
    if (adjacentI >= 0 && adjacentI < grid.length && adjacentJ >= 0 && adjacentJ < grid[i].length) {
      const adjacentCell = grid[adjacentI][adjacentJ];
      grid[i][j].availableTiles = grid[i][j].availableTiles.filter(tile => {
        const tileType = tileTypes[tile];
        return adjacentCell.availableTiles.some(adjacentTile => {
          const adjacentType = tileTypes[adjacentTile];
          return isCodeCompatible(tileType[direction], adjacentType[getOppositeDirection(direction)]);
        });
      });
    }
  }
}

// Helper function to get the opposite direction
function getOppositeDirection(direction) {
  switch (direction) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
  }
}

function isCodeCompatible(code1, code2) {
  return code1.split("").reverse().join("") === code2;
}