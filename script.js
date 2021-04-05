//@ts-check
"use strict";

let c = document.querySelector("#myCanvas");
let ctx = c.getContext("2d");
ctx.canvas.width = window.innerWidth / 1.3714;
ctx.canvas.height = window.innerWidth * 0.4109;
let fullScr = false;

let wall1 = document.createElement("img");
wall1.src = "./images/wall.jpg";
let wall2 = document.createElement("img");
wall2.src = "./images/cool.jpg";
let wall3 = document.createElement("img");
wall3.src = "./images/c.jpg";
let wall4 = document.createElement("img");
wall4.src = "./images/hive.png";
let wall5 = document.createElement("img");
wall5.src = "./images/water.jpg";
let wall6 = document.createElement("img");
wall6.src = "./images/keyboard.png";

let canvasHalfWidth = ctx.canvas.width / 2;

let fps;
let t1 = 0, deltaTime = 0;
let timeDraw = 0, fpsDraw = 0;

let px = 8170, py = 1100, pa = 0.5 * Math.PI;
let pDy = Math.sin(pa), pDx = Math.cos(pa);
let backwards = false, forward = false, left = false, right = false;


let toRad = Math.PI / 180;

let angleArray = new Array(ctx.canvas.width);

let mapX = 16, mapY = 16, mapS = 1024;
let map = [
    ["#", "#", "#", "#", "#", "#", "#", "#", "@", "@", "@", "@", "@", "@", "@", "@",],
    ["#", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "@",],
    ["#", "-", "#", "-", "#", "#", "#", "-", "-", "@", "@", "@", "@", "@", "-", "@",],
    ["#", "-", "#", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "@", "-", "@",],
    ["#", "-", "#", "-", "#", "-", "-", "-", "-", "-", "-", "@", "-", "@", "-", "@",],
    ["#", "-", "-", "-", "#", "-", "-", "-", "-", "-", "-", "@", "-", "@", "-", "@",],
    ["#", "-", "#", "-", "#", "-", "-", "-", "-", "-", "-", "@", "-", "-", "-", "@",],
    ["#", "-", "#", "-", "-", "-", "#", "-", "-", "@", "-", "@", "-", "@", "-", "@",],
    ["#", "-", "#", "-", "#", "-", "-", "-", "-", "-", "-", "-", "-", "@", "-", "@",],
    ["#", "-", "-", "-", "#", "-", "!", "-", "-", "%", "-", "@", "-", "@", "-", "@",],
    ["#", "-", "#", "-", "#", "-", "-", "-", "-", "-", "-", "@", "-", "-", "-", "@",],
    ["#", "-", "#", "-", "#", "-", "&", "-", "-", "/", "-", "@", "-", "@", "-", "@",],
    ["#", "-", "#", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "@", "-", "@",],
    ["#", "-", "#", "#", "#", "-", "-", "-", "-", "-", "-", "@", "@", "@", "-", "@",],
    ["#", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "@",],
    ["#", "#", "#", "#", "#", "#", "#", "#", "@", "@", "@", "@", "@", "@", "@", "@",],
];

let rayY, rayX, oY, oX;
let mrX, mrY;
let rayY2, rayX2;
let ra;
let finalDistance;
let r;
let directionY, directionX;
let xHit = false, yHit = false;
let imgO, texture = wall2;


function preLoad() {
    getRayAngle();
    animate();
}

function getRayAngle() {
    //Hittar och sparar vinklar för varje ray

    let angle;
    const Fov = 90;
    const FovHalfRad = (Fov * toRad) / 2;

    for (let i = 0; i < ctx.canvas.width; i += 1) {
        const x = i - canvasHalfWidth;
        if (0 !== x) {
            angle = Math.atan((x / canvasHalfWidth) * Math.tan(FovHalfRad));
        } else angle = 0;
        angleArray[i] = angle;
    }
}

function animate() {
    controls();
    draw();
    fPS();
    window.requestAnimationFrame(animate);
}

window.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowLeft":
            left = true;
            break;
        case "ArrowUp":
            forward = true;
            break;
        case "ArrowRight":
            right = true;
            break;
        case "ArrowDown":
            backwards = true;
            break;
        case "Escape":
            left = false;
            forward = false;
            right = false;
            backwards = false;
            windowScreen();
            break;
        case "f":
        case "F":
            left = false;
            forward = false;
            right = false;
            backwards = false;
            fullScreen();
            break;
    }
})

window.addEventListener('resize', setCanvasSize);

function setCanvasSize() {
    if (fullScr) {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;

    } else {
        ctx.canvas.width = window.innerWidth / 1.3714;
        ctx.canvas.height = window.innerWidth * 0.4109;
    }
    canvasHalfWidth = ctx.canvas.width / 2;
    getRayAngle();
}

function fullScreen() {
    fullScr = true;
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    c.style.margin = "0";
    c.style.border = "none";
    c.style.borderRadius = "0";
    c.style.position = "absolute";
    t1 = 0;
    setCanvasSize();
}

function windowScreen() {
    fullScr = false;
    ctx.canvas.width = window.innerWidth / 1.3714;
    ctx.canvas.height = window.innerWidth * 0.4109;
    c.style.margin = "4vh 0 1vh";
    c.style.border = "solid #B200DE 3px";
    c.style.borderRadius = "10px";
    c.style.position = "initial";
    t1 = 0;
    setCanvasSize();
}

window.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "ArrowLeft":
            left = false;
            break;
        case "ArrowUp":
            forward = false;
            break;
        case "ArrowRight":
            right = false;
            break;
        case "ArrowDown":
            backwards = false;
            break;
    }
})

function controls() {
    let rotStrength = (Math.PI / 100) * (deltaTime / 15);
    let walkStrength = (mapS / 16) * (deltaTime / 30);

    if (left) rotation(-1 * rotStrength);
    if (forward) walk(walkStrength);
    if (right) rotation(rotStrength);
    if (backwards) walk(-1 * walkStrength);
}

function rotation(rot) {
    pa += rot;
    pa = angleMax(pa);
    //Tar fram player direction x & y så att man kan gå åt det hållet man kollar
    pDy = Math.sin(pa);
    pDx = Math.cos(pa);
}

function walk(strength) {
    px += pDx * strength;
    py += pDy * strength;

    //Om det är en ruta man får inte vara i så stannar man
    if (map[Math.floor(py / mapS)][Math.floor(px / mapS)] !== "-") {
        px -= pDx * strength;
        py -= pDy * strength;
    }
}

function draw() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    rayCaster();
    drawFPS();
}

function fPS() {
    let t0 = performance.now();
    deltaTime = (t0 - t1);
    t1 = t0;
    fps = Math.round(1000 / deltaTime);
}

function drawFPS() {
    //Uppdaterar fps bara varje 100ms annars är talen galna
    if (performance.now() - timeDraw > 100) {
        timeDraw = performance.now();
        fpsDraw = fps;
    }
    //Ritar ut fps med en fyllning runt omkring
    ctx.font = "15px Arial";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.lineJoin = "miter";
    ctx.miterLimit = 2;
    ctx.strokeText("FPS: " + fpsDraw, ctx.canvas.width - 70, 25);
    ctx.fillStyle = "lime";
    ctx.fillText("FPS: " + fpsDraw, ctx.canvas.width - 70, 25);
}

function angleMax(radian) {
    //Adderar eller substraherar 2 PI för att göra det lättare att läsa
    if (radian >= 2 * Math.PI) radian -= 2 * Math.PI;
    else if (radian <= 0) radian += 2 * Math.PI;
    return radian;
}

function rayCaster() {
    /*Här börjar en mess med olika utträckningar >:(
    Kort sagt vad jag gör är att jag kastar ut 2 rays, ena kan träffa
    bara saker på x-axel medan andra bara på y-axel, sen kollar jag vilken
    som träffar tidigast och där blir väggen som jag ska rita ut*/


    //Kastar ut en ray för varje pixel på x-axel i min canvas
    for (r = 0; r < ctx.canvas.width; r += 1) {
        //Dof är depth of field (en limit på  hur många check man får göra)
        let dofY = 0;
        let diffY = py % mapS;

        //Direction visar om man kollar höger, vänster, upp eller ner
        directionY = 0;

        //Ra är ray angle, pa är player angle
        ra = pa + angleArray[r];
        ra = angleMax(ra);

        let tanRa = Math.tan(ra);

        /*Här under räknar jag ut x & y kordinater där ray träffar en väg i rutan man befinner sig i,
        samt x & y offset som behövs för att kolla efter väggar utanför rutan,
         det görs både för x & y ray (aka 2 gånger)*/

        //Om man kollar ner
        if (ra > Math.PI) {
            rayY = py - diffY;
            rayX = (-diffY) / tanRa + px;
            oY = -mapS;
            oX = (mapS * (px - rayX)) / -diffY;
            directionY = -1;
        }//Om man kollar upp
        else if (ra < Math.PI) {
            rayY = py + (mapS - diffY);
            rayX = (rayY - py) / tanRa + px;
            oY = mapS;
            oX = (mapS * (rayX - px)) / (rayY - py);
            directionY = 0;
        }// Default
        else if (ra === 0 || ra === Math.PI) {
            rayX = px;
            rayY = py;
            dofY = 16;
            directionY = 0;
        }
        //Translerar kordinater av ray till kordinater som kan sättas in i map arrayen
        mrX = Math.floor(rayX / mapS);
        mrY = Math.floor(rayY / mapS) + directionY;

        dofY = wallDetect(dofY, 0, directionY);

        rayY2 = rayY;
        rayX2 = rayX;

        //----------------------------------------------
        //Samma sak som tidigare men med andra värde
        let dofX = 0;
        directionX = 0;

        let diffX = px % mapS;
        //Om man kollar vänster
        if (0.5 * Math.PI < ra && ra < 1.5 * Math.PI) {
            rayX = px - diffX;
            rayY = tanRa * (-diffX) + py;
            oX = -mapS;
            oY = (mapS * (rayY - py)) / diffX;
            directionX = -1;
        } //Om man kollar höger
        else if (0.5 * Math.PI < ra || ra < 1.5 * Math.PI) {
            rayX = px + (mapS - diffX);
            rayY = tanRa * (rayX - px) + py;
            oX = mapS;
            oY = (mapS * (rayY - py)) / (rayX - px);
            directionX = 0;
        }// Default
        else if (ra === 0.5 * Math.PI || ra === 1.5 * Math.PI) {
            rayX = px;
            rayY = py;
            dofX = 16;
            directionX = 0;
        }
        mrX = Math.floor(rayX / mapS) + directionX;
        mrY = Math.floor(rayY / mapS);

        dofX = wallDetect(dofX, directionX, 0);

        //Går till nästa steg bara om det finns en vägg under limiten
        if (dofX === 1 || dofY === 1) {
            shortestRay();
        }
    }
}

function wallDetect(dofW, dX, dY) {
    //Det här methoden forsätter att lägga till offset och checka efter en vägg
    //till den träffar en vägg eller når limit
    while (dofW < 16) {
        if (0 <= mrX && 0 <= mrY && mrX < mapX && mrY < mapY && map[mrY][mrX] !== "-") {
            mrX = Math.floor(rayX / mapS) + dX;
            mrY = Math.floor(rayY / mapS) + dY;
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


function shortestRay() {
    //Pitagoras sats för att räkna ut den kortsate rayen
    let yLength = Math.sqrt(
        (rayY2 - py) * (rayY2 - py) + (rayX2 - px) * (rayX2 - px)
    );
    let xLength = Math.sqrt(
        (rayY - py) * (rayY - py) + (rayX - px) * (rayX - px)
    );
    if (yLength >= xLength) {
        finalDistance = xLength;
        xHit = true;
        yHit = false;
    } else if (yLength < xLength) {
        finalDistance = yLength;
        yHit = true;
        xHit = false;
    }
    //Sak för att inte få fish eye
    finalDistance *= Math.cos(pa - ra);
    drawColumn(finalDistance);
}

function setTexture() {
    //Väljer textur basserat på vilken symbol som finns i map arrayen
    switch (map[mrY][mrX]) {
        case "@":
            texture = wall1;
            break;
        case "#":
            texture = wall2;
            break;
        case "!":
            texture = wall3;
            break;
        case "%":
            texture = wall4;
            break;
        case "/":
            texture = wall5;
            break;
        case "&":
            texture = wall6;
            break;
    }
}

function drawColumn(finDistance) {
    //Räknar ut hur hög ska min column vara
    let columnHeight = (mapS * ctx.canvas.height) / finDistance;
    if (columnHeight < 0) columnHeight = 0;
    //Räknar ut start positionen
    let columnO = 0.5 * (ctx.canvas.height - columnHeight);
    let x;

    //Här är en till magisk mess som flippar på texturer beroende på vart man kollar
    if (xHit) {
        //Tar fram igen vädre där ray träffar väggen
        mrX = Math.floor(rayX / mapS) + directionX;
        mrY = Math.floor(rayY / mapS);
        setTexture();

        //Translerar kordinater från skärmen till kordinater på texturen (så att man kan klippa ut rätt bit av texturen)
        imgO = (rayY % mapS);

        //Flippar på x om texturen behövs speglas
        if (directionX === 0) x = (texture.height - 1) - Math.floor((imgO * (texture.height) / mapS));
        else if (directionX === -1) x = Math.floor((imgO * (texture.height) / mapS));

        //Aplpha blandar texturen med backgrunden och får det sakta att försvinna desto länge bort man är
        //X-axel har från början en lägre alpha för att göra x-axel lite mörkare
        ctx.globalAlpha = Math.min(0.8, (0.8 * columnHeight * 2) / ctx.canvas.height);
    }
    //----------------------------------------------
    else if (yHit) {
        //Samma sak som tidigare fast med andra tal
        mrX = Math.floor(rayX2 / mapS);
        mrY = Math.floor(rayY2 / mapS) + directionY;
        setTexture();

        imgO = (rayX2 % mapS);

        if (directionY === -1) x = (texture.height - 1) - Math.floor((imgO * (texture.height) / mapS));
        else if (directionY === 0) x = Math.floor((imgO * (texture.height) / mapS));
        //Ljusare alpha för y-axel
        ctx.globalAlpha = Math.min(1, (columnHeight * 2) / ctx.canvas.height);
    }
    //Finish line, allt mess var bara för den den här funktionen, nu bara 1919 gånger kvar ;)
    //Klipper ut en column ur texturen och ritar ut den på skärmen, så görs för varje pixel på canvasen
    ctx.drawImage(texture,
        x, 0, 1, texture.height,
        r, columnO, 1, columnHeight);
    ctx.globalAlpha = 1;
}




