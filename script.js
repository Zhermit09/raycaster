//@ts-check
"use strict";

let c = document.getElementById("myCanvas");
// @ts-ignore
let ctx = c.getContext("2d");

let texture1 = document.createElement("img");
texture1.src = "./images/wall.jpg";

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
ctx.beginPath();
ctx.moveTo(1, 500);
ctx.lineTo(500, 500);
ctx.lineWidth = 1;
//ctx.strokeStyle = "red";
ctx.stroke();

//ctx.imageSmoothingEnabled = true;

const times = [];
let fps;

let px = 319;
let py = 191;
let pa = 1.75 * Math.PI;
let pDx = 0;
let pDy = 0;
let dgr = Math.PI / 180;

let mapX = 8,
  mapY = 8,
  mapS = 512,
  map = [
    ["@", "@", "@", "@", "@", "@", "@", "@"],
    ["@", "-", "-", "-", "-", "-", "-", "@"],
    ["@", "-", "@", "-", "-", "-", "-", "@"],
    ["@", "-", "-", "-", "-", "-", "-", "@"],
    ["@", "-", "@", "-", "-", "@", "-", "@"],
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
  draw();
  window.requestAnimationFrame(animate);
}

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      rotation(-Math.PI / 100);

      break;
    case "ArrowUp":
      walk(1, mapS/16);

      break;
    case "ArrowRight":
      rotation(Math.PI / 100);

      break;
    case "ArrowDown":
      walk(-1, mapS/16);

      break;
  }
});
function walk(minPlus, strenght) {
  px += minPlus * pDx * strenght;
  py += minPlus * pDy * strenght;

  /*if (map[Math.floor(py / mapS)][Math.floor(px / mapS)] == "@") {
    px -= minPlus * pDx * strenght;
    py -= minPlus * pDy * strenght;
  }*/
}

function draw() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawFPS();

  //mapDraw();
  ray();

  // drawPlayer();

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

function getRayAngle(r) {
  let angle;
  if (r < ctx.canvas.width / 2) {
    try {
      angle = Math.atan(
        ((960 - r) / 960) * Math.tan((90 * dgr - 0.00000000000001) / 2)
      );
    } catch {
      angle = 0;
    }
    angle = angle * -1;
  } else if (r >= ctx.canvas.width / 2) {
    try {
      angle = Math.atan(
        ((r - ctx.canvas.width / 2) / (ctx.canvas.width / 2)) *
          Math.tan((90 * dgr - 0.00000000000001) / 2)
      );
    } catch {
      angle = 0;
    }
    //angle = Math.PI / 2 - angle;
  }
  return angle;
}

function ray() {
  // ra = pa - dgr * 65;
  // ra = angleMax(ra);

  for (r = 0; r <= ctx.canvas.width; r += thick) {
    let dof = 0;
    let diffY = py % mapS;
    let directionY;

    ra = pa + getRayAngle(r);
    ra = angleMax(ra);

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
    // ra += dgr / (ctx.canvas.width / 130);
    // ra = angleMax(ra);
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

let xHit = false;
let yHit = false;

function longestRay() {
  let yLenght = Math.sqrt(
    (yRayY - py) * (yRayY - py) + (yRayX - px) * (yRayX - px)
  );

  let xLenght = Math.sqrt(
    (xRayY - py) * (xRayY - py) + (xRayX - px) * (xRayX - px)
  );

  if (yLenght >= xLenght) {
    finalDistance = xLenght;

    xHit = true;
    yHit = false;

    /*  ctx.strokeStyle = "#077E2B";
    ctx.fillStyle = "#077E2B";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(xRayX, xRayY);
    ctx.lineWidth = 3;
    ctx.stroke();*/
  } else if (yLenght < xLenght) {
    finalDistance = yLenght;

    yHit = true;
    xHit = false;

    /*ctx.strokeStyle = "#12DD3A";
    ctx.fillStyle = "#12DD3A";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(yRayX, yRayY);
    ctx.lineWidth = 3;
    ctx.stroke();*/
  }
  finalDistance *= Math.cos(pa - ra);
  drawColumn(finalDistance);
}

//let projectionPlane = (ctx.canvas.width/2/Math.tan(90))

let imgO;

function drawColumn(finDistance) {
  let columnHeight = (mapS * ctx.canvas.height) / finDistance;
  //mapS*ctx.canvas.height / finDistance/(Math.tan((90*dgr - 0.00000000000001)/2)/Math.cos(45*dgr))
  /* if (columnHeight > ctx.canvas.height) {
    columnHeight = ctx.canvas.height;
  }*/
  if (columnHeight < 0) {
    columnHeight = 0;
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

  if (xHit) {
    imgO = xRayY % mapS;
  } else if (yHit) {
    imgO = yRayX % mapS;
  }
  ctx.drawImage(
    texture1,
    (imgO * 624) / mapS + 1,
    0,
    5,
    626,
    r,
    columnO,
    5,
    columnHeight
  );

  /*for (let i = 0; i < columnHeight; i++){
  ctx.fillStyle = getRandomColor();
  ctx.fillRect(r, columnO+i, 2, 2);
  }*/
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

//antialiasing
function colorX(x) {
  return x;
}
function colorY(y) {
  return y;
}
