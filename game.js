window.onload = init;

var START_HEALTH = 100;

var map;

var ctxMap;
var ctxPl;
var ctxEnemy;
var ctxHealth;
var ctxScore;

var gameWidth = 800;
var gameHeight = 500;

var background = new Image();
background.src = "img/bg.jpg";

var background1 = new Image();
background1.src = "img/bg1.jpg";

var tiles = new Image();
tiles.src = "img/tiles.png";

var enemyPic = new Image();
enemyPic.src = "img/enemy.png";

var player;
var enemies = [];

var isPlaying;

var mapX = 0;
var map1X = gameWidth;

var spawnInterval;
var spawnTime = 6000;
var spawnAmount = 5;

var mouseMoving = false;
var mouseClicking = false;

var requestAnimFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame;


function init() {
    map = document.getElementById("map");
    ctxMap = map.getContext("2d");

    var pl = document.getElementById("player");
    ctxPl = pl.getContext("2d");

    var enemyCvs = document.getElementById("enemy");
    ctxEnemy = enemyCvs.getContext("2d");

    var health = document.getElementById("health");
    ctxHealth = health.getContext("2d");

    var score = document.getElementById("score");
    ctxScore = health.getContext("2d");

    map.width = gameWidth;
    map.height = gameHeight;
    pl.width = gameWidth;
    pl.height = gameHeight;
    enemyCvs.width = gameWidth;
    enemyCvs.height = gameHeight;
    health.width = gameWidth;
    health.height = gameHeight;
    score.width = gameWidth;
    score.height = gameHeight;

    ctxHealth.fillStyle = "#FFFFFF";
    ctxHealth.font = "bold 15pt Arial";

    ctxScore.fillStyle = "#FFFFFF";
    ctxScore.font = "bold 15pt Arial";


    player = new Player();
    resetHealth();
    startLoop();

    document.addEventListener("keydown", checkKeyDown, false);
    document.addEventListener("keyup", checkKeyUp, false)
    document.addEventListener("mousemove", mouseMove, false)
    document.addEventListener("click", mouseClick, false)
}

function mouseMove(e) {
    if(mouseMoving) {
        player.drawX = e.pageX - map.offsetLeft - player.width / 2;
        player.drawY = e.pageY - map.offsetTop - player.height / 2;
    }
}

function mouseClick(e) {
    if(mouseClicking) {
        player.drawX = e.pageX - map.offsetLeft - player.width / 2;
        player.drawY = e.pageY - map.offsetTop - player.height / 2;
    }
    //document.getElementById("gameName").innerHTML = "lol";
}

function loop() {
    if (isPlaying) {
        draw();
        update();
        requestAnimFrame(loop);
        player.score += 1;
    }
}

function startLoop() {
    isPlaying = true;
    loop();
    startCreatingEnemies();
}

function stopLoop() {
    isPlaying = false;
}

function resetHealth() {
    player.health = START_HEALTH;
}

function update() {
    moveBg();
    drawBg();
    player.update();
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }
    updateStats();
}

function updateStats() {
    ctxHealth.clearRect(0, 0, gameWidth, gameHeight);
    ctxScore.clearRect(0, 0, gameWidth, gameHeight);
    ctxHealth.fillText("Health: " + player.health, 685, 20);
    ctxScore.fillText("Score: " + player.score, 0, 20);
}

function draw() {
    player.draw();
    clearCtxEnemy();
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].draw();
    }
}

function drawBg() {
    ctxMap.clearRect(0, 0, gameWidth, gameHeight);
    ctxMap.drawImage(background, 0, 0, background.width, background.height,
        mapX, 0, gameWidth, gameHeight);
    ctxMap.drawImage(background1, 0, 0, background.width, background.height,
        map1X, 0, gameWidth, gameHeight);
}

function moveBg() {
    var step = 4;
    mapX -= step;
    map1X -= step;
    if(mapX + gameWidth < 0)
        mapX = gameWidth - 10;
    if(map1X + gameWidth < 0)
        map1X = gameWidth - 10;
}

function Player() {
    this.srcX = 0;
    this.srcY = 0;
    this.drawX = 0;
    this.drawY = 0;
    this.width = tiles.width;
    this.height = tiles.height;
    this.isUp = false;
    this.isDown = false;
    this.isRight = false;
    this.isLeft = false;
    this.health = START_HEALTH;
    this.score = 0;

    this.speed = 5;
}

Player.prototype.draw = function () {
    clearCtxPlayer();
    ctxPl.drawImage(tiles, this.srcX, this.srcY, this.width, this.height,
        this.drawX, this.drawY, this.width, this.height);
};

Player.prototype.update = function () {
    if(this.health < 0) resetHealth();

    if (this.drawX < 0)
        this.drawX = 0;
    if (this.drawY < 0)
        this.drawY = 0;
    if (this.drawX > gameWidth - this.width - 100)
        this.drawX = gameWidth - this.width - 100;
    if (this.drawY > gameHeight - this.height)
        this.drawY = gameHeight - this.height;

    for (var i = 0; i < enemies.length; i++) {
        if(this.drawX >= enemies[i].drawX &&
            this.drawY >= enemies[i].drawY &&
            this.drawX <= enemies[i].drawX + enemies[i].width &&
            this.drawY <= enemies[i].drawY + enemies[i].height) {
            player.health--;
            this.checkHealth();
        }
    }

    this.chooseDir();
};

Player.prototype.checkHealth = function() {
    if(this.health == 0)
        isPlaying = false;
};

Player.prototype.chooseDir = function () {
    if (this.isUp) {
        this.drawY -= this.speed;
    }
    if (this.isDown) {
        this.drawY += this.speed;
    }
    if (this.isRight) {
        this.drawX += this.speed;
    }
    if (this.isLeft) {
        this.drawX -= this.speed;
    }
};

function Enemy() {
    this.srcX = 0;
    this.srcY = 0;
    this.drawX = Math.floor(Math.random() * gameWidth) + gameWidth;
    this.drawY = Math.floor(Math.random() * gameHeight);
    this.width = enemyPic.width;
    this.height = enemyPic.height;

    if(this.drawY > gameHeight - this.height)
        this.drawY = gameHeight / 2;

    this.speed = 8;
}

Enemy.prototype.draw = function () {
    ctxEnemy.drawImage(enemyPic, this.srcX, this.srcY, this.width, this.height,
        this.drawX, this.drawY, this.width, this.height);
};

Enemy.prototype.update = function () {
    this.drawX -= this.speed;
    if (this.drawX + this.width < 0) {
        this.destroy();
    }
};

Enemy.prototype.destroy = function () {
    enemies.splice(enemies.indexOf(this), 1)
};

function spawnEnemy(count) {
    for (var i = 0; i < count; i++) {
        enemies[i] = new Enemy();
    }
}

function startCreatingEnemies() {
    stopCreatingEnemies();
    spawnInterval = setInterval(function () {
        spawnEnemy(spawnAmount)
    }, spawnTime);
}

function stopCreatingEnemies() {
    clearInterval(spawnInterval);
}

function clearCtxPlayer() {
    ctxPl.clearRect(0, 0, gameWidth, gameHeight);
}

function clearCtxEnemy() {
    ctxEnemy.clearRect(0, 0, gameWidth, gameHeight);
}

function checkKeyDown(e) {
    var keyID = e.keyCode || e.which;
    var keyChar = String.fromCharCode(keyID);

    if (keyChar == "W") {
        player.isUp = true;
        e.preventDefault();
    }
    if (keyChar == "S") {
        player.isDown = true;
        e.preventDefault();
    }
    if (keyChar == "D") {
        player.isRight = true;
        e.preventDefault();
    }
    if (keyChar == "A") {
        player.isLeft = true;
        e.preventDefault();
    }
    if (keyChar == "B") {
        mouseClicking = false;
        mouseMoving = false;
        e.preventDefault();
    }
    if (keyChar == "M") {
        mouseMoving = true;
        e.preventDefault();
    }
    if (keyChar == "N") {
        mouseClicking = true;
        e.preventDefault();
    }
}

function checkKeyUp(e) {
    var keyID = e.keyCode || e.which;
    var keyChar = String.fromCharCode(keyID);

    if (keyChar == "W") {
        player.isUp = false;
        e.preventDefault();
    }
    if (keyChar == "S") {
        player.isDown = false;
        e.preventDefault();
    }
    if (keyChar == "D") {
        player.isRight = false;
        e.preventDefault();
    }
    if (keyChar == "A") {
        player.isLeft = false;
        e.preventDefault();
    }
}
