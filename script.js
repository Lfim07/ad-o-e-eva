document.addEventListener('DOMContentLoaded', () => {

  /* =====================
     ELEMENTOS
  ===================== */
  const intro = document.getElementById('introScreen');
  const startIntroBtn = document.getElementById('startIntroBtn');

  const grid = document.querySelector('.grid');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('highScore');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('startBtn');

  const statusHud = document.createElement('div');
  statusHud.className = 'status-hud';
  document.body.appendChild(statusHud);

  /* =====================
     CONFIGURAÇÕES
  ===================== */
  const GRID_SIZE = 20;
  const TOTAL = GRID_SIZE * GRID_SIZE;
  const FREEZE_TIME = 10000;

  const STORY = [
    { theme: 'eden',  title: '🌿 Éden',      text: 'Tudo é harmonia.', speed: 350, unlockScore: 0 },
    { theme: 'fall',  title: '🍎 Tentação', text: 'O risco cresce.',   speed: 150, unlockScore: 10 },
    { theme: 'exile', title: '🔥 Queda',    text: 'O erro cobra.',     speed: 120, unlockScore: 25 }
  ];

  /* =====================
     VARIÁVEIS
  ===================== */
  let squares = [];
  let snake = [];
  let direction = 1;
  let nextDirection = 1;

  let foodIndex = 0;
  let score = 0;
  let highScore = Number(localStorage.getItem('highScore')) || 0;

  let baseSpeed = STORY[0].speed;
  let speed = baseSpeed;

  let lastTime = 0;
  let accumulator = 0;

  let running = false;
  let paused = false;
  let frozen = false;

  let currentChapter = 0;
  let animationId = null;

  let freezeTimeout = null;
  let speedTimeout = null;

  highScoreEl.textContent = highScore;

  /* =====================
     GRID
  ===================== */
  function createGrid() {
    grid.innerHTML = '';
    squares = [];

    for (let i = 0; i < TOTAL; i++) {
      const div = document.createElement('div');
      grid.appendChild(div);
      squares.push(div);
    }
  }

  /* =====================
     START
  ===================== */
  function startGame() {

    running = false;

    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    clearTimeout(freezeTimeout);
    clearTimeout(speedTimeout);

    frozen = false;
    paused = false;

    accumulator = 0;
    lastTime = 0;

    createGrid();

    snake = [45, 44, 43];
    direction = 1;
    nextDirection = 1;

    score = 0;
    scoreEl.textContent = score;

    squares.forEach(c => c.className = '');
    snake.forEach(i => squares[i].classList.add('snake'));

    currentChapter = 0;
    applyChapter();

    generateFood();

    running = true;
    animationId = requestAnimationFrame(loop);
  }

  /* =====================
     LOOP (CORRIGIDO)
  ===================== */
  function loop(time) {

    if (!running) return;

    // 🔥 Corrige delta gigante no primeiro frame
    if (!lastTime) lastTime = time;

    if (paused || frozen) {
      lastTime = time;
      animationId = requestAnimationFrame(loop);
      return;
    }

    const delta = time - lastTime;
    lastTime = time;

    accumulator += delta;

    while (accumulator >= speed) {
      update();
      accumulator -= speed;
    }

    animationId = requestAnimationFrame(loop);
  }

  /* =====================
     UPDATE
  ===================== */
  function update() {
    move();
    checkStoryProgress();
  }

  /* =====================
     MOVIMENTO
  ===================== */
  function move() {

    direction = nextDirection;

    const head = snake[0];
    const newHead = head + direction;

    const hitWall =
      newHead < 0 ||
      newHead >= TOTAL ||
      (head % GRID_SIZE === GRID_SIZE - 1 && direction === 1) ||
      (head % GRID_SIZE === 0 && direction === -1);

    const hitSelf = snake.includes(newHead);

    if (hitWall || hitSelf) {
      gameOver();
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

  /* =====================
     COMIDA
  ===================== */
  function generateFood() {

    // 🔥 Limpa comida anterior por segurança
    squares.forEach(c => c.classList.remove('food'));

    do {
      foodIndex = Math.floor(Math.random() * TOTAL);
    } while (snake.includes(foodIndex));

    squares[foodIndex].classList.add('food');
  }

  function eat() {

    squares[foodIndex].classList.remove('food');

    score++;
    scoreEl.textContent = score;

    if (score % 5 === 0) triggerFreeze();

    if (score > highScore) {
      highScore = score;
      localStorage.setItem('highScore', highScore);
      highScoreEl.textContent = highScore;
    }

    generateFood();
  }

  /* =====================
     CONGELAMENTO
  ===================== */
  function triggerFreeze() {

    if (!running) return;

    frozen = true;
    statusHud.textContent = '🧊 Congelado por 10 segundos';

    snake.forEach(i => squares[i].classList.add('frozen'));

    clearTimeout(freezeTimeout);

    freezeTimeout = setTimeout(() => {

      if (!running) return;

      snake.forEach(i => squares[i].classList.remove('frozen'));
      frozen = false;

      applyRandomSpeed();

    }, FREEZE_TIME);
  }

  function applyRandomSpeed() {

    if (!running) return;

    clearTimeout(speedTimeout);

    const faster = Math.random() < 0.5;
    speed = faster ? baseSpeed * 0.8 : baseSpeed * 1.3;

    statusHud.textContent =
      faster ? '⚡ A serpente acelerou!' : '🐢 A serpente ficou lenta!';

    speedTimeout = setTimeout(() => {
      if (!running) return;
      speed = baseSpeed;
      statusHud.textContent = '';
    }, 5000);
  }

  /* =====================
     HISTÓRIA
  ===================== */
  function checkStoryProgress() {

    if (
      currentChapter < STORY.length - 1 &&
      score >= STORY[currentChapter + 1].unlockScore
    ) {
      currentChapter++;
      applyChapter();
    }
  }

  function applyChapter() {

    const chapter = STORY[currentChapter];

    document.body.setAttribute('data-theme', chapter.theme);

    baseSpeed = chapter.speed;
    speed = baseSpeed;

    statusHud.textContent = `${chapter.title} — ${chapter.text}`;

    setTimeout(() => {
      if (running) statusHud.textContent = '';
    }, 3000);
  }

  /* =====================
     GAME OVER
  ===================== */
  function gameOver() {

    running = false;

    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    statusHud.textContent = '💀 A queda foi inevitável';
  }

  /* =====================
     CONTROLES
  ===================== */
  document.addEventListener('keydown', e => {

    if (!running) return;

    if (e.key === 'ArrowRight' && direction !== -1) nextDirection = 1;
    if (e.key === 'ArrowLeft' && direction !== 1) nextDirection = -1;
    if (e.key === 'ArrowUp' && direction !== GRID_SIZE) nextDirection = -GRID_SIZE;
    if (e.key === 'ArrowDown' && direction !== -GRID_SIZE) nextDirection = GRID_SIZE;

    if (e.key === ' ') paused = !paused;
  });

  pauseBtn.addEventListener('click', () => paused = !paused);
  restartBtn.addEventListener('click', startGame);

  /* =====================
     INTRO
  ===================== */
  startIntroBtn.addEventListener('click', () => {
    intro.style.display = 'none';
    startGame();
  });

});
