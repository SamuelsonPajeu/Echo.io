// const socket = io('http://localhost:3000', { transports : ['websocket'] }); //FOR LOCALHOST
const socket = io('https://echo-io.onrender.com', { transports : ['websocket'] }); //FOR HEROKU

Math.lerp = function (X1, X2, Y1, Y2, X3) { return Number((X2 - X3) * Y1 + (X3 - X1) * Y2) / (X2 - X1);};

// LISTEN EVENTS
socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('forbiddenName', handleForbiddenName);
socket.on('roomDoesNotExist', handleRoomDoesNotExist);
socket.on('roomFull', handleRoomFull);


const GAME_COLOUR = "#231f20";
const BG_COLOUR = "#20262E";
const BULLET_COLOUR = "#c2c2c2";
const PLAYER_COLOUR = "#ff0000";
const COLLIDING_COLOUR = "#7CFC00";
const LIFEBARDIMENSION = 100;
const LIFEBARCORNERRADIUS = 30;


const nickname = document.getElementById('nickname');
const roomIdInput = document.getElementById('roomId');
const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const startGameButton = document.getElementById('startGameButton');
const joinGameButton = document.getElementById('joinGameButton');
const respawnButtom = document.getElementById('respawnBt');


const gameCodeDisplay = document.getElementById('gameCodeDisplay');

const joinGameObjs = document.getElementsByClassName('joinGame');
const startGameObjs = document.getElementsByClassName('startGame');
const respawnObjs = document.getElementsByClassName('respawn');
const xpBar = document.getElementById('xpBar');
const deathText = document.getElementById('death-text');


startGameButton.addEventListener('click', newGame);
joinGameButton.addEventListener('click', joinGame);
respawnButtom.addEventListener('click', respawn);



let canvas, ctx, hudCanvas, hudCtx;


let playerId;
let roomId;
let playerName;



function newGame() {
    playerName = nickname.value;

    if (playerName.length > 0 && playerName.length < 16) {
        selected =  document.querySelector('input[name="ship-selector"]:checked').value;

        socket.emit('newGame', {
            selected : selected, 
            playerName : playerName
        });
        
    } else{
        playerName.length == 0 ? null : alert('O Nickname deve ter no máximo 16 caracteres');
    }

}

function joinGame() {
    playerName = nickname.value;
    joinRoomId = roomIdInput.value;


    if (playerName.length > 0 && playerName.length < 16) {
        if (joinRoomId.length > 0 && joinRoomId.length == 5){
            selected =  document.querySelector('input[name="ship-selector"]:checked').value;
        
            socket.emit('joinGame', {
                roomId : joinRoomId, 
                selected: selected, 
                playerName : playerName
            });
        } else {
            joinRoomId.length == 0 ? null : alert('O Id da sala deve ter exatamente 5 caracteres');
            return;
        }
        
    } else{
        playerName.length == 0 ? null : alert('O Nickname deve ter no máximo 16 caracteres');
        return;
    }}



function start() {
    // HIDE SELECTION MENU AND SHOW GAME
    initialScreen.style.display = 'none';
    gameScreen.style.display = 'block';


    // CANVAS DRAW
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 1500;
    canvas.height = 900;
    virtualCanvas = {
        width: 2000,
        height: 2000,
    }
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // ASSETS CREATE
    img_assets = {
        ship1 : new Image(),
        ship2 : new Image(),
        ship3 : new Image(),
    }

    collectables_assets = {
        healorb : new Image(),
        xporb : new Image(),
    },
    // ASSETS LOAD
    img_assets.ship1.src = '../assets/img/ship1.png';
    img_assets.ship2.src = '../assets/img/ship2.png';
    img_assets.ship3.src = '../assets/img/ship3.png';

    collectables_assets.healorb.src = '../assets/img/healorb.png';
    collectables_assets.xporb.src = '../assets/img/xporb.png';

    // KEYBOARD LISTENER
    document.addEventListener('keydown', keyDown, false);
    document.addEventListener('keyup', keyUp, false);

}

// DRAW 
function drawScreen(players) {
    // GAME CANVAS
    ctx.fillStyle = BG_COLOUR;
    // ctx.globalCompositeOperation = 'destination-under';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    camera = {
        get x () { return players[playerId].pos.x <= canvas.width / 2 ? 0 : players[playerId].pos.x - players[playerId].size.x/2 >= virtualCanvas.width - (canvas.width/2) ?  (canvas.width / 3) + players[playerId].size.x/2  : -(canvas.width / 2 - players[playerId].pos.x) },
        get y () { return  players[playerId].pos.y <= canvas.height / 2 ? 0 :  players[playerId].pos.y -  players[playerId].size.y >= virtualCanvas.height - (canvas.height/2) ? (canvas.height * 1.2) +  players[playerId].size.y : -(canvas.height / 2 -  players[playerId].pos.y) }
    }

    ctx.save();
    for (var i=5; i < virtualCanvas.width; i+=50) {
        

        ctx.moveTo(i - camera.x , 5);
        ctx.lineTo(i - camera.x, virtualCanvas.height - 5);

        ctx.moveTo(5, i - camera.y);
        ctx.lineTo(virtualCanvas.width - 5, i - camera.y);

        ctx.strokeStyle = "#363c43";
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
    ctx.restore();

}

function drawPlayer(players, color) {
    for (i in players) {
        playerState = players[i];
        
        if (playerState.playerId === playerId) {
            camera = {
                get x () { return playerState.pos.x <= canvas.width / 2 ? 0 : playerState.pos.x - playerState.size.x/2 >= virtualCanvas.width - (canvas.width/2) ? (canvas.width / 3) + playerState.size.x/2  : -(canvas.width / 2 - playerState.pos.x) },
                get y () { return playerState.pos.y <= canvas.height / 2 ? 0 : playerState.pos.y - playerState.size.y >= virtualCanvas.height - (canvas.height/2) ? (canvas.height * 1.21) + playerState.size.y : -(canvas.height / 2 - playerState.pos.y) }
            }
            ctx.strokeStyle = "#ffffff";
            ctx.strokeRect(-camera.x,-camera.y,virtualCanvas.width ,virtualCanvas.height );
            // ctx.fillStyle = GAME_COLOUR;
            // ctx.fillRect(-camera.x, -camera.y, virtualCanvas.width, virtualCanvas.height);
        }else
        {
            camera = {
                get x () { return players[playerId].pos.x <= canvas.width / 2 ? 0 : players[playerId].pos.x - players[playerId].size.x/2 >= virtualCanvas.width - (canvas.width/2) ?  (canvas.width / 3) + players[playerId].size.x/2  : -(canvas.width / 2 - players[playerId].pos.x) },
                get y () { return  players[playerId].pos.y <= canvas.height / 2 ? 0 :  players[playerId].pos.y -  players[playerId].size.y >= virtualCanvas.height - (canvas.height/2) ? (canvas.height * 1.2) +  players[playerId].size.y : -(canvas.height / 2 -  players[playerId].pos.y) }
            }
        }

        
        
        // Only for client local player
        // if (playerState.playerId === playerId) {
        //     ctx.fillStyle = "#ffffff";
        //     ctx.textAlign = "center";
        //     ctx.fillText(`${playerName}`, (playerState.pos.x + playerState.size.x/2) , playerState.pos.y - 20);
        // }



        size = playerState.size;
        ctx.fillStyle = color;

        ctx.save();

        //Draw player img
        ctx.translate((playerState.pos.x - camera.x) + size.x/2 , (playerState.pos.y - camera.y) + size.y/2);
        ctx.rotate(playerState.angle * Math.PI / 180);
        ctx.translate(-((playerState.pos.x - camera.x) + playerState.size.x/2) , -((playerState.pos.y - camera.y)  + playerState.size.y/2));
        ctx.globalAlpha = playerState.life.indicator;
        ctx.drawImage(img_assets[playerState.shipStyle], (playerState.pos.x - camera.x), (playerState.pos.y - camera.y), size.x, size.y,);

        ctx.restore();

        //Draw players name
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "12px Arial";
        posYModifier = 20 - camera.y;
        posXModifier = 70 - camera.x;
        posY = (playerState.pos.y - camera.y - 30 ) < posYModifier ? posYModifier : (playerState.pos.y - camera.y - 30);
        nextPosX = (playerState.pos.x - camera.x + playerState.size.x/2);
        

        if (playerState.playerId === playerId) {
            posX = nextPosX <  posXModifier ?  posXModifier :  nextPosX;
            // posX = nextPosX <  posXModifier ?  posXModifier < :  nextPosX;

        }else {
            posX = nextPosX;
        }
        ctx.fillText(`-( ${playerState.level.current} )- ${playerState.playerName}`, posX , posY);
        // ctx.fillText(`Player Xp: ${playerState.level.exp.current} | ${playerState.level.exp.max}\n Total Earned: ${playerState.level.exp.totalEarned}`, posX, posY + 100,);
        // ctx.fillText(`Player Hp: ${playerState.life.health} | ${playerState.life.maxHealth}\n Damage: ${playerState.bullet.damage} | ${playerState.bullet.specialProperties.maxDamage} `, posX, posY + 100,);
        
        // ctx.fillRect(playerState.pos.x+size/2, playerState.pos.y+size/2, 15, 2); //CENTER OF OBJECT

        //Draw life bar
        ctx.save();
        
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        ctx.moveTo(posX - 50, posY + 10);
        line = Math.lerp(playerState.life.maxHealth,0,50,-50,playerState.life.health);
        if (line < -50) line = -50;

        ctx.lineTo(posX + line, posY + 10);
        ctx.stroke();
        ctx.restore();

        
    };
}

function drawXpBar(players){
    Object.keys(players).forEach(player => {
        playerState = players[player];

        if (playerState.playerId === playerId) {
            xpBar.value = playerState.level.exp.indicator;
        }
    });
}


function drawBullets(bullets, color, players) {

    for (i in bullets){
        bullet = bullets[i];

        b_camera = {
            get x () { return players[playerId].pos.x <= canvas.width / 2 ? 0 : players[playerId].pos.x - players[playerId].size.x/2 >= virtualCanvas.width - (canvas.width/2) ?  (canvas.width / 3) + players[playerId].size.x/2   : -(canvas.width / 2 - players[playerId].pos.x) },
            get y () { return  players[playerId].pos.y <= canvas.height / 2 ? 0 :  players[playerId].pos.y -  players[playerId].size.y >= virtualCanvas.height - (canvas.height/2) ? (canvas.height * 1.2) +  players[playerId].size.y : -(canvas.height / 2 -  players[playerId].pos.y) }
        }


        ctx.fillStyle = color;
        ctx.save();
        ctx.translate((bullet.pos.x - b_camera.x) + bullet.size.x/2 , (bullet.pos.y - b_camera.y) + bullet.size.y/2);
        ctx.rotate(bullet.angle * Math.PI / 180);
        ctx.translate(-((bullet.pos.x - b_camera.x) + bullet.size.x/2) , -((bullet.pos.y - b_camera.y) + bullet.size.y/2));
        ctx.globalAlpha = bullet.opacity;
        ctx.fillRect((bullet.pos.x - b_camera.x), (bullet.pos.y - b_camera.y), bullet.size.x, bullet.size.y);

        ctx.restore();
    };
}

function drawCollectables(collectables, players) {
    for (i in collectables){
        collectable = collectables[i];
        if (!collectable)return;

        c_camera = {
            get x () { return players[playerId].pos.x <= canvas.width / 2 ? 0 : players[playerId].pos.x - players[playerId].size.x/2 >= virtualCanvas.width - (canvas.width/2) ?  (canvas.width / 3) + players[playerId].size.x/2   : -(canvas.width / 2 - players[playerId].pos.x) },
            get y () { return  players[playerId].pos.y <= canvas.height / 2 ? 0 :  players[playerId].pos.y -  players[playerId].size.y >= virtualCanvas.height - (canvas.height/2) ? (canvas.height * 1.2) +  players[playerId].size.y : -(canvas.height / 2 -  players[playerId].pos.y) }
        }

        ctx.save();
        ctx.drawImage(collectables_assets[collectable.assetName], (collectable.pos.x - c_camera.x), (collectable.pos.y - c_camera.y), collectable.size.x, collectable.size.y,);
        ctx.restore();
    };
}

// TO SERVER

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
    gameCodeDisplay.innerText = `Room Id: ${roomId}`;

}

function handleForbiddenName(){
    alert('Nome inválido');
}

function handleRoomDoesNotExist(){
    alert('Sala não existe');
}

function handleRoomFull(){
    alert('Sala cheia');
}

function handleGameState(gameState) {
    gameState = JSON.parse(gameState);

    requestAnimationFrame(() => drawScreen(gameState.players)); 
    
    requestAnimationFrame(() => drawCollectables(gameState.collectables, gameState.players));
    requestAnimationFrame(() => drawBullets(gameState.bullets, BULLET_COLOUR, gameState.players));
    requestAnimationFrame(() => drawPlayer(gameState.players, PLAYER_COLOUR));
    requestAnimationFrame(() => drawXpBar(gameState.players));
    


    // requestAnimationFrame(() => drawLifeBar(gameState.players));
    // requestAnimationFrame(() => drawPlayersCollision(gameState.players));
    
}

function respawn(args){
    // TODO - respawn player
    for (var i = 0; i < respawnObjs.length; i++) {
        respawnObjs[i].style.display = 'none';
    }

    selected =  document.querySelector('input[name="ship-selector-respawn"]:checked').value;

    socket.emit('respawn', {
        roomId : roomId, 
        selected: selected, 
        playerName : playerName
    });

}

function handleGameOver(args) {
    args = JSON.parse(args);

    if (args.id == playerId) {
        deathText.innerText = 'The end...';
        for (var i = 0; i < respawnObjs.length; i++) {
            respawnObjs[i].style.display = 'block';
        }
    }
}

function insertRoom(){
    
    roomIdInput.required = true;

    for (var i = 0; i < startGameObjs.length; i++) {
        startGameObjs[i].style.display = 'none';
    }


    for (var i = 0; i < joinGameObjs.length; i++) {
        joinGameObjs[i].style.display = 'block';
    }

}

function goBack() {
    roomIdInput.required = false;
        
    for (var i = 0; i < startGameObjs.length; i++) {
        startGameObjs[i].style.display = 'block';
    }

    for (var i = 0; i < joinGameObjs.length; i++) {
        joinGameObjs[i].style.display = 'none';
    }
}

