const { createStateMachine } = require('./player-statemachine');
const { checkCollision} = require('./checkcollision');
const { FPS, returnShip } = require('./constants');

const CANVASSIZE = {x: 1500, y: 900};


Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

function initGame(args){
    const state = createGameState(args);
    return state;
}



function createGameState(args) {
    console.log(' > [createGameState] Criando player do jogo');
    newPlayer = spawnPlayer(args);
    return {
        players: 
            { [args.id] : newPlayer },

        bullets : [

        ],
    };
    
}

function spawnPlayer(args){
    console.log(' > [spawnPlayer] Criando player do jogo');
    player = returnShip(args.shipStyle);
    
    player.stateMachine = createStateMachine(player);
    player.playerName = args.id;

    // Random Position
    player.pos = {
        x: Math.floor(Math.random() * CANVASSIZE.x - player.size.x),
        y: Math.floor(Math.random() * CANVASSIZE.y - player.size.y),
    }

    // Random Angle
    player.angle = Math.floor(Math.random() * 360);

    return player;
}

function gameLoop(state){
    if (!state){
        return
    }
    // Update state machine
    
    updatePlayerPosition(state);
    updatePlayerAngle(state);
    updateBulletsPosition(state);
    checkBulletsCollision(state);
    updatePlayerBullet(state);

    //Update player position

}


function keyDown(state, id, { key, keyCode }){
    // console.log(' > [keyDown] Tecla pressionada');
    if (!state || !key){
        return
    }
    // console.log(' > [keyDown] Tecla pressionada: ', key, ' - Player ID: ', id);
    const player = state.players[id];
    const stateMachine = player.stateMachine.movement;
    const acceptedMoves = {

        ArrowUp() {
            stateMachine.dispatchEvent(stateMachine.foward, 'ON');
            
        },

        ArrowDown() {
            stateMachine.dispatchEvent(stateMachine.backward, 'ON');
        },

        ArrowLeft() {
            stateMachine.dispatchEvent(stateMachine.left, 'ON');
        },

        ArrowRight() {
            stateMachine.dispatchEvent(stateMachine.right, 'ON');
        },
    };

    const acceptedCommands = {
        32 : function Space(){
            stateMachine.dispatchEvent(stateMachine.shooting, 'ON');
        },

    }

    const moveFunction = acceptedMoves[key];
    const commandFunction = acceptedCommands[keyCode];

    if (moveFunction){
        moveFunction();
    }
    if (commandFunction){
        commandFunction();
    }
}

function keyUp(state, id, { key, keyCode }){
    if (!state || !key){
        return
    }
    const player = state.players[id];
    const stateMachine = player.stateMachine.movement;
    const acceptedMoves = {
        ArrowUp() {
            stateMachine.dispatchEvent(stateMachine.foward, 'OFF');
            
        },

        ArrowDown() {
            stateMachine.dispatchEvent(stateMachine.backward, 'OFF');
        },

        ArrowLeft() {
            stateMachine.dispatchEvent(stateMachine.left, 'OFF');
        },

        ArrowRight() {
            stateMachine.dispatchEvent(stateMachine.right, 'OFF');
        },

    };

    const acceptedCommands = {
        32 : function Space(){
            stateMachine.dispatchEvent(stateMachine.shooting, 'OFF');
        },

    }

    const moveFunction = acceptedMoves[key];
    const commandFunction = acceptedCommands[keyCode];

    if (moveFunction){
        moveFunction();
    }
    if (commandFunction){
        commandFunction();
    }
}

function spawnBullet(state, player){
    if (!player){
        return
    }
    state.bullets.push({
        pos: {
                x: (player.pos.x + player.size.x / 2) - player.bullet.size.x/2,
                y: (player.pos.y + player.size.y / 2) - player.bullet.size.y/2,
            },
        angle: player.angle,
        speed: player.bullet.speed,
        size: player.bullet.size,
        damage: player.bullet.damage,
        fireRate: player.bullet.fireRate,
        origin: player,
    });
}

function updatePlayerBullet(state){
    if (!state){
        return
    }
    Object.keys(state.players).forEach(key => {
        player = state.players[key];
        if(player.bullet.lastFire > 0){
            player.bullet.lastFire -= FPS/1000;
        }else{
            player.bullet.lastFire = 0;
        }

        if (player.stateMachine.movement.shooting.state === 'ON'){
            if (player.bullet.lastFire === 0){
                spawnBullet(state, player);
                player.bullet.lastFire = player.bullet.fireRate;
            }
            
        }   
    });
}

function updatePlayerPosition(state){
    if (!state){
        return
    }
    
    // console.log(' > [updatePlayerPosition] Atualizando posição dos players');

    Object.keys(state.players).forEach(key => {
        player = state.players[key];
        stateMachine = player.stateMachine.movement;

        if (stateMachine.foward.state === 'ON'){
            nextPos = {
                x: player.pos.x + player.speed * Math.cos(player.angle * Math.PI / 180),
                y: player.pos.y + player.speed * Math.sin(player.angle * Math.PI / 180),
            }

            if (checkBoundaries(player.size, nextPos)){
                player.pos = nextPos;
            }
        }
        else if (stateMachine.backward.state === 'ON'){
            nextPos = {
                x: player.pos.x - (player.speed * 0.5) * Math.cos(player.angle * Math.PI / 180),
                y: player.pos.y - (player.speed * 0.5) * Math.sin(player.angle * Math.PI / 180),
            }

            if (checkBoundaries(player.size, nextPos)){
                player.pos = nextPos;
            }

        }
    });
}

function updatePlayerAngle(state){
    if (!state){
        return
    }
    Object.keys(state.players).forEach(key => {
        player = state.players[key];
        stateMachine = player.stateMachine.movement;

        if (stateMachine.left.state === 'ON'){
            newAngle = player.angle - player.turnSpeed;
            player.angle = Math.fmod(newAngle, 360);
        }
        else if (stateMachine.right.state === 'ON'){
            newAngle = player.angle + player.turnSpeed;
            player.angle = Math.fmod(newAngle, 360);
        }
    });
}

function updateBulletsPosition(state){
    state.bullets.forEach(bullet => {

        // Move bullet if is on Screen Boundaries
        if (checkBoundaries(bullet.size, bullet.pos)){
            bullet.pos.x += bullet.speed * Math.cos(bullet.angle * Math.PI / 180);
            bullet.pos.y += bullet.speed * Math.sin(bullet.angle * Math.PI / 180);
        }else {
            // Destroy bullet
            state.bullets.splice(state.bullets.indexOf(bullet), 1);
        }
    });
}

function checkPlayersCollision(state){
    if (!state){
        return
    }

    const p1 = state.players[0];
    state.players.forEach(player => {
        if (player !== p1){
            if (checkCollision(p1, player)){
                p1.colliding = true;
            }else {
                p1.colliding = false;
            }
        }

    });
}

function checkBulletsCollision(state){
    if (!state){
        return
    }

    state.bullets.forEach(bullet => {
        Object.keys(state.players).forEach(key => {
            player = state.players[key];
            if (player !== bullet.origin){
                if (checkCollision(bullet, player)){
                    state.bullets.splice(state.bullets.indexOf(bullet), 1);
                }
            }
        });
    });
}

function checkBoundaries(objSize, nextPos){
    
    
    if (nextPos.x < 0 || nextPos.x > CANVASSIZE.x - objSize.x || nextPos.y < 0 || nextPos.y > CANVASSIZE.y - objSize.y){
        return false;
    } else {
        return true;
    }


}





module.exports = {
    initGame,
    spawnPlayer,
    gameLoop,
    keyDown,
    keyUp,
}