const socket = io('http://localhost:3000', { transports : ['websocket'] });

// LISTEN EVENTS
socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('forbiddenName', handleForbiddenName);



const BG_COLOUR = "#231f20";
const BULLET_COLOUR = "#c2c2c2";
const PLAYER_COLOUR = "#ff0000";
const COLLIDING_COLOUR = "#7CFC00";
const LIFEBARDIMENSION = 100;
const LIFEBARCORNERRADIUS = 30;


const nickname = document.getElementById('nickname');
const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const startGameButton = document.getElementById('startGameButton');

startGameButton.addEventListener('click', newGame);

let canvas, ctx, hudCanvas, hudCtx;
let playerId;
let roomId;
let playerName;



function newGame() {
    playerName = nickname.value;

    if (playerName.length > 0 && playerName.length < 16) {
        selected =  document.querySelector('input[name="ship-selector"]:checked').value;

        socket.emit('newGame', {selected : selected, playerName : playerName});
        
    } else{
        playerName.length == 0 ? alert('Preencha o campo de Nickname') : alert('O Nickname deve ter no máximo 16 caracteres');
    }

}




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
    // GAME CANVAS
    ctx.fillStyle = BG_COLOUR;
    ctx.globalCompositeOperation = 'destination-under';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

}

function drawPlayer(players, color) {
    Object.keys(players).forEach(player => {
        playerState = players[player];

        // Only for client local player
        // if (playerState.playerId === playerId) {
        //     ctx.fillStyle = "#ffffff";
        //     ctx.textAlign = "center";
        //     ctx.fillText(`${playerName}`, (playerState.pos.x + playerState.size.x/2) , playerState.pos.y - 20);
        // }

        //Draw players name
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(`${playerState.playerName}`, (playerState.pos.x + playerState.size.x/2) , playerState.pos.y - 20);

        size = playerState.size;
        ctx.fillStyle = color;

        ctx.save();
        //Draw player img
        ctx.translate(playerState.pos.x + size.x/2 , playerState.pos.y + size.y/2);
        ctx.rotate(playerState.angle * Math.PI / 180);
        ctx.translate(-(playerState.pos.x + playerState.size.x/2) , -(playerState.pos.y + playerState.size.y/2));
        

        ctx.globalAlpha = playerState.life.indicator;
        ctx.drawImage(img_assets[playerState.shipStyle], playerState.pos.x, playerState.pos.y, size.x, size.y,);

        

        ctx.restore();
        
        // ctx.fillRect(playerState.pos.x+size/2, playerState.pos.y+size/2, 15, 2); //CENTER OF OBJECT
        
    });
}


function drawBullets(bullets, color) {

    bullets.forEach(bullet => {
        ctx.fillStyle = color;
        ctx.save();
        ctx.translate(bullet.pos.x + bullet.size.x/2 , bullet.pos.y + bullet.size.y/2);
        ctx.rotate(bullet.angle * Math.PI / 180);
        ctx.translate(-(bullet.pos.x + bullet.size.x/2) , -(bullet.pos.y + bullet.size.y/2));
        ctx.globalAlpha = bullet.opacity;
        ctx.fillRect(bullet.pos.x, bullet.pos.y, bullet.size.x, bullet.size.y);

        ctx.restore();
    }
    );
}

function drawLifeBar(players){
    Object.keys(players).forEach(player => {
        playerState = players[player];
        let length = playerState.life.indicator*100;
        let innerLength = length - LIFEBARCORNERRADIUS *2;
        if (innerLenght < 0) innerLength = 0;


        let atualCornerRadius = LIFEBARCORNERRADIUS;
        if (length < LIFEBARCORNERRADIUS *2) 
        {
            actualCornerRadius = length/2;
        }

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineWidth = actualCornerRadius;
        ctx.strokeStyle = '#ff0000';

        const leftX = playerState.pos.x + actualCornerRadius/2;
        const rightX = leftX + innerLength;

        ctx.beginPath();
        ctx.moveTo(leftX, playerState.pos.y + 20);
        ctx.lineTo(rightX, playerState.pos.y);
        ctx.stroke();
        
        ctx.restore();
    });
}

function keyDown(command){
    // console.log(` > [keyDown]<Client> Tecla Pressionada: ${command.key} Código: ${command.keyCode}`);
    socket.emit('keyDown', {key : command.key, keyCode: command.keyCode});
}

function keyUp(command){
    // console.log(` > [keyUp] Tecla Levantada: ${command.key}`);
    socket.emit('keyUp', {key : command.key, keyCode: command.keyCode});
}

function handleInit(args) {
    start();
    console.log(` > [handleInit] Entrou na sala: ${args.roomId} com o id: ${args.playerId}`);
    playerId = args.playerId;
    roomId = args.roomId;

}

function handleForbiddenName(){
    alert('Nome inválido');
}

function handleGameState(gameState) {
    gameState = JSON.parse(gameState);

    requestAnimationFrame(() => drawScreen(gameState)); 
    requestAnimationFrame(() => drawBullets(gameState.bullets, BULLET_COLOUR));
    requestAnimationFrame(() => drawPlayer(gameState.players, PLAYER_COLOUR));
    // requestAnimationFrame(() => drawLifeBar(gameState.players));


    // requestAnimationFrame(() => drawPlayersCollision(gameState.players));
    
}

function handleGameOver(args) {
    args = JSON.parse(args);

    console.log(args.id === playerId);
    if (args.id == playerId) {
        // TODO: GAME OVER
    }
}


