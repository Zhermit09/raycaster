//@ts-check
"use strict";

let c = document.getElementById("myCanvas");
// @ts-ignore
let ctx = c.getContext("2d");

let wall1 = document.createElement("img");
wall1.src = "./images/Wall.jpg";

let wall2 = document.createElement("img");
wall2.src = "./images/Cool.jpg";

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

let canvasHalfWidth = ctx.canvas.width / 2;
let canvasHalfHeight = ctx.canvas.height / 2;

//ctx.imageSmoothingEnabled = true;

const times = [];
let fps;

let px = 100;
let py = 100;
let pa = 1.5 * Math.PI;
let pDx = 0;
let pDy = 0;
let toRad = Math.PI / 180;

let angleArray = new Array(ctx.canvas.width);

let mapX = 16,
  mapY = 16,
  mapS = 16,
  map = [
    ["@", "#", "@", "#", "@", "#", "@", "#", "@", "#", "@", "#", "@", "#", "@", "@",],
    ["@", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "#",],
    ["#", "-", "@", "-", "@", "#", "@", "-", "-", "@", "#", "@", "#", "@", "-", "@",],
    ["@", "-", "#", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "#", "-", "#",],
    ["#", "-", "@", "-", "#", "-", "-", "-", "-", "-", "-", "@", "-", "@", "-", "@",],
    ["@", "-", "-", "-", "@", "-", "-", "-", "-", "-", "-", "#", "-", "#", "-", "#",],
    ["#", "-", "#", "-", "#", "-", "-", "-", "-", "-", "-", "@", "-", "-", "-", "@",],
    ["@", "-", "@", "-", "-", "-", "-", "@", "#", "-", "-", "#", "-", "@", "-", "#",],
    ["#", "-", "#", "-", "@", "-", "-", "-", "-", "-", "-", "-", "-", "#", "-", "@",],
    ["@", "-", "-", "-", "#", "-", "-", "-", "-", "-", "-", "@", "-", "@", "-", "#",],
    ["#", "-", "#", "-", "@", "-", "-", "#", "@", "-", "-", "#", "-", "-", "-", "@",],
    ["@", "-", "@", "-", "#", "-", "@", "#", "@", "#", "-", "@", "-", "#", "-", "#",],
    ["#", "-", "#", "-", "-", "-", "-", "@", "#", "-", "-", "-", "-", "@", "-", "@",],
    ["@", "-", "@", "#", "@", "-", "-", "-", "-", "-", "-", "#", "@", "#", "-", "#",],
    ["#", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "@",],
    ["@", "@", "#", "@", "#", "@", "#", "@", "#", "@", "#", "@", "#", "@", "#", "@",],
  ];

let t1 = 0;
let deltaTime;


function preLoad() {
  getRayAngle();
  animate();
}

function fPS() {
  let t0 = performance.now();
  deltaTime = (t0 - t1);
  t1 = t0;
  fps = Math.round(1000 / deltaTime);

}

function animate() {
  controls();
  draw();
  fPS();
  window.requestAnimationFrame(animate);
}

let down = 0;
let up = 0;
let left = 0;
let right = 0;

function controls() {
  if (left == 1) {
    rotation((-Math.PI / 100) * (deltaTime / 15));
  }
  if (up == 1) {
    walk(1, (mapS / 16) * (deltaTime / 30));
  }
  if (right == 1) {
    rotation((Math.PI / 100) * (deltaTime / 15));
  }
  if (down == 1) {
    walk(-1, (mapS / 16) * (deltaTime / 30));
  }
}

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      left = 1;
      break;
    case "ArrowUp":
      up = 1;
      break;
    case "ArrowRight":
      right = 1;
      break;
    case "ArrowDown":
      down = 1;
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      left = 0;
      break;
    case "ArrowUp":
      up = 0;
      break;
    case "ArrowRight":
      right = 0;
      break;
    case "ArrowDown":
      down = 0;
      break;
  }
});

function walk(minPlus, strenght) {
  px += minPlus * pDx * strenght;
  py += minPlus * pDy * strenght;

  if (map[Math.floor(py / mapS)][Math.floor(px / mapS)] != "-") {
    px -= minPlus * pDx * strenght;
    py -= minPlus * pDy * strenght;
  }
}

function draw() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // mapDraw();
  raycaster();
  drawFPS();
  // drawPlayer();
}

function drawPlayer() {
  ctx.fillStyle = "black";
  ctx.fillRect(px - 7, py - 7, 13, 13);
  ctx.fillStyle = "yellow";
  ctx.fillRect(px - 6, py - 6, 11, 11);
}

let timeDraw = 0;
let fpsDraw = 0;

function drawFPS() {
  if (performance.now() - timeDraw > 100) {
    timeDraw = performance.now();
    fpsDraw = fps;
  }

  ctx.font = "15px Arial";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.lineJoin = "miter";
  ctx.miterLimit = 2;
  ctx.strokeText("FPS: " + fpsDraw, ctx.canvas.width - 70, 25);
  ctx.fillStyle = "lime";
  ctx.fillText("FPS: " + fpsDraw, ctx.canvas.width - 70, 25);
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

function getRayAngle() {
  let angle;
  let i;
  const Fov = 90;
  const FovHalfRad = (Fov * toRad) / 2;

  for (i = 0; i < ctx.canvas.width; i += 1) {
    const x = i - canvasHalfWidth;
    if (0 != x) {
      angle = Math.atan((x / canvasHalfWidth) * Math.tan(FovHalfRad));
    }
    else { angle = 0; }
    angleArray[i] = angle;

  }
}

let directionY;
let directionX;
function raycaster() {

  for (r = 0; r < ctx.canvas.width; r += 1) {
    let dofY = 0;
    let diffY = py % mapS;
    directionY = 0;

    ra = pa + angleArray[r];
    ra = angleMax(ra);

    let tanRa = Math.tan(ra);

    //Combine y and x ray checker togheter
    if (ra > Math.PI) {
      rayY = py - diffY;
      rayX = (-diffY) / tanRa + px;
      oY = -mapS;
      oX = (mapS * (px - rayX)) / -diffY;
      directionY = -1;
    } else if (ra < Math.PI) {
      rayY = py + (mapS - diffY);
      rayX = (rayY - py) / tanRa + px;
      oY = mapS;
      oX = (mapS * (rayX - px)) / (rayY - py);
      directionY = 0;
    } else if (ra == 0 || ra == Math.PI) {
      rayX = px;
      rayY = py;
      dofY = 16;
      directionY = 0;
    }
    mrX = Math.floor(rayX / mapS);
    mrY = Math.floor(rayY / mapS) + directionY;

    dofY = wallDetect(dofY, 0, directionY);

    yRayY = rayY;
    yRayX = rayX;

    //----------------------------------------------

    let dofX = 0;
    directionX = 0;

    let diffX = px % mapS;

    if (0.5 * Math.PI < ra && ra < 1.5 * Math.PI) {
      rayX = px - diffX;
      rayY = tanRa * (-diffX) + py;
      oX = -mapS;
      oY = (mapS * (rayY - py)) / diffX;
      directionX = -1;
    } else if (0.5 * Math.PI < ra || ra < 1.5 * Math.PI) {
      rayX = px + (mapS - diffX);
      rayY = tanRa * (rayX - px) + py;
      oX = mapS;
      oY = (mapS * (rayY - py)) / (rayX - px);
      directionX = 0;
    } else if (ra == 0.5 * Math.PI || ra == 1.5 * Math.PI) {
      rayX = px;
      rayY = py;
      dofX = 16;
      directionX = 0;
    }
    mrX = Math.floor(rayX / mapS) + directionX;
    mrY = Math.floor(rayY / mapS);

    dofX = wallDetect(dofX, directionX, 0);

    xRayY = rayY;
    xRayX = rayX;

    if (dofX == 1 || dofY == 1) {
      longestRay();
    }
  }
}
function wallDetect(dofW, dX, dY) {
  while (dofW < 16) {
    if (0 <= mrX && 0 <= mrY && mrX < mapX && mrY < mapY && map[mrY][mrX] != "-") {
      mrX = Math.floor(rayX / mapS) + dX;
      mrY = Math.floor(rayY / mapS) + dY;
      map[mrY][mrX];
      dofW = 1;
      break;
    } else {
      dofW++;
      rayY += oY;
      rayX += oX;

      mrX = Math.floor(rayX / mapS) + dX;
      mrY = Math.floor(rayY / mapS) + dY;
    }
  }
  return dofW;
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
  }
  else if (yLenght < xLenght) {
    finalDistance = yLenght;

    yHit = true;
    xHit = false;
  }
  finalDistance *= Math.cos(pa - ra);
  drawColumn(finalDistance);
}

let imgO;
let texture;

function drawColumn(finDistance) {
  let columnHeight = (mapS * ctx.canvas.height) / finDistance;
  if (columnHeight < 0) {
    columnHeight = 0;
  }
  //let width = 1;
  let columnO = 0.5 * (ctx.canvas.height - columnHeight);
  let x;
  texture = wall2;


  //junk
  if (xHit) {
    mrX = Math.floor(xRayX / mapS) + directionX;
    mrY = Math.floor(xRayY / mapS);
    setTexture();

    if (xRayY > 0) {
      imgO = (xRayY % mapS);
    }
    if (directionX == 0) {
      x = (texture.height - 1) - Math.floor((imgO * (texture.height) / mapS));
    }
    else if (directionX == -1) {
      x = Math.floor((imgO * (texture.height) / mapS));
    }
    ctx.globalAlpha = Math.min(0.8, (0.8 * columnHeight * 3) / ctx.canvas.height);

  } else if (yHit) {
    mrX = Math.floor(yRayX / mapS);
    mrY = Math.floor(yRayY / mapS) + directionY;
    setTexture();

    if (yRayX > 0) {
      imgO = (yRayX % mapS);
      if (directionY == -1) {
        x = (texture.height - 1) - Math.floor((imgO * (texture.height) / mapS));
      }
      else if (directionY == 0) {
        x = Math.floor((imgO * (texture.height) / mapS));
      }
    }
    ctx.globalAlpha = Math.min(1, (columnHeight * 3) / ctx.canvas.height);
  }



  ctx.drawImage(texture,
    x, 0, 1, texture.height,
    r, columnO, 1, columnHeight);
  ctx.globalAlpha = 1;


}

function setTexture() {
  switch (map[mrY][mrX]) {
    case "@":
      texture = wall1;
      break;
    case "#":
      texture = wall2;
      break;
  }
}


