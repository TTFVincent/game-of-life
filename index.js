const unitLength = 20;
let boxColor = 150;
let strokeColor = 50;
let columns; /* To be determined by window width */
let rows; /* To be determined by window height */
let Board;
let keyX = 0;
let keyY = 0;
let rgbValue;
let colorPicker;
let cycleStable;
let ageing = 30;
let fadeOut = 255;
let fadeOutTime = 1;
let fr = 20;
let char = [];
let patternText = `O`;
let livePercentage;
let liveCount;
let boxCount;
let time = 10;
let startButton = document.getElementById("reset-game");

function setup() {
  /* Set the canvas to be under the element #canvas*/
  const canvas = createCanvas(windowWidth - 200, windowHeight - 200);
  canvas.parent(document.querySelector("#canvas"));
  canvas.mouseMoved(printPatternOutline);

  /*Calculate the number of columns and rows */
  columns = floor(width / unitLength);
  rows = floor(height / unitLength);

  /*Making both Board and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
  Board = [];
  nextBoard = [];
  for (let i = 0; i < columns; i++) {
    Board[i] = [];
  }

  colorPicker = createColorPicker("#ed225d");
  colorPicker.parent("colorPicker");

  // Now both Board and nextBoard are array of array of undefined values.
  init(); // Set the initial values of the Board and nextBoard
  drawKeyboardSquare();
  frameRate(fr);

  //set Framerate
  let slider = document.getElementById("customRange1");
  slider.addEventListener("input", () => {
    fr = parseInt(slider.value);
    document.getElementById("display-frame").innerHTML = `${fr} FPS`;
    frameRate(fr);
  });
}

function windowResized() {
  const canvas = createCanvas(windowWidth - 200, windowHeight - 200);
  canvas.parent(document.querySelector("#canvas"));
  canvas.mouseMoved(printPatternOutline);

  /*Calculate the number of columns and rows */
  columns = floor(width / unitLength);
  rows = floor(height / unitLength);

  /*Making both Board and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
  Board = [];
  nextBoard = [];
  for (let i = 0; i < columns; i++) {
    Board[i] = [];
  }

  // Now both Board and nextBoard are array of array of undefined values.
  init(); // Set the initial values of the Board and nextBoard
  drawKeyboardSquare();

}
//to set the grid size manually by input values
let reSizeButton = document.querySelector("#reSizeButton");
reSizeButton.addEventListener("click", () => {
  resizeGrid();
});

function timer() {
  time = 5;
  let setTime = document.getElementById("timer");
  setTime.innerHTML = time;
  let id = setInterval(() => {
    // let a = document.getElementById('reset-game')
    --time;
    if (time == 0 || livePercentage > 20) {
      // a.style.visibility = "visible"
      setTime.innerHTML = time;
      clearInterval(id);

      playVideoLose();
    } else {
      setTime.innerHTML = time;
    }
  }, 1000);
}

//play lose video if timer reach 0
function playVideoLose() {
  noLoop();
  let videos = document.getElementById("loseScreen");
  let LoseScreenButton = document.getElementById("tryAgainButton");
  let blackSquare = document.querySelector("#blackSquare");
  if (time == 0) {
    videos.play();
    videos.classList.remove("d-none");
    LoseScreenButton.classList.remove("d-none");
    blackSquare.classList.remove("d-none");
    startButton.classList.remove("active");
    startButton.classList.add("inActive");
    LoseScreenButton.onclick = () => {
      videos.classList.add("d-none");
      blackSquare.classList.add("d-none");
      LoseScreenButton.classList.add("d-none");
      init();
    };
  }
}

function playVideoWin() {
  noLoop();
  let videos = document.getElementById("winScreen");
  let WinScreenButton = document.getElementById("tryAgainButton");
  videos.play();
  videos.classList.remove("d-none");
  WinScreenButton.classList.remove("d-none");
  blackSquare.classList.remove("d-none");
  startButton.classList.remove("active");
  startButton.classList.add("inActive");
  WinScreenButton.onclick = () => {
    videos.classList.add("d-none");
    blackSquare.classList.add("d-none");
    WinScreenButton.classList.add("d-none");
    init();
  };
}

//change grid size by input numbers
function resizeGrid() {
  clear();
  columns = parseInt(document.getElementById("setNumwidth").value);
  rows = parseInt(document.getElementById("setNumheight").value);

  const canvas = createCanvas(columns * unitLength, rows * unitLength);
  canvas.parent(document.querySelector("#canvas"));
  /*Making both Board and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
  Board = [];
  for (let i = 0; i < columns; i++) {
    Board[i] = [];
  }
  init();
  loop();
}

/**
 * Initialize/reset the board state
 */
function init() {
  boxCount = 0;
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      Board[i][j] = {
        alive: 0,
        nextAlive: 0,
        age: 0,
        ageCheck: 0,
        rbg: [0, 0, 0],
      };
      boxCount++;
    }
  }
}

let my2 = 0;
let mx2 = 0;

// function mouseMoved(){
//   console.log(mouseX, mouseY)
// }

//draw an outline for the placement
function printPatternOutline() {
  if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
    return;
  }

  let pattern = patternText
    .split("\n")
    .flatMap((line, y) =>
      line.split("").map((char, x) => ({ x, y, alive: char == "O" }))
    );

  let my = Math.floor(mouseY / unitLength);
  let mx = Math.floor(mouseX / unitLength);
  if (my2 != my || mx2 != mx) {
    console.log(mx, mx2);
    clear();
    strokeWeight(1);
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        if (Board[i][j].age > ageing && Board[i][j].alive == 1) {
          fill(255, 0, 0, 255 - Board[i][j].age * fadeOutTime);
          stroke(strokeColor);
          rect(i * unitLength, j * unitLength, unitLength, unitLength);
        } else if (Board[i][j].alive == 1) {
          fill(boxColor);
          stroke(strokeColor);
          rect(i * unitLength, j * unitLength, unitLength, unitLength);
        } else {
          fill(0, 0, 0, 0);
          stroke(strokeColor);
          rect(i * unitLength, j * unitLength, unitLength, unitLength);
        }
      }
    }
  my2 = my;
  mx2 = mx;

    pattern.forEach((element) => {
      let peerX = (mx + element.x + columns) % columns;
      let peerY = (my + element.y + rows) % rows;
      if (element.alive) {
        stroke(0, 255, 0);
          rect(
            peerX * unitLength,
            peerY * unitLength,
            unitLength,
            unitLength
          )
      }
      // if (element.alive) {
      //   stroke(0, 255, 0);
      //   rect(
      //     (mx + element.x) * unitLength,
      //     (my + element.y) * unitLength,
      //     unitLength,
      //     unitLength
      //   );
      // }
    });
  }
}

//When mouse is dragged
function mouseDragged() {
  //If the mouse coordinate is outside the board
  if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
    return;
  }
    const x = Math.floor(mouseX / unitLength);
    const y = Math.floor(mouseY / unitLength);
    Board[x][y].alive = 1;
    fill(boxColor);
    stroke(strokeColor);
    rect(x * unitLength, y * unitLength, unitLength, unitLength);
}

let PlacePatternButton = document.querySelectorAll(".PlacePatternButton");

for (let Button of PlacePatternButton) {
  Button.addEventListener("click", () => {
    console.log("yes");
    if (Button.innerHTML == "SPACE SHIP") {
      patternText = `
OOO
..O
.O.
`.trim();
    }
    if (Button.innerHTML == "STABLE") {
      patternText = `
.O........
..O.......
OOO.......
.........O
.......OO.
..OOO...OO
....O.....
...O......
..........

`.trim();
    }
    if (Button.innerHTML == "DEFAULT") {
      patternText = `
O
`.trim();
    }
  });
}

document.getElementById("canvas").addEventListener("click", () => {
  let pattern = patternText
    .split("\n")
    .flatMap((line, y) =>
      line.split("").map((char, x) => ({ x, y, alive: char == "O" }))
    );

  let my = Math.floor(mouseY / unitLength);
  let mx = Math.floor(mouseX / unitLength);

  pattern.forEach((element) => {

    let peerX = (mx + element.x + columns) % columns;
    let peerY = (my + element.y + rows) % rows;
    if (element.alive) {
      Board[mx + element.x][my + element.y].alive = 1;
      fill(boxColor);
      stroke(0, 255, 0);
        rect(
          peerX * unitLength,
          peerY * unitLength,
          unitLength,
          unitLength
        )
    }



    // if (element.alive) {
    //   Board[mx + element.x][my + element.y].alive = 1;
    //   fill(boxColor);
    //   stroke(strokeColor);
    //   rect(
    //     (mx + element.x) * unitLength,
    //     (my + element.y) * unitLength,
    //     unitLength,
    //     unitLength
    //   );
    // }
  });
});

//When mouse is pressed
function mousePressed() {
  strokeWeight(1);
  // noLoop();
  mouseDragged();
}

//When mouse is released
function mouseReleased() {
  // if (pauseButton.classList.contains("is-running")) {
  //   loop();
  // }
}
// place life randomly
let randomButton = document.querySelector("#randomButton");
randomButton.addEventListener("click", () => {
  for (let keyX = 0; keyX < columns; keyX++) {
    for (let keyY = 0; keyY < rows; keyY++) {
      Board[keyX][keyY].alive = Math.floor(Math.random() * 2);
    }
  }
});

//Select RBG from colorPicker
document.querySelector("#colorNumberButton").addEventListener("click", () => {
  selectedColor = colorPicker.color();
  rgbValue = selectedColor.toString();
  boxColor = rgbValue;
  document.getElementById("colorNumber").value = rgbValue;
});

//Enable Keyboard Mode!!!!!
function drawKeyboardSquare() {
  document.body.addEventListener("keydown", function (event) {
    //Re-draw the grid every time the curser move
    clear();
    strokeWeight(1);
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        if (Board[i][j].age > ageing && Board[i][j].alive == 1) {
          fill(255, 0, 0, 255 - Board[i][j].age * fadeOutTime);
          stroke(strokeColor);
          rect(i * unitLength, j * unitLength, unitLength, unitLength);
        } else if (Board[i][j].alive == 1) {
          fill(boxColor);
          stroke(strokeColor);
          rect(i * unitLength, j * unitLength, unitLength, unitLength);
        } else {
          fill(0, 0, 0, 0);
          stroke(strokeColor);
          rect(i * unitLength, j * unitLength, unitLength, unitLength);
        }
      }
    }

    if (event.key == "ArrowUp") {
      if (keyY > 0) {
        keyY--;
      }
    } else if (event.key == "ArrowDown") {
      if (keyY < rows - 1) {
        keyY++;
      }
    } else if (event.key == "ArrowLeft") {
      if (keyX > 0) {
        keyX--;
      }
    } else if (event.key == "ArrowRight") {
      if (keyX < columns - 1) {
        keyX++;
      }
    }

    //draw the new box
    strokeWeight(2);
    stroke(255, 0, 0);
    fill(0, 0, 0, 0);
    rect(
      keyX * unitLength + 2,
      keyY * unitLength + 2,
      unitLength - 4,
      unitLength - 4
    );

    if (event.key == "z") {
      if (Board[keyX][keyY].alive == 1) {
        Board[keyX][keyY].alive = 0;

        //Re-draw the grid every time the curser move
        clear();
        strokeWeight(1);
        for (let i = 0; i < columns; i++) {
          for (let j = 0; j < rows; j++) {
            if (Board[i][j].age > ageing && Board[i][j].alive == 1) {
              fill(255, 0, 0, 255 - Board[i][j].age * fadeOutTime);
              stroke(strokeColor);
              rect(i * unitLength, j * unitLength, unitLength, unitLength);
            } else if (Board[i][j].alive == 1) {
              fill(boxColor);
              stroke(strokeColor);
              rect(i * unitLength, j * unitLength, unitLength, unitLength);
            } else {
              fill(0, 0, 0, 0);
              stroke(strokeColor);
              rect(i * unitLength, j * unitLength, unitLength, unitLength);
            }
          }
        }
        strokeWeight(2);

        stroke(255, 0, 0);
        rect(
          keyX * unitLength + 2,
          keyY * unitLength + 2,
          unitLength - 4,
          unitLength - 4
        );
      } else {
        Board[keyX][keyY].alive = 1;
        stroke(255, 0, 0);
        fill(boxColor);
        rect(
          keyX * unitLength + 2,
          keyY * unitLength + 2,
          unitLength - 4,
          unitLength - 4
        );
      }
    }
  });
}

//Press "Pause" to pause the game
let pauseButton = document.querySelector("#pause-game");
pauseButton.addEventListener("click", () => {
  pauseGame();
});

function pauseGame() {
  if (pauseButton.classList.contains("is-running")) {
    pauseButton.innerHTML = "resume";
    pauseButton.classList.toggle("is-running");
    pauseButton.classList.add("not-running");
    noLoop();
  } else if (pauseButton.classList.contains("not-running")) {
    document.getElementById("pause-game").innerHTML = "pause";
    document.getElementById("pause-game").classList.toggle("is-running");
    pauseButton.classList.remove("not-running");
    loop();
  }
}

//set how many cycle until it die and how many cycle to be stable
let setAgeing = document.getElementById("setAging");
let setFadeOut = document.getElementById("setFadeOut");
let setAgeButton = document.getElementById("setAgeButton");
setAgeButton.addEventListener("click", () => {
  ageing = setAgeing.value;
  fadeOut = setFadeOut.value;
  console.log(setAgeing.value, setFadeOut.value);
  if (setFadeOut.value == 0) {
    fadeOutTime = 0;
  } else {
    fadeOutTime = (1 / fadeOut) * 255;
  }
});

//Set random Colors
document.querySelector(".setRandomColor").addEventListener("click", () => {
  let randomColor = color(
    Math.floor(Math.random() * 254),
    Math.floor(Math.random() * 254),
    Math.floor(Math.random() * 254)
  );
  boxColor = randomColor;
  console.log(boxCount);
});

function draw() {
  strokeWeight(1);
  clear();
  //set frame with the slide bar

  //set random color with the "Set Random Color" Button

  generate();
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (Board[i][j].age > ageing && Board[i][j].alive == 1) {
        fill(255, 0, 0, 255 - Board[i][j].age * fadeOutTime);
      } else if (Board[i][j].alive == 1) {
        fill(boxColor);
      } else {
        fill(0, 0, 0, 0);
      }

      stroke(strokeColor);
      rect(i * unitLength, j * unitLength, unitLength, unitLength);
      if (Board[i][j].alive == 1) {
        Board[i][j].age++;
        Board[i][j].ageCheck++;
      } else if (Board[i][j].alive == 0 && Board[i][j].ageCheck > 0) {
        Board[i][j].ageCheck++;
        Board[i][j].age++;
      }

      if (
        (Board[i][j].nextAlive == 0 && Board[i][j].alive == 0) ||
        Board[i][j].age > fadeOut
      ) {
        Board[i][j].age = 0;
        Board[i][j].alive = 0;
        Board[i][j].nextAlive = 0;
      }
    }
  }
  function generate() {
    //reset LiveCount
    liveCount = 0;

    //Loop over every single box on the board
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        // Count all living members in the Moore neighborhood(8 boxes surrounding)
        let neighbors = 0;
        for (let i of [-1, 0, 1]) {
          for (let j of [-1, 0, 1]) {
            if (i == 0 && j == 0) {
              // the cell itself is not its own neighbor
              continue;
            }
            // The modulo operator is crucial for wrapping on the edge
            let peerX = (x + i + columns) % columns;
            let peerY = (y + j + rows) % rows;
            Board[peerX][peerY];
            if (Board[peerX][peerY].alive) {
              neighbors++;
            }
          }

          // Rules of Life
          if (Board[x][y].alive == 1 && neighbors < 2) {
            // Die of Loneliness
            Board[x][y].nextAlive = 0;
          } else if (Board[x][y].alive == 1 && neighbors > 3) {
            // Die of Overpopulation
            Board[x][y].nextAlive = 0;
          } else if (Board[x][y].alive == 0 && neighbors == 3) {
            // New life due to Reproduction
            Board[x][y].nextAlive = 1;
          } else Board[x][y].nextAlive = Board[x][y].alive;
        }

        //count how many live on the board
        if (Board[x][y].nextAlive == 1) {
          liveCount++;
        }
      }
    }

    document.querySelector("#livePercentage");

    // Swap the nextBoard to be the  Board
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        [Board[x][y].alive, Board[x][y].nextAlive] = [
          Board[x][y].nextAlive,
          Board[x][y].alive,
        ];
      }
    }
  }

  livePercentage = (liveCount / boxCount) * 100;
  let xds = livePercentage.toString();
  if (livePercentage > 20 && startButton.classList.contains("active")) {
    playVideoWin();
    startButton.classList.remove("active");
    startButton.classList.add("inActive");
  }
  document.getElementById("lifePercentage").innerHTML = xds.slice(0, 4);

  startButton.addEventListener("click", function () {
    init();
    loop();

    if (startButton.classList.contains("inActive")) {
      timer();
    }
    startButton.classList.add("active");
    startButton.classList.remove("inActive");
  });
  let pattern = patternText
  .split("\n")
  .flatMap((line, y) =>
    line.split("").map((char, x) => ({ x, y, alive: char == "O" }))
  );

let my = Math.floor(mouseY / unitLength);
let mx = Math.floor(mouseX / unitLength);

pattern.forEach((element) => {
  let peerX = (mx + element.x + columns) % columns;
  let peerY = (my + element.y + rows) % rows;
  if (element.alive) {
    stroke(0, 255, 0);
      rect(
        peerX * unitLength,
        peerY * unitLength,
        unitLength,
        unitLength
      )
  }
});


}
