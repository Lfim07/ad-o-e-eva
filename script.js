// ================= CONFIGURAÇÃO =================
const GRID_SIZE = 20;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

// ================= ELEMENTOS =================
const grid = document.querySelector('.grid');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('startBtn');

// HUD de status
const statusHud = document.createElement('div');
statusHud.className = 'status-hud';
document.body.appendChild(statusHud);

// ================= ESTADO =================
let squares = [];
let snake = [];
let direction = 1;
let nextDirection = 1;

let score = 0;
let speed = 200;
let baseSpeed = 200;

let foodIndex = null;
let obstacles = [];

let running = false;
let frozen = false;
let immune = false;

let currentLevel = 1;

// ================= RAF =================
let lastTime = 0;
let accumulator = 0;

// ================= GRID =================
function createGrid() {
  grid.innerHTML = '';
  squares = [];

  for (let i = 0; i < TOTAL_CELLS; i++) {
    const div = document.createElement('div');
    grid.appendChild(div);
    squares.push(div);
  }
}

// ================= START =================
function startGame() {
  score = 0;
  direction = 1;
  nextDirection = 1;
  currentLevel = 1;

  speed = 200;
  baseSpeed = speed;

  frozen = false;
  immune = false;
  running = true;

  lastTime = 0;
  accumulator = 0;

  statusHud.textContent = '';

  squares.forEach(c =>
    c.classList.remove('snake', 'food', 'obstacle', 'frozen', 'immune')
  );

  snake = [45, 44, 43];
  snake.forEach(i => squares[i].classList.add('snake'));

  obstacles = [];
  generateObstacles(6);
  generateFood();

  requestAnimationFrame(gameLoop);
}

// ================= GAME LOOP =================
function gameLoop(time) {
  if (!running) return;

  if (!lastTime) lastTime = time;
  const delta = time - lastTime;
  lastTime = time;
  accumulator += delta;

  if (accumulator >= speed && !frozen) {
    updateSnake();
    accumulator = 0;
  }

  requestAnimationFrame(gameLoop);
}

// ================= UPDATE =================
function updateSnake() {
  if (frozen) return; // blindagem extra contra bug

  // direção suave
  if (
    (direction === 1 && nextDirection !== -1) ||
    (direction === -1 && nextDirection !== 1) ||
    (direction === GRID_SIZE && nextDirection !== -GRID_SIZE) ||
    (direction === -GRID_SIZE && nextDirection !== GRID_SIZE)
  ) {
    direction = nextDirection;
  }

  const head = snake[0];
  const newHead = head + direction;

  // colisão fatal (ignora se estiver imune)
  if (!immune && isCollision(head, newHead)) {
    endGame();
    return;
  }

  // colisão com obstáculo
  if (obstacles.includes(newHead)) {
    if (currentLevel >= 2) {
      consumeObstacle(newHead);
      triggerObstacleEffect();
      return;
    } else {
      endGame();
      return;
    }
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

// ================= COLISÃO FATAL =================
function isCollision(head, newHead) {
  return (
    (head % GRID_SIZE === GRID_SIZE - 1 && direction === 1) ||
    (head % GRID_SIZE === 0 && direction === -1) ||
    (head < GRID_SIZE && direction === -GRID_SIZE) ||
    (head >= TOTAL_CELLS - GRID_SIZE && direction === GRID_SIZE) ||
    snake.includes(newHead)
  );
}

// ================= COMIDA =================
function generateFood() {
  do {
    foodIndex = Math.floor(Math.random() * TOTAL_CELLS);
  } while (snake.includes(foodIndex) || obstacles.includes(foodIndex));

  squares[foodIndex].classList.add('food');
}

function eat() {
  squares[foodIndex].classList.remove('food');
  score++;

  // progressão de level
  if (score === 5) currentLevel = 2;
  if (score === 12) currentLevel = 3;

  generateFood();
}

// ================= OBSTÁCULOS =================
function generateObstacles(amount) {
  obstacles.forEach(i => squares[i].classList.remove('obstacle'));
  obstacles = [];

  while (obstacles.length < amount) {
    const index = Math.floor(Math.random() * TOTAL_CELLS);
    if (!snake.includes(index)) {
      obstacles.push(index);
      squares[index].classList.add('obstacle');
    }
  }
}

// obstáculo vira consumível
function consumeObstacle(index) {
  obstacles = obstacles.filter(o => o !== index);
  squares[index].classList.remove('obstacle');
}

// ================= EFEITO DO OBSTÁCULO =================
function triggerObstacleEffect() {
  if (frozen) return;

  frozen = true;
  baseSpeed = speed;

  let countdown = 10;
  statusHud.textContent = `🧊 Congelado: ${countdown}`;

  // animação de gelo
  snake.forEach(i => squares[i].classList.add('frozen'));

  const freezeTimer = setInterval(() => {
    countdown--;
    statusHud.textContent = `🧊 Congelado: ${countdown}`;

    if (countdown <= 0) {
      clearInterval(freezeTimer);
      unfreeze();
    }
  }, 1000);
}

// descongela + sorteia efeito
function unfreeze() {
  frozen = false;
  snake.forEach(i => squares[i].classList.remove('frozen'));

  const fast = Math.random() < 0.5;
  statusHud.textContent = fast ? '⚡ Velocidade Máxima!' : '🐢 Velocidade Reduzida';

  speed = fast ? Math.max(60, baseSpeed * 0.4) : baseSpeed * 2;

  activateImmunity();

  setTimeout(() => {
    speed = baseSpeed;
    statusHud.textContent = '';
  }, 60000);
}

// ================= IMUNIDADE =================
function activateImmunity() {
  immune = true;
  snake.forEach(i => squares[i].classList.add('immune'));

  setTimeout(() => {
    immune = false;
    snake.forEach(i => squares[i].classList.remove('immune'));
  }, 3000); // 3s de imunidade
}

// ================= GAME OVER =================
function endGame() {
  running = false;
  statusHud.textContent = '💀 Game Over';
}

// ================= CONTROLES =================
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') nextDirection = 1;
  if (e.key === 'ArrowLeft') nextDirection = -1;
  if (e.key === 'ArrowUp') nextDirection = -GRID_SIZE;
  if (e.key === 'ArrowDown') nextDirection = GRID_SIZE;
});

startBtn.addEventListener('click', startGame);

// ================= INIT =================
createGrid();
