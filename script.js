//@ts-check
"use strict";

let c = document.getElementById("myCanvas");
// @ts-ignore
let ctx = c.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
ctx.beginPath();
ctx.moveTo(1, 500);
ctx.lineTo(500, 500);
ctx.lineWidth = 1;
ctx.strokeStyle = "red";
ctx.stroke();

//ctx.imageSmoothingEnabled = true;

const times = [];
let fps;

let px = 319;
let py = 191;
let pa = 1.75 * Math.PI;
let pDx = Math.cos(pa);
let pDy = Math.sin(pa);
let dgr = Math.PI / 180;

let mapX = 8,
  mapY = 8,
  mapS = 64,
  map = [
    ["@", "@", "@", "@", "@", "@", "@", "@"],
    ["@", "-", "-", "-", "-", "-", "-", "@"],
    ["@", "-", "@", "-", "-", "-", "-", "@"],
    ["@", "-", "-", "-", "-", "-", "-", "@"],
    ["@", "-", "@", "-", "-", "-", "-", "@"],
    ["@", "-", "-", "-", "-", "-", "-", "@"],
    ["@", "-", "-", "-", "-", "-", "-", "@"],
    ["@", "@", "@", "@", "@", "@", "@", "@"],
  ];

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

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      rotation(-Math.PI / 50);
      draw();
      break;
    case "ArrowUp":
      walk(1, 4);
      draw();
      break;
    case "ArrowRight":
      rotation(Math.PI / 50);
      draw();
      break;
    case "ArrowDown":
      walk(-1, 4);
      draw();
      break;
  }
});
function walk(minPlus, strenght) {
  px += minPlus * pDx * strenght;
  py += minPlus * pDy * strenght;
}

function draw() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawFPS();

  mapDraw();
  ray();
  drawPlayer();

  //border();
}

/*function border() {
  ctx.lineWidth = 8;
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.rect(
    mapS * mapX + 8,
    ctx.canvas.height / 4 - 1,
    812,
    ctx.canvas.height / 2 + 2
  );
  ctx.stroke();
}*/

function drawPlayer() {
  ctx.fillStyle = "black";
  ctx.fillRect(px - 7, py - 7, 13, 13);
  ctx.fillStyle = "yellow";
  ctx.fillRect(px - 6, py - 6, 11, 11);
}

function drawFPS() {
  ctx.fillStyle = "red";
  ctx.font = "17px Arial";
  ctx.fillText("FPS: " + fps, ctx.canvas.width - 70, 25);
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
  pa = angleMax(pa);
  pDy = Math.sin(pa);
  pDx = Math.cos(pa);
}

function angleMax(radian) {
  if (radian >= 2 * Math.PI) {
    radian -= 2 * Math.PI;
  } else if (radian <= 0) {
    radian += 2 * Math.PI;
  }
  return radian;
}

let rayY;
let rayX;
let oY;
let oX;

let mrX;
let mrY;

let yRayY;
let yRayX;

let xRayY;
let xRayX;

let ra;

let finalDistance;
let r;
let thick = 1;

function ray() {
  ra = pa - dgr * 65;
  ra = angleMax(ra);

  for (r = 0; r < ctx.canvas.width; r += thick) {
    let dof = 0;
    let diffY = py % mapS;
    let directionY;
    //Combine y and x ray checker togheter
    if (ra > Math.PI) {
      rayY = py - diffY;
      rayX = (rayY - py) / Math.tan(ra) + px;
      oY = -mapS;
      oX = (mapS * px) / (rayY - py) - (mapS * rayX) / (rayY - py);
      directionY = -1;
    
    } else if (ra < Math.PI) {
      rayY = py + (mapS - diffY);
      rayX = (rayY - py) / Math.tan(ra) + px;
      oY = mapS;
      oX = (mapS * rayX) / (rayY - py) - (mapS * px) / (rayY - py);
      directionY = 0;
      
    } else if (ra == 0 || ra == Math.PI) {
      rayX = px;
      rayY = py;
      dof = 8;
      directionY = 0;
    }
    mrX = Math.floor(rayX / mapS);
    mrY = Math.floor(rayY / mapS) + directionY;

    wallDetect(dof, 0, directionY);

    yRayY = rayY;
    yRayX = rayX;

    //----------------------------------------------
    dof = 0;

    let directionX = 0;
    let diffX = px % mapS;

    if (0.5 * Math.PI < ra && ra < 1.5 * Math.PI) {
      rayX = px - diffX;
      rayY = Math.tan(ra) * (rayX - px) + py;
      oX = -mapS;
      oY = (mapS * rayY) / (px - rayX) - (mapS * py) / (px - rayX);
      directionX = -1;
     
    } else if (0.5 * Math.PI < ra || ra < 1.5 * Math.PI) {
      rayX = px + (mapS - diffX);
      rayY = Math.tan(ra) * (rayX - px) + py;
      oX = mapS;
      oY = (mapS * rayY) / (rayX - px) - (mapS * py) / (rayX - px);
     
    } else if (ra == 0.5 * Math.PI || ra == 1.5 * Math.PI) {
      rayX = px;
      rayY = py;
      dof = 8;
      directionX = 0;
    }
    mrX = Math.floor(rayX / mapS) + directionX;
    mrY = Math.floor(rayY / mapS);

    wallDetect(dof, directionX, 0);

    xRayY = rayY;
    xRayX = rayX;

    longestRay();
    ra += dgr / (ctx.canvas.width / 130);
    ra = angleMax(ra);
  }
}
function wallDetect(dof, dX, dY) {
  while (dof < 8) {
    if (
      0 <= mrX &&
      0 <= mrY &&
      mrX < mapX &&
      mrY < mapY &&
      map[mrY][mrX] == "@"
    ) {
      dof = 8;
      mrX = Math.floor(rayX / mapS) + dX;
      mrY = Math.floor(rayY / mapS) + dY;
      map[mrY][mrX];
    } else {
      dof++;
      rayY += oY;
      rayX += oX;

      mrX = Math.floor(rayX / mapS) + dX;
      mrY = Math.floor(rayY / mapS) + dY;
    }
  }
}

function longestRay() {
  let yLenght = Math.sqrt(
    (yRayY - py) * (yRayY - py) + (yRayX - px) * (yRayX - px)
  );

  let xLenght = Math.sqrt(
    (xRayY - py) * (xRayY - py) + (xRayX - px) * (xRayX - px)
  );

  if (yLenght >= xLenght) {
    finalDistance = xLenght;

    ctx.strokeStyle = "blue";
    ctx.fillStyle = "#077E2B";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(xRayX, xRayY);
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (yLenght < xLenght) {
    finalDistance = yLenght;

    ctx.strokeStyle = "red";
    ctx.fillStyle = "#12DD3A";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(yRayX, yRayY);
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  finalDistance *= Math.cos(pa - ra);
  drawColumn(finalDistance);
}

//let projectionPlane = (ctx.canvas.width/2/Math.tan(90))

function drawColumn(finDistance) {
  
  let columnHeight = (mapS * ctx.canvas.width) / 2 / finDistance;
  if (columnHeight > ctx.canvas.height) {
    columnHeight = ctx.canvas.height;
  }
  if (columnHeight < 1) {
    columnHeight = 1;
  }
  //let width = 1;
  let columnO = 0.5 * (ctx.canvas.height - columnHeight);

  //ctx.strokeStyle = "lime";
  /*ctx.beginPath();
  ctx.moveTo(r * width, columnO);
  ctx.lineTo(r * width, columnHeight + columnO);
  ctx.lineWidth = width;
  ctx.stroke();
*/
  ctx.fillRect(r, columnO, 1, columnHeight);
}
//antialiasing
function colorX(x) {
  return x;
}
function colorY(y) {
  return y;
}
