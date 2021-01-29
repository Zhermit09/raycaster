//@ts-check
"use strict";

let c = document.getElementById("myCanvas");
let ctx = c.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

const times = [];
let fps;

let px = 300;
let py = 150;
let pa = 2 * Math.PI;
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
  ["@", "-", "-", "-", "-", "-", "-", "@"],
  ["@", "-", "-", "-", "@", "-", "-", "@"],
  ["@", "-", "-", "-", "-", "-", "-", "@"],
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
let direction;
let dof;

function ray() {
  diffY = py % mapS;
  dof = 0;
  ra = pa;
  /*
    if (ra > Math.PI) {
      rayY = py - diffY;
      rayX = (-1 / Math.tan(ra)) * (py - rayY) + px;
      oY = -mapS;
      oX = (mapS / (rayY - py)) * (px - rayX);
      direction = -1;
    } else if (ra < Math.PI) {
      rayY = py + (mapS - diffY);
      rayX = (1 / Math.tan(ra)) * (rayY - py) + px;
      oY = mapS;
      oX = (mapS / (rayY - py)) * (rayX - px);
      direction = 0;
    } else if (ra == 0 || ra == Math.PI) {
      rayX = px;
      rayY = py;
      dof = 8;
      direction = 0;
    }
    */
  //left
  diffX = px % mapS;
  if (0.5 * Math.PI < ra && ra < 1.5 * Math.PI) {
    rayX = px - diffX;
    rayY = -1 * Math.tan(ra) * (px - rayX) + py;
    oX = -mapS;
    oY = (mapS / (px - rayX)) * (rayY - py);
    // console.log("left " + rayX)
  } else if (0.5 * Math.PI > ra || ra > 1.5 * Math.PI) {
    rayX = px + (mapS - diffX);
    rayY = 1 * Math.tan(ra) * (rayX - px) + py;
    oX = mapS;
    oY = (mapS / (rayX - px)) * (rayY - py);
    // console.log("right");
  } else if (ra == 0.5 * Math.PI || ra == 1.5 * Math.PI) {
    console.log("stop");
    rayX = px;
    rayY = py;
    dof = 8;
    direction = 0;
  }
  /* ctx.strokeStyle = "blue";
   ctx.beginPath();
   ctx.moveTo(px, py);
   ctx.lineTo(rayX, rayY);
   ctx.lineWidth = 2;
   ctx.stroke();*/
  //prob could just do with int cut feature
  let mrX = Math.floor(rayX / mapS);
  let mrY = Math.floor(rayY / mapS);
  console.log(map[mrY][mrX], mrX, mrY);
  while (dof < 3) {
    if (-1 < mrX && -1 < mrY && mrX < mapX && mrY < mapY && map[mrY][mrX] == "@") {
      console.log("stop");
      mrX = Math.floor(rayX / mapS);
      mrY = Math.floor(rayY / mapS) + direction;
      map[mrY][mrX];
      dof = 8;
    } else {
      rayY += oY;
      rayX += oX;

      mrX = Math.floor(rayX / mapS);
      mrY = Math.floor(rayY / mapS) + direction;
      dof++;
    }
  }

  // console.log(rayX + " " + rayY);
  // console.log("\n" + mrX + " " + mrY);
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(rayX, rayY);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "lime";
  ctx.fillRect(
    mrX * (mapS - 1) + mrX,
    mrY * (mapS - 1) + mrY,
    mapS - 1,
    mapS - 1
  );

  // console.log("Ray x: " + rayX, "Ray y: " + rayY);
}
function colorX(x) {
  return x;
}
function colorY(y) {
  return y;
}
