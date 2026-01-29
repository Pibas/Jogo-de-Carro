const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gameOverScreen = document.getElementById("gameOverScreen");
const gameOverScore = document.getElementById("gameOverScore");
const restartBtn = document.getElementById("restartBtn");

const menu = document.getElementById("menu");
const gameWrapper = document.getElementById("gameWrapper");
const recordText = document.getElementById("recordText");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const engineSound = document.getElementById("engineSound");
const crashSound = document.getElementById("crashSound");
const musicSound = document.getElementById("musicSound");

let animationId = null;

// recorde salvo
let highScore = localStorage.getItem("highScore") || 0;
recordText.textContent = "Recorde: " + highScore;

// faixas
const lanes = [70, 170, 270];
let currentLane = 1;

let player = { x: lanes[1], y: 450, w: 60, h: 100 };
let targetX = player.x;

let enemies = [];

let speed = 4;
let score = 0;
let level = 1;
let frame = 0;
let nextLevelScore = 50;

let gameOver = false;
let paused = false;
let anim = 0;
// gameover
function showGameOver(){
  gameOverScreen.style.display = "flex";
  gameOverScore.innerText = "Score: " + score;
}

// carro
function drawCar(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x + 10, y + 10, 40, 80);

  ctx.fillStyle = "lightgray";
  ctx.fillRect(x + 18, y + 20, 24, 25);

  ctx.fillStyle = "yellow";
  ctx.fillRect(x + 12, y + 5, 10, 5);
  ctx.fillRect(x + 38, y + 5, 10, 5);

  ctx.fillStyle = "black";
  ctx.fillRect(x + 5, y + 20, 5, 20);
  ctx.fillRect(x + 5, y + 60, 5, 20);
  ctx.fillRect(x + 50, y + 20, 5, 20);
  ctx.fillRect(x + 50, y + 60, 5, 20);
}

// start
startBtn.onclick = () => {
  menu.style.display = "none";
  gameWrapper.style.display = "block";

  enemies = [];
  speed = 4;
  score = 0;
  level = 1;
  frame = 0;
  nextLevelScore = 50;
  gameOver = false;
  paused = false;
  currentLane = 1;

  player.x = lanes[currentLane];
  targetX = player.x;

  engineSound.play().catch(()=>{});
  musicSound.currentTime = 0;
  musicSound.play().catch(()=>{});

  loop();
};

// pause
pauseBtn.onclick = () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "▶" : "⏸";

  if (paused) {
    engineSound.pause();
    musicSound.pause();
    cancelAnimationFrame(animationId);
  } else {
    engineSound.play();
    musicSound.play();
    loop();
  }
};

// controles
function moveLeft() {
  if (!paused && currentLane > 0) {
    currentLane--;
    targetX = lanes[currentLane];
  }
}

function moveRight() {
  if (!paused && currentLane < lanes.length - 1) {
    currentLane++;
    targetX = lanes[currentLane];
  }
}

leftBtn.onclick = moveLeft;
rightBtn.onclick = moveRight;

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") moveLeft();
  if (e.key === "ArrowRight") moveRight();
});

// inimigo
function spawnEnemy() {
  let lane = Math.floor(Math.random() * lanes.length);
  enemies.push({
    x: lanes[lane],
    y: -120,
    w: 60,
    h: 100,
    animOffset: Math.random() * 10
  });
}

// colisão
function collision(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// estrada
let roadY = 0;
function drawRoad() {
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 10; i++) {
    ctx.fillRect(195, roadY + i * 70, 10, 40);
  }
  roadY += speed;
  if (roadY > 70) roadY = 0;
}

// loop
function loop() {
  if (gameOver || paused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();

  player.x += (targetX - player.x) * 0.15;
  anim += 0.05;
  let px = player.x + Math.sin(anim);

  drawCar(px, player.y, "deepskyblue");

  enemies.forEach(enemy => {
    enemy.y += speed;
    let ex = enemy.x + Math.sin(anim + enemy.animOffset);
    drawCar(ex, enemy.y, "red");

    if (collision(
      { x: px, y: player.y, w: player.w, h: player.h },
      { x: ex, y: enemy.y, w: enemy.w, h: enemy.h }
    )) {
      gameOver = true;
      engineSound.pause();
      musicSound.pause();
      crashSound.play();

      if (score > highScore) {
        localStorage.setItem("highScore", score);
      }

      showGameOver();
      restartBtn.onclick = () => {
location.reload();
};

    }
  });

  enemies = enemies.filter(e => e.y < canvas.height);

  frame++;
  if (frame % 30 === 0) score++;

  if (score >= nextLevelScore) {
    level++;
    speed++;
    nextLevelScore += 50;
  }

  if (frame % Math.max(40, 80 - level * 5) === 0) spawnEnemy();

  // HUD
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(5, 5, 150, 45);
  ctx.fillRect(205, 5, 150, 45);

  ctx.strokeStyle = "deepskyblue";
  ctx.strokeRect(5, 5, 150, 45);
  ctx.strokeRect(205, 5, 150, 45);

  ctx.fillStyle = "white";
  ctx.font = "bold 16px Arial";
  ctx.fillText("PONTOS", 15, 22);
  ctx.fillText(score, 15, 42);

  ctx.fillText("NÍVEL", 215, 22);
  ctx.fillText(level, 215, 42);

  animationId = requestAnimationFrame(loop);
}