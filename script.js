//@ts-check

let c = document.getElementById("myCanvas");
let ctx = c.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

const times = [];
let fps;

let px = 100;
let py = 100;
let pa = 1.5* Math.PI;
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
  console.log(" hitX = " + rayX + " hitY = " + rayY);
  draw();
}

document.addEventListener("keydown", function (event) {
  if (event.keyCode == 37) {
    rotation(-Math.PI / 100);
    draw();
  } else if (event.keyCode == 38) {
    px += pDx;
    py += pDy;
    draw();
  } else if (event.keyCode == 39) {
    rotation(Math.PI / 100);
    draw();
  } else if (event.keyCode == 40) {
    px -= pDx;
    py -= pDy;
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

  // console.log(Math.PI);
}

let mapX = 8,
  mapY = 8,
  mapS = 64;
let map = [
  ["@", "@", "@", "@", "@", "@", "@", "@"],
  ["@", "-", "@", "-", "-", "-", "-", "@"],
  ["@", "-", "@", "-", "-", "-", "-", "@"],
  ["@", "-", "-", "-", "@", "@", "-", "@"],
  ["@", "-", "-", "-", "-", "@", "-", "@"],
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

  console.log(pa);
}

let ra = pa;
let diffY;
let rayY;
let rayX;
let oY;
let oX;
let mrX = Math.floor(rayX / mapS);
let mrY = rayY / mapS - 1;
let dof;

function ray() {
  diffY = py % mapS;
  dof = 0;
  

  if (pa > Math.PI) {
    rayY = py - diffY;
    rayX = (-1 / Math.tan(pa)) * (py - rayY) + px;
    oY = -mapS;
  } else if (pa < Math.PI) {
    rayY = py + (mapS - diffY);
    rayX = (1 / Math.tan(pa)) * (rayY - py) + px;
    oY = mapS;
  } else if (pa == 0 || pa == Math.PI) {
    rayX = px;
    rayY = py;
    dof = 8;
  }

  if (0.5 * Math.PI < pa && 1.5 * Math.PI) {
    oX = -mapS;
  } else {
    oX = mapS;
  }

  //console.log("Map x = " + rayX + " Map y = " + rayY);

  //console.log("pdx = " + pDx + " pdy = " + pDy);

  console.log(
    "Map x = " +
      mrX +
      " \nMap y = " +
      mrY +
      "\nWall yes/no: " +
      map[mrY][mrX] +
      "\n pa =" +
      pa
  );

  console.log("Tile bef: " + map[mrY][mrX]);
  for (let i = dof; i < 8; i++) {
    console.log("Tile in: " + map[mrY][mrX]);
    if (map[mrY][mrX] == "-") {
      rayX += 0;
      rayY += -64;
      mrX = Math.floor(rayX / mapS);
      mrY = rayY / mapS - 1;
      i++;
      console.log("Im here");
    } else {
      console.log("Tile af: " + map[mrY][mrX]);
      i = 8;

      console.log("ray stopped");
      //  mrX = Math.floor(rayX / mapS);
      // mrY = rayY / mapS - 1;
      map[mrY][mrX];
    }
  }
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(rayX, rayY);
  ctx.stroke();

  // console.log("Ray x: " + rayX, "Ray y: " + rayY);
}
