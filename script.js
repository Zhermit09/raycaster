//@ts-check
"use strict";

let c = document.getElementById("myCanvas");
// @ts-ignore
let ctx = c.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

const times = [];
let fps;

let px = 300;
let py = 150;
let pa = 1.85 * Math.PI;
let pDx = Math.cos(pa);
let pDy = Math.sin(pa);

function refreshLoop() {
  window.requestAnimationFrame(() => {
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps = times.length;
    refreshLoop();
  });
}
refreshLoop();

function animate() {
  var request = requestAnimationFrame(animate);
  draw();
}

document.addEventListener("keydown", function (event) {
  if (event.keyCode == 37) {
    rotation(-Math.PI / 50);
    draw();
  } else if (event.keyCode == 38) {
    px += pDx * 4;
    py += pDy * 4;
    draw();
  } else if (event.keyCode == 39) {
    rotation(Math.PI / 50);
    draw();
  } else if (event.keyCode == 40) {
    px -= pDx * 4;
    py -= pDy * 4;
    draw();
  }
});

let temp;

function draw() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  mapDraw();
  drawRay();
  ctx.fillStyle = "black";
  ctx.fillRect(px - 7, py - 7, 13, 13);
  ctx.fillStyle = "yellow";
  ctx.fillRect(px - 6, py - 6, 11, 11);
  ctx.font = "17px Arial";
  ctx.fillText("FPS: " + fps, ctx.canvas.width - 70, 25);
  ray();
}

let mapX = 8,
  mapY = 8,
  mapS = 64;
let map = [
  ["@", "@", "@", "@", "@", "@", "@", "@"],
  ["@", "-", "-", "-", "-", "-", "-", "@"],
  ["@", "-", "@", "-", "-", "-", "-", "@"],
  ["@", "-", "-", "-", "-", "-", "-", "@"],
  ["@", "-", "@", "-", "-", "-", "-", "@"],
  ["@", "-", "-", "-", "-", "-", "-", "@"],
  ["@", "-", "-", "-", "-", "-", "-", "@"],
  ["@", "@", "@", "@", "@", "@", "@", "@"],
];

function drawRay() {
  ctx.strokeStyle = "green";
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + pDx * 100, py + pDy * 100);
  ctx.stroke();
}

function mapDraw() {
  ctx.fillStyle = "black";
  for (var i = 0; i < mapY; i++) {
    for (var j = 0; j < mapX; j++) {
      if (map[i][j] == "@") {
        ctx.fillStyle = "white";
      } else if (map[i][j] == "-") {
        ctx.fillStyle = "black";
      }
      colorX(j);
      colorY(i);
      ctx.fillRect(j * (mapS - 1) + j, i * (mapS - 1) + i, mapS - 1, mapS - 1);
    }
  }
}

function rotation(rot) {
  pa += rot;
  if (pa >= 2 * Math.PI) {
    pa -= 2 * Math.PI;
  } else if (pa <= 0) {
    pa += 2 * Math.PI;
  }
  pDy = Math.sin(pa);
  pDx = Math.cos(pa);
}

let ra;
let diffY;
let diffX;
let rayY;
let rayX;
let oY;
let oX;
let dof;
let directionY = 0;
let yRayY;
let yRayX;
let xRayY;
let xRayX;

function ray() {
  diffY = py % mapS;
  dof = 0;
  ra = pa;

  if (ra > Math.PI) {
    rayY = py - diffY;
    rayX = (-1 / Math.tan(ra)) * (py - rayY) + px;
    oY = -mapS;
    oX = (mapS / (rayY - py)) * (px - rayX);
    directionY = -1;
  } else if (ra < Math.PI) {
    rayY = py + (mapS - diffY);
    rayX = (1 / Math.tan(ra)) * (rayY - py) + px;
    oY = mapS;
    oX = (mapS / (rayY - py)) * (rayX - px);
    directionY = 0;
  } else if (ra == 0 || ra == Math.PI) {
    rayX = px;
    rayY = py;
    dof = 8;
    directionY = 0;
  }

  diffX = px % mapS;

  let mrX = Math.floor(rayX / mapS);
  let mrY = Math.floor(rayY / mapS);
  //console.log(map[mrY][mrX], mrX, mrY);

  while (dof < 8) {
    if (
      0 <= mrX &&
      0 <= mrY &&
      mrX < mapX &&
      mrY < mapY &&
      map[mrY][mrX] == "@"
    ) {
      //   console.log("stop");
      mrX = Math.floor(rayX / mapS);
      mrY = Math.floor(rayY / mapS) + directionY;
      map[mrY][mrX];
      dof = 8;
    } else {
      rayY += oY;
      rayX += oX;

      mrX = Math.floor(rayX / mapS);
      mrY = Math.floor(rayY / mapS) + directionY;
      dof++;
    }
    //  console.log(rayY);
  }
  yRayY = rayY;
  yRayX = rayX;

  /* ctx.fillStyle = "blue";
  ctx.fillRect(
    mrX * (mapS - 1) + mrX,
    mrY * (mapS - 1) + mrY,
    mapS - 1,
    mapS - 1
  );*/

  dof = 0;
  let directionX = 0;

  if (0.5 * Math.PI < ra && ra < 1.5 * Math.PI) {
    rayX = px - diffX;
    rayY = -1 * Math.tan(ra) * (px - rayX) + py;
    oX = -mapS;
    oY = (mapS / (px - rayX)) * (rayY - py);
    directionX = -1;
    //  console.log("left " + rayX +" ra " + ra)
  } else if (0.5 * Math.PI < ra || ra < 1.5 * Math.PI) {
    rayX = px + (mapS - diffX);
    rayY = 1 * Math.tan(ra) * (rayX - px) + py;
    oX = mapS;
    oY = (mapS / (rayX - px)) * (rayY - py);
    // console.log("right");
  } else if (ra == 0.5 * Math.PI || ra == 1.5 * Math.PI) {
    //  console.log("stop");
    rayX = px;
    rayY = py;
    dof = 8;
    directionX = 0;
  }

  mrX = Math.floor(rayX / mapS) + directionX;
  mrY = Math.floor(rayY / mapS);

  while (dof < 8) {
    if (
      0 <= mrX &&
      0 <= mrY &&
      mrX < mapX &&
      mrY < mapY &&
      map[mrY][mrX] == "@"
    ) {
      //      console.log("stop");
      mrX = Math.floor(rayX / mapS) + directionX;
      mrY = Math.floor(rayY / mapS);
      map[mrY][mrX];
      dof = 8;
    } else {
      rayY += oY;
      rayX += oX;

      mrX = Math.floor(rayX / mapS) + directionX;
      mrY = Math.floor(rayY / mapS);
      dof++;
    }
  }
  xRayY = rayY;
  xRayX = rayX;
  let yLenght = Math.pow(
    (yRayY - py) * (yRayY - py) + (yRayX - px) * (yRayX - px),
    0.5
  );
  let xLenght = Math.pow(
    (xRayY - py) * (xRayY - py) + (xRayX - px) * (xRayX - px),
    0.5
  );

  if (yLenght > xLenght) {
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(xRayX, xRayY);
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (yLenght < xLenght) {
    ctx.strokeStyle = "#04d9ff";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(yRayX, yRayY);
    ctx.lineWidth = 3;
    ctx.stroke();
  } else {
    ctx.strokeStyle = "pink";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(xRayX, xRayY);
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  console.log(xLenght + " " + yLenght);
  // console.log("\n" + mrX + " " + mrY);

  // console.log("Ray x: " + rayX, "Ray y: " + rayY);
}
function colorX(x) {
  return x;
}
function colorY(y) {
  return y;
}
