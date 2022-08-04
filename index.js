const socket = io('http://localhost:3000', { transports : ['websocket'] });

// LISTEN EVENTS
socket.on('init', handleInit);
socket.on('gameState', handleGameState);

const BG_COLOUR = "#231f20";
const BULLET_COLOUR = "#c2c2c2";
const PLAYER_COLOUR = "#ff0000";
const COLLIDING_COLOUR = "#7CFC00";



const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const startGameButton = document.getElementById('startGameButton');

startGameButton.addEventListener('click', newGame);

function newGame() {
    selected =  document.querySelector('input[name="ship-selector"]:checked').value;

    socket.emit('newGame', selected);
    start();

}

let canvas, ctx;
let playerNumber;


function start() {
    // HIDE SELECTION MENU AND SHOW GAME
    initialScreen.style.display = 'none';
    gameScreen.style.display = 'block';


    // CANVAS DRAW
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 1500;
    canvas.height = 900;
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // ASSETS CREATE
    img_assets = {
        ship1 : new Image(),
        ship2 : new Image(),
        ship3 : new Image(),
    }
    // ASSETS LOAD
    img_assets.ship1.src = '../assets/img/ship1.png';
    img_assets.ship2.src = '../assets/img/ship2.png';
    img_assets.ship3.src = '../assets/img/ship3.png';

    // KEYBOARD LISTENER
    document.addEventListener('keydown', keyDown, false);
    document.addEventListener('keyup', keyUp, false);

}

function drawScreen(state) {
    // ctx.setTransform(1, 0, 0, 1, 0, 0);
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    

    ctx.fillStyle = BG_COLOUR;
    ctx.globalCompositeOperation = 'destination-under';
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    //DRAW PLAYERS
    // img_assets.ship1.onload = function() {
    //     drawPlayer(state.player, PLAYER_COLOUR);
    // }

    
    
}

function drawPlayer(players, color) {
    Object.keys(players).forEach(player => {
        playerState = players[player];
        size = playerState.size;
        ctx.fillStyle = color;
        ctx.save();
        
        //Draw players

        ctx.translate(playerState.pos.x + size.x/2 , playerState.pos.y + size.y/2);
        ctx.rotate(playerState.angle * Math.PI / 180);
        ctx.translate(-(playerState.pos.x + playerState.size.x/2) , -(playerState.pos.y + playerState.size.y/2));
        ctx.globalAlpha = playerState.life.indicator;
        ctx.drawImage(img_assets[playerState.shipStyle], playerState.pos.x, playerState.pos.y, size.x, size.y,);
        
        // ctx.fillRect(playerState.pos.x+size/2, playerState.pos.y+size/2, 15, 2); //CENTER OF OBJECT
        ctx.restore();
    });
}


function drawBullets(bullets, color) {

    bullets.forEach(bullet => {
        ctx.fillStyle = color;
        ctx.save();
        ctx.translate(bullet.pos.x + bullet.size.x/2 , bullet.pos.y + bullet.size.y/2);
        ctx.rotate(bullet.angle * Math.PI / 180);
        ctx.translate(-(bullet.pos.x + bullet.size.x/2) , -(bullet.pos.y + bullet.size.y/2));

        ctx.fillRect(bullet.pos.x, bullet.pos.y, bullet.size.x, bullet.size.y);

        ctx.restore();
    }
    );
}

function keyDown(command){
    console.log(` > [keyDown]<Client> Tecla Pressionada: ${command.key} Código: ${command.keyCode}`);
    socket.emit('keyDown', {key : command.key, keyCode: command.keyCode});


    
}

function keyUp(command){
    console.log(` > [keyUp] Tecla Levantada: ${command.key}`);
    socket.emit('keyUp', {key : command.key, keyCode: command.keyCode});
}

function handleInit(number) {
    console.log(` > [handleInit] Entrou na sala: ${number}`);
    playerNumber = number;

}

function handleGameState(gameState) {
    gameState = JSON.parse(gameState);

    requestAnimationFrame(() => drawScreen(gameState)); 
    requestAnimationFrame(() => drawBullets(gameState.bullets, BULLET_COLOUR));
    requestAnimationFrame(() => drawPlayer(gameState.players, PLAYER_COLOUR));


    // requestAnimationFrame(() => drawPlayersCollision(gameState.players));
    
}

