const { createStateMachine } = require('./player-statemachine');
const { checkCollision} = require('./checkcollision');
const { FPS, returnShip } = require('./constants');

const CANVASSIZE = {x: 1500, y: 900};


Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };
Math.lerp = function (X1, X2, Y1, Y2, X3) { return Number((X2 - X3) * Y1 + (X3 - X1) * Y2) / (X2 - X1);};

Math.percentage = function (percentage, totalValue){ return Number((percentage/100) * totalValue) };

function initGame(args){
    const state = createGameState(args);
    return state;
}



function createGameState(args) {
    console.log(' > [createGameState] Criando player do jogo');
    newPlayer = spawnPlayer(args);
    return {
        bulletsCount: 0,
        players: 
            { [args.id] : newPlayer },
            bullets : {},
    };
    
}

function spawnPlayer(args){
    console.log(' > [spawnPlayer] Criando player do jogo');
    player = returnShip(args.shipStyle);
    
    player.stateMachine = createStateMachine(player);
    player.playerId = args.id;
    player.playerName = args.playerName;

    // Random Position
    player.pos = {
        x: Math.floor(Math.random() * ((CANVASSIZE.x - player.size.x) - player.size.x) + player.size.x),
        y: Math.floor(Math.random() * ((CANVASSIZE.y - player.size.y) - player.size.y) + player.size.y),
    }

    // Random Angle
    player.angle = Math.floor(Math.random() * 360);
    player.life.health = player.life.maxHealth;

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
    if (!player){
        return
    }
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
    if (!player){
        return
    }
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
    i = state.bulletsCount;

    state.bullets[i] = JSON.parse(JSON.stringify(player.bullet));
    state.bullets[i].origin = player.playerId;
    state.bullets[i].pos = {
        x: (player.pos.x + player.size.x / 2) - player.bullet.size.x/2,
        y: (player.pos.y + player.size.y / 2) - player.bullet.size.y/2,
    }
    state.bullets[i].angle = player.angle + (Math.random() * (player.bullet.spread - (-player.bullet.spread)) + (-player.bullet.spread));

    state.bulletsCount++;

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

    
    for (i in state.bullets){
        bullet = state.bullets[i];
        // Move bullet if is on Screen Boundaries
        if (checkBoundaries(bullet.size, bullet.pos)){
            bullet.distance += 1;
            const bulletSpecialProperties = {
                3 : function Laser(){
                    if (bullet.size.x < bullet.specialProperties.maxSize.x){
                        bullet.size.x += bullet.specialProperties.sizeIncrease;
                    }

                    if (bullet.damage < bullet.specialProperties.maxDamage){
                        bullet.damage += bullet.specialProperties.damageIncrease;
                    }else if (bullet.damage > bullet.specialProperties.maxDamage){
                        bullet.damage = bullet.specialProperties.maxDamage;
                    }
                }
            }
            
            b = bulletSpecialProperties[bullet.type];
            if (b){
                b();
            }

            if (bullet.speed > 0){
                n = bullet.maxDistance - Math.percentage(15, bullet.maxDistance)
                if (bullet.distance >= n){

                    bullet.speed = Math.lerp(n, bullet.maxDistance, bullet.maxSpeed, 0, bullet.distance);
                    bullet.opacity = Math.lerp(0, bullet.maxDistance, 1, 0, bullet.distance);
                    if (bullet.opacity < 0)  bullet.opacity = 0;
                }
                bullet.pos.x += bullet.speed * Math.cos(bullet.angle * Math.PI / 180);
                bullet.pos.y += bullet.speed * Math.sin(bullet.angle * Math.PI / 180);
            } else {
                delete state.bullets[i];
            }
        }else {
            // Destroy bullet
            delete state.bullets[i];
        }
    };
}

function checkBulletsCollision(state){
    if (!state){
        return
    }

    for (i in state.bullets){
        bullet = state.bullets[i];
        Object.keys(state.players).forEach(key => {
            player = state.players[key];
            if (player.playerId !== bullet.origin){
                if (checkCollision(bullet, player)){
                    damagePlayer(player, bullet.damage);
                    delete state.bullets[i];
                }
            }
        });
    };

    if (Object.keys(state.bullets).length == 0) state.bulletsCount = 0;
}

function checkBoundaries(objSize, nextPos){
    
    
    if (nextPos.x < 0 || nextPos.x > CANVASSIZE.x - objSize.x || nextPos.y < 0 || nextPos.y > CANVASSIZE.y - objSize.y){
        return false;
    } else {
        return true;
    }

}

function damagePlayer(player, damage){
    player.life.health -= damage;
    player.life.indicator = Math.lerp(0, player.life.maxHealth, 0.2, 1, player.life.health);
    if (player.life.indicator < 0) player.life.indicator = 0;

}

function checkPlayerAlive(state){
    if (!state){
        return
    }

    let deathPlayer;
    Object.keys(state.players).forEach(key => {
        player = state.players[key];
        if (player.life.health <= 0){
            // console.log(' > [checkPlayerAlive]<Game> Player ', player.playerName, ' is dead');
            deathPlayer = player;
            return;
        }
    });

    return deathPlayer ? deathPlayer : null;
}




module.exports = {
    initGame,
    spawnPlayer,
    checkPlayerAlive,
    gameLoop,
    keyDown,
    keyUp,
}