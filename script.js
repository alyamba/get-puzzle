const containerNode = document.getElementById("play-container");
const itemNodes = Array.from(document.querySelectorAll(".item"));
const countItems = 16;

const mixBtn = document.getElementById("mix");

const stopBtn = document.querySelector(".stop");
const watch = document.querySelector(".watch");
let sec = 0;
let timer;

const numberOfMoves = document.querySelector(".count");
let clickCount = 0;

if (itemNodes.length !== 16) {
  throw new Error(`Должно быть ровно ${countItems} items in HTML`);
}

// HELPS
function getMatrix(arr) {
  const matrix = [[], [], [], []];
  let y = 0;
  let x = 0;

  for (let i = 0; i < arr.length; i++) {
    if (x >= 4) {
      y++;
      x = 0;
    }

    matrix[y][x] = arr[i];
    x++;
  }

  return matrix;
}

function setPositionItems(matrix) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      const value = matrix[y][x];
      const node = itemNodes[value - 1];
      setNodeStyles(node, x, y);
    }
  }
}

function setNodeStyles(node, x, y) {
  const shiftPs = 100;
  node.style.transform = `translate3D(${x * shiftPs}%, ${y * shiftPs}%, 0)`;
}

function mixArray(arr) {
  return arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function findCoordinatesByNumber(number, matrix) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] === number) {
        return { x, y };
      }
    }
  }

  return null;
}

function isValidForSwap(coords1, coords2) {
  const diffX = Math.abs(coords1.x - coords2.x);
  const diffY = Math.abs(coords1.y - coords2.y);

  return (
    (diffX === 1 || diffY === 1) &&
    (coords1.x === coords2.x || coords1.y === coords2.y)
  );
}

const winFLatArr = new Array(16).fill(0).map((item, i) => i + 1);
function isWon(matrix) {
  const flatMatrix = matrix.flat();
  for (let i = 0; i < winFLatArr.length; i++) {
    if (flatMatrix[i] !== winFLatArr[i]) {
      return false;
    }
  }
  return true;
}

const wonClass = "won";
function addWonClass() {
  setTimeout(() => {
    containerNode.classList.add(wonClass);
    setTimeout(() => {
      containerNode.classList.remove(wonClass);
      clickCount = 0;
      numberOfMoves.textContent = `${clickCount}`;
    }, 500);
  }, 200);
}

function swap(coords1, coords2, matrix) {
  const coords1Number = matrix[coords1.y][coords1.x];
  matrix[coords1.y][coords1.x] = matrix[coords2.y][coords2.x];
  matrix[coords2.y][coords2.x] = coords1Number;

  clickCount++;
  numberOfMoves.textContent = `${clickCount}`;
  if (isWon(matrix)) {
    pausedWatch();
    addWonClass();
  }
}

const startWatch = () => {
  console.log("watch");
  watch.classList.remove("paused");
  clearInterval(timer);
  timer = setInterval(() => {
    sec += 10;
    let dateTimer = new Date(sec);
    watch.innerHTML =
      ("0" + dateTimer.getUTCMinutes()).slice(-2) +
      ":" +
      ("0" + dateTimer.getUTCSeconds()).slice(-2);
  }, 10);
};

const pausedWatch = () => {
  watch.classList.add("paused");
  clearInterval(timer);
};

// POSITION
itemNodes[countItems - 1].style.display = "none";
let matrix = getMatrix(itemNodes.map((item) => Number(item.dataset.matrixId)));
console.log(matrix);
setPositionItems(matrix);

// MIX
function mix() {
  clickCount = 0;
  numberOfMoves.textContent = `${clickCount}`;
  sec = 0;
  startWatch();
  const mixedArray = mixArray(matrix.flat());
  matrix = getMatrix(mixedArray);
  setPositionItems(matrix);
}
mixBtn.addEventListener("click", mix);

// CHANGE POSITION BY CLICK
const blankNumber = 16;
containerNode.addEventListener("click", (event) => {
  const buttonNode = event.target.closest("button");
  if (!buttonNode) {
    return;
  }

  const buttonNumber = Number(buttonNode.dataset.matrixId);
  const buttonCoords = findCoordinatesByNumber(buttonNumber, matrix);
  const blankCoords = findCoordinatesByNumber(blankNumber, matrix);
  const isValid = isValidForSwap(buttonCoords, blankCoords);

  if (isValid) {
    swap(blankCoords, buttonCoords, matrix);
    setPositionItems(matrix);
  }
});

// CHANGE POSITION BY ARROWS
window.addEventListener("keydown", (event) => {
  if (!event.key.includes("Arrow")) {
    return;
  }
  const blankCoords = findCoordinatesByNumber(blankNumber, matrix);
  const buttonCoords = {
    x: blankCoords.x,
    y: blankCoords.y,
  };

  const direction = event.key.split("Arrow")[1].toLowerCase();
  switch (direction) {
    case "up":
      buttonCoords.y += 1;
      break;
    case "down":
      buttonCoords.y -= 1;
      break;
    case "left":
      buttonCoords.x += 1;
      break;
    case "right":
      buttonCoords.x -= 1;
      break;
  }

  if (
    buttonCoords.y >= matrix.length ||
    buttonCoords.y < 0 ||
    buttonCoords.x >= matrix.length ||
    buttonCoords.x < 0
  ) {
    return;
  }

  swap(blankCoords, buttonCoords, matrix);
  setPositionItems(matrix);
});

stopBtn.addEventListener("click", pausedWatch);

//CLICK sound
function setupSynth() {
  window.synth = new Tone.Synth({
    oscillator: {
      type: "sine",
      modulationFrequency: 0.5,
    },
    envelope: {
      attack: 0,
      decay: 0.2,
      sustain: 0,
      release: 0.5,
    },
  }).toMaster();
}

function boopMe() {
  if (!window.synth) {
    setupSynth();
  }

  window.synth.triggerAttackRelease(600, "9n");
}

containerNode.addEventListener("touchstart", function (e) {
  e.stopPropagation();
  e.preventDefault();
  boopMe();
});
containerNode.addEventListener("mousedown", boopMe);
