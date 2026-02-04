// ================== ELEMENTOS ==================
const grid = document.querySelector('.grid');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');

const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');

// ================== CONFIG ==================
const GRID_SIZE = 20;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const SWIPE_THRESHOLD = 30;

let squares = [];
let snake = [];
let direction = 1;
let nextDirection = 1;

let score = 0;
let speed = 200;
let gameInterval = null;
let foodIndex = null;

// ================== RANKING ==================
let highScore = Number(localStorage.getItem('highScore')) || 0;
highScoreEl.textContent = highScore;

// ================== TABULEIRO ==================
function createGrid() {
  grid.innerHTML = '';
  squares = [];

  for (let i = 0; i < TOTAL_CELLS; i++) {
    const cell = document.createElement('div');
    grid.appendChild(cell);
    squares.push(cell);
  }
}

// ================== START / RESET ==================
function startGame() {
  clearInterval(gameInterval);

  score = 0;
  speed = 200;
  direction = 1;
  nextDirection = 1;

  scoreEl.textContent = score;

  squares.forEach(cell =>
    cell.classList.remove('snake', 'food')
  );

  snake = [45, 44, 43];
  snake.forEach(i => squares[i].classList.add('snake'));

  generateFood();
  gameInterval = setInterval(gameLoop, speed);
}

// ================== GAME LOOP ==================
function gameLoop() {
  direction = nextDirection;

  const head = snake[0];
  const newHead = head + direction;

  if (isCollision(head, newHead)) {
    endGame();
    return;
  }

  snake.unshift(newHead);
  squares[newHead].classList.add('snake');

  if (newHead === foodIndex) {
    eat();
  } else {
    const tail = snake.pop();
    squares[tail].classList.remove('snake');
  }
}

// ================== COLISÃO ==================
function isCollision(head, newHead) {
  return (
    (head % GRID_SIZE === GRID_SIZE - 1 && direction === 1) ||
    (head % GRID_SIZE === 0 && direction === -1) ||
    (head < GRID_SIZE && direction === -GRID_SIZE) ||
    (head >= TOTAL_CELLS - GRID_SIZE && direction === GRID_SIZE) ||
    snake.includes(newHead)
  );
}

// ================== COMIDA ==================
function generateFood() {
  do {
    foodIndex = Math.floor(Math.random() * TOTAL_CELLS);
  } while (snake.includes(foodIndex));

  squares[foodIndex].classList.add('food');
}

function eat() {
  squares[foodIndex].classList.remove('food');
  playSound(eatSound);

  score++;
  scoreEl.textContent = score;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
    highScoreEl.textContent = highScore;
  }

  // aceleração progressiva
  speed = Math.max(60, speed - 5);
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, speed);

  generateFood();
}

// ================== GAME OVER ==================
function endGame() {
  clearInterval(gameInterval);
  playSound(gameOverSound);

  grid.classList.add('game-over');
  setTimeout(() => grid.classList.remove('game-over'), 400);
}

// ================== SOM ==================
function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

// ================== CONTROLES (TECLADO) ==================
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' && direction !== -1) nextDirection = 1;
  if (e.key === 'ArrowLeft' && direction !== 1) nextDirection = -1;
  if (e.key === 'ArrowUp' && direction !== GRID_SIZE) nextDirection = -GRID_SIZE;
  if (e.key === 'ArrowDown' && direction !== -GRID_SIZE) nextDirection = GRID_SIZE;
});

// ================== CONTROLES (TOUCH PROFISSIONAL) ==================
let touchStartX = 0;
let touchStartY = 0;
let isSwiping = false;

grid.addEventListener('touchstart', e => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  isSwiping = true;
}, { passive: true });

grid.addEventListener('touchend', e => {
  if (!isSwiping) return;

  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
    isSwiping = false;
    return;
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction !== -1) nextDirection = 1;
    else if (dx < 0 && direction !== 1) nextDirection = -1;
  } else {
    if (dy > 0 && direction !== -GRID_SIZE) nextDirection = GRID_SIZE;
    else if (dy < 0 && direction !== GRID_SIZE) nextDirection = -GRID_SIZE;
  }

  isSwiping = false;
});

// ================== BOTÃO ==================
startBtn.addEventListener('click', startGame);

// ================== INIT ==================
createGrid();

// ================== CONTROLES POR BOTÃO (MOBILE) ==================
const btnUp = document.querySelector('.btn.up');
const btnDown = document.querySelector('.btn.down');
const btnLeft = document.querySelector('.btn.left');
const btnRight = document.querySelector('.btn.right');

function bindButton(button, newDir, oppositeDir) {
  button.addEventListener('touchstart', e => {
    e.preventDefault();
    if (direction !== oppositeDir) {
      nextDirection = newDir;
    }
  });

  button.addEventListener('mousedown', () => {
    if (direction !== oppositeDir) {
      nextDirection = newDir;
    }
  });
}

bindButton(btnUp, -GRID_SIZE, GRID_SIZE);
bindButton(btnDown, GRID_SIZE, -GRID_SIZE);
bindButton(btnLeft, -1, 1);
bindButton(btnRight, 1, -1);
