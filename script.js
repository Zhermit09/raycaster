let c = document.getElementById("myCanvas");
let ctx = c.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

let px = 100;
let py = 100;
let pa = Math.PI;
let pDx = Math.cos(pa) * 5;
let pDy = Math.sin(pa) * 5;

document.addEventListener("keydown", function (event) {
  if (event.keyCode == 37) {
    rotation(-0.15);
    drawPlayer();
  } else if (event.keyCode == 38) {
    px += pDx;
    py += pDy;
    drawPlayer();
  } else if (event.keyCode == 39) {
    rotation(0.15);
    drawPlayer();
  } else if (event.keyCode == 40) {
    px -= pDx;
    py -= pDy;
    drawPlayer();
  }
});

function drawPlayer() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  mapDraw();
  drawRay();
  ctx.fillStyle = "yellow";
  ctx.fillRect(px, py, 11, 11);
  // console.log(Math.PI);
}

let mapX = 8,
  mapY = 8,
  mapS = 63;
let map = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

function drawRay() {
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(px + 6, py + 6);
  ctx.lineTo(px + pDx * 15 + 6, py + pDy * 15 + 6);
  ctx.stroke();
}

function mapDraw() {
  ctx.fillStyle = "black";
  for (i = 0; i < mapY; i++) {
    for (j = 0; j < mapX; j++) {
      if (map[i][j] == 1) {
        ctx.fillStyle = "white";
      } else {
        ctx.fillStyle = "black";
      }
      ctx.fillRect(j * mapS + j, i * mapS + i, mapS, mapS);
    }
  }
}

function rotation(rot) {
  pa += rot;
  console.log(pa);
  pDy = Math.sin(pa) * 5;
  pDx = Math.cos(pa) * 5;
}
