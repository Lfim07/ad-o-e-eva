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
     🎵 SISTEMA DE MÚSICA
  ===================== */

  const music1 = document.getElementById("music1");
  const music2 = document.getElementById("music2");
  const music3 = document.getElementById("music3");

  const musics = [music1, music2, music3];

  let currentMusic = null;
  let currentMusicChapter = -1;

  function stopAllMusic() {
    musics.forEach(m => {
      if (!m) return;
      m.pause();
      m.currentTime = 0;
      m.volume = 0;
    });
  }

  function fadeIn(audio) {
    if (!audio) return;

    audio.volume = 0;
    audio.play().catch(() => {});

    const fade = setInterval(() => {
      if (audio.volume < 0.4) {
        audio.volume += 0.02;
      } else {
        audio.volume = 0.4;
        clearInterval(fade);
      }
    }, 100);
  }

  function fadeOut(audio) {
    if (!audio) return;

    const fade = setInterval(() => {
      if (audio.volume > 0.02) {
        audio.volume -= 0.02;
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(fade);
      }
    }, 100);
  }

  function getMusicChapterByScore(score) {
    if (score >= 25) return 2;
    if (score >= 15) return 1;
    return 0;
  }

  function updateMusicByScore(score) {
    const newChapter = getMusicChapterByScore(score);

    if (newChapter !== currentMusicChapter) {
      currentMusicChapter = newChapter;
      const newMusic = musics[newChapter];

      if (currentMusic) fadeOut(currentMusic);
      currentMusic = newMusic;
      fadeIn(currentMusic);
    }
  }

  /* =====================
     CONFIGURAÇÕES
  ===================== */

  const GRID_SIZE = 20;
  const TOTAL = GRID_SIZE * GRID_SIZE;
  const FREEZE_TIME = 10000;

  const STORY = [
    { theme: 'eden',  title: '🌿 Éden',      text: 'Tudo é harmonia.', speed: 350, unlockScore: 0 },
    { theme: 'fall',  title: '🍎 Tentação', text: 'O risco cresce.',   speed: 150, unlockScore: 15 },
    { theme: 'exile', title: '🔥 Queda',    text: 'O erro cobra.',     speed: 120, unlockScore: 25 }
  ];

  const GAME_OVER_MESSAGES = [
    "💀 A serpente caiu pela própria escolha.",
    "🔥 O orgulho precedeu a queda.",
    "🍂 Nem toda tentação termina bem.",
    "⚡ Você foi rápido… mas não o suficiente.",
    "🌑 A escuridão venceu desta vez."
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

    stopAllMusic();
    currentMusic = null;
    currentMusicChapter = -1;

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

    updateMusicByScore(score);
  }

  /* =====================
     LOOP
  ===================== */

  function loop(time) {

    if (!running) return;

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

    updateMusicByScore(score);

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

  function showChapterIntro(chapter) {

    running = false;
    paused = true;

    statusHud.innerHTML = `
      <div style="font-size:18px">
        <strong>${chapter.title}</strong><br><br>
        ${chapter.text}<br><br>
        Prepare-se...
      </div>
    `;

    setTimeout(() => {
      statusHud.textContent = "";
      running = true;
      paused = false;
      lastTime = 0;
      animationId = requestAnimationFrame(loop);
    }, 3000);
  }

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

    showChapterIntro(chapter);
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

    if (currentMusic) fadeOut(currentMusic);

    const randomMessage =
      GAME_OVER_MESSAGES[Math.floor(Math.random() * GAME_OVER_MESSAGES.length)];

    statusHud.textContent = randomMessage;
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

  startIntroBtn.addEventListener('click', () => {
    intro.style.display = 'none';
    startGame();
  });

});