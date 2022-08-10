const { createStateMachine } = require('./player-statemachine');
const { checkCollision} = require('./checkcollision');
const { FPS, returnShip, returnCollectables } = require('./constants');

const CANVASSIZE = {x: 2000, y: 2000};


Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };
Math.lerp = function (X1, X2, Y1, Y2, X3) { return Number((X2 - X3) * Y1 + (X3 - X1) * Y2) / (X2 - X1);};
Math.randomRange = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min;};
Math.randomFloatRange = function (min, max) { return Math.random() * (max - min + 1) + min;};
Math.distance = function (obj1, obj2) {return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));};
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
        collectablesCount: 0,
        players: 
            { [args.id] : newPlayer },
            bullets : {},
        
        spawnCicle : {
            cicleTime : 10,
            nextCicleIn : 10,
        },
        collectablesMaxAmount : 30,
        collectables : {},
        enemies : {},
    };
    
}

function spawnPlayer(args){
    console.log(' > [spawnPlayer] Criando player do jogo');
    player = returnShip(args.shipStyle);
    
    player.stateMachine = createStateMachine(player);
    player.playerId = args.id;
    player.playerName = args.playerName;
    // Level
    player.level.max = 15;

    // Random Position
    player.pos = {
        x: Math.floor(Math.random() * ((CANVASSIZE.x - player.size.x) - player.size.x) + player.size.x),
        y: Math.floor(Math.random() * ((CANVASSIZE.y - player.size.y) - player.size.y) + player.size.y),
    }

    // Random Angle
    player.angle = Math.floor(Math.random() * 360);
    player.life.health = player.life.maxHealth;
    player.status = {
        invulnerability : {
            name : 'invulnerability',
            active: true,
            duration: 5,
            direction: 'down',
        } 
    }

    return player;
}

function gameLoop(state){
    if (!state){
        return
    }
    // Update state machine
    state.spawnCicle.nextCicleIn -= 5/FPS;

    if (state.spawnCicle.nextCicleIn <= 0 ){
        state.spawnCicle.nextCicleIn = state.spawnCicle.cicleTime;
        updateSpawns(state);
    }
    
    updatePlayerPosition(state);
    updatePlayerAngle(state);
    updateBulletsPosition(state);
    checkBulletsCollision(state);
    updatePlayerBullet(state);
    updatePlayerStatus(state);
    updateCollectablesCollision(state);

    
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
    state.bullets[i].speed = player.bullet.maxSpeed;

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
            cancelPlayerStatus(player, 'invulnerability');
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


    for (i in state.players){
        player = state.players[i];
        stateMachine = player.stateMachine.movement;

        nextPosFoward = {
            x: player.pos.x + player.speed * Math.cos(player.angle * Math.PI / 180),
            y: player.pos.y + player.speed * Math.sin(player.angle * Math.PI / 180),
        }
        nextPosBackward = {
            x: player.pos.x - (player.speed * 0.5) * Math.cos(player.angle * Math.PI / 180),
            y: player.pos.y - (player.speed * 0.5) * Math.sin(player.angle * Math.PI / 180),
        }

        canGoFoward = checkBoundaries(player.size, nextPosFoward);
        canGoBackward = checkBoundaries(player.size, nextPosBackward);
        stuck = (!canGoFoward && !canGoBackward);

        

        if (stuck){
            if (player.pos.x < 0)player.pos.x = 0;
            if (player.pos.y < 0)player.pos.y = 0;
            if (player.pos.x > CANVASSIZE.x - player.size.x)player.pos.x = CANVASSIZE.x - player.size.x;
            if (player.pos.y > CANVASSIZE.y - player.size.y)player.pos.y = CANVASSIZE.y - player.size.y;
        }

        if (stateMachine.foward.state === 'ON'){

            if (canGoFoward){
                player.pos = nextPosFoward;
            }
        }
        else if (stateMachine.backward.state === 'ON'){

            if (canGoBackward){
                player.pos = nextPosBackward;
            }

        }
    };
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
        if (checkBulletBoundaries(bullet.size, bullet.pos)){
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

function cancelPlayerStatus(player,statusName) {
    if (!player){
        return
    }
    playerStatus = player.status[statusName];
    playerStatus.active = false;
    playerStatus.duration = 0;

    specialStateEffectsOnEnd = {
        'invulnerability' : function(){
            player.life.indicator = Math.lerp(0, player.life.maxHealth, 0.3, 1, player.life.health);
        }
    }

    s = specialStateEffectsOnEnd[statusName];
    if (s)s();
    
}

function updatePlayerStatus(state){
    for (i in state.players){
        player = state.players[i];
        for (j in player.status){
            j = player.status[j];
            specialStateEffectsOnUpdate = {
                'invulnerability' : function(){
                    if (player.life.indicator > 0.2 && j.direction == 'down'){
                        player.life.indicator -= 0.1;
                    }
                    else if (player.life.indicator < 1 && j.direction == 'up'){
                        player.life.indicator += 0.1;
                    }

                    if (player.life.indicator >= 1 && j.direction == 'up'){
                        j.direction = 'down';
                    }
                    else if (player.life.indicator <= 0.2 && j.direction == 'down'){
                        j.direction = 'up';
                    }

                }
            }

            specialStateEffectsOnEnd = {
                'invulnerability' : function(){
                    player.life.indicator = Math.lerp(0, player.life.maxHealth, 0.3, 1, player.life.health);
                }
            }
            


            if (j.active && j.duration > 0){
                j.duration -= FPS/1000;
                s = specialStateEffectsOnUpdate[j.name];
                if (s)s();
                
            }else if (j.active && j.duration <= 0){
                s = specialStateEffectsOnEnd[j.name];
                if (s)s();
                j.active = false;
                j.duration = 0;
            }
        }
    }
    
}

function updateSpawns(state){
    if (Object.keys(state.collectables).length < state.collectablesMaxAmount){
        spawnCollectables(state, state.collectablesMaxAmount - Object.keys(state.collectables).length);
    }
}

function spawnCollectables(state, amount){
    for (i = 0; i < amount; i++){
        x = state.collectablesCount;
        r_number = Math.randomRange(0,100);
        if (r_number < 4){
            state.collectables[x] = returnCollectables('heal');
        }else {
            state.collectables[x] = returnCollectables('xp');
        }
        
        state.collectables[x].pos.x = Math.randomRange(0, CANVASSIZE.x - state.collectables[x].size.x);
        state.collectables[x].pos.y = Math.randomRange(0, CANVASSIZE.y - state.collectables[x].size.y);
        state.collectables[x].size.multiplier = Math.randomFloatRange(1, 4);
        state.collectables[x].size.x *= state.collectables[x].size.multiplier;
        state.collectables[x].size.y *= state.collectables[x].size.multiplier;
        state.collectables[x].ammount *= state.collectables[x].size.multiplier;
        state.collectablesCount++;
    }
}

function checkBulletsCollision(state){
    if (!state){
        return
    }
    

    for (i in state.bullets){
        bullet = state.bullets[i];
        const bulletSpecialProperties = {
            1 : function (){
                for (x in state.bullets){
                    bullet2 = state.bullets[x];
                    if (bullet2 != bullet && bullet2.origin != bullet.origin){
                        if (checkCollision(bullet, bullet2)){
                            if (bullet.damage == bullet2.damage){
                                delete state.bullets[i];
                                delete state.bullets[x];
                            } else if (bullet.damage > bullet2.damage){
                                bullet.damage -= bullet2.damage;
                                delete state.bullets[x];
                            } else {
                                bullet2.damage -= bullet.damage;
                                delete state.bullets[i];
                            }
                        }
                    }
                }
            }
        }
        b = bulletSpecialProperties[bullet.type];
        if (b){
            b();
        }

        for (j in state.players){ 
            player = state.players[j];
            if (player.playerId !== bullet.origin){
                const bulletSpecialPropertiesOnHitPlayer = {
                    2 : function LifeSteal(){
                        healPlayer(state.players[bullet.origin], state.players[bullet.origin].bullet.specialProperties.lifeSteal);
                    }
                }
                
                if (checkCollision(bullet, player)){
                    b = bulletSpecialPropertiesOnHitPlayer[bullet.type];
                    if (b){
                        b();
                    }
                    damagePlayer(player, bullet.damage);
                    player.lastHitBy = bullet.origin;
                    delete state.bullets[i];
                }
            };
        };
    };
    if (Object.keys(state.bullets).length == 0) state.bulletsCount = 0;

}

function updateCollectablesCollision(state){
    if (!state)return;
    for (k in state.collectables){
        collectable = state.collectables[k];
        for (j in state.players){
            player = state.players[j];
            if (checkCollision(collectable, player)){
                if (collectable.type == 'heal'){
                    healPlayer(player, collectable.ammount);
                }else if (collectable.type == 'xp'){
                    givePlayerExp(player, collectable.ammount);
                }
                delete state.collectables[k];
            }
        }

    }


}

function checkBoundaries(objSize, nextPos){
    
    
    if (nextPos.x < 0 || nextPos.x > CANVASSIZE.x - objSize.x || nextPos.y < 0 || nextPos.y > CANVASSIZE.y - objSize.y){
        return false;
    } else {
        return true;
    }

}

function checkBulletBoundaries(objSize, nextPos){
    
    
    if (nextPos.x < 0 - objSize.x || nextPos.x > CANVASSIZE.x + objSize.x || nextPos.y < 0 - + objSize.y || nextPos.y > CANVASSIZE.y  + objSize.y ){
        return false;
    } else {
        return true;
    }

}

function damagePlayer(player, damage){
    if (player.status.invulnerability.active) return;
    player.life.health -= damage;
    player.life.indicator = Math.lerp(0, player.life.maxHealth, 0.3, 1, player.life.health);
    if (player.life.health <= 0){
        player.life.health = 0;
    }

}

function healPlayer(player, heal){
    player.life.health += heal;
    player.life.indicator = Math.lerp(0, player.life.maxHealth, 0.3, 1, player.life.health);
    if (player.life.health > player.life.maxHealth){
        player.life.health = player.life.maxHealth;
    }
}

function levelUpPlayer(player){
    const levelUpProperties = {
        'ship1' : function(){
            player.level.current += 1;
            player.life.maxHealth += 60;
            player.bullet.fireRate -= 0.01;
            if (player.bullet.fireRate < 3) player.bullet.fireRate = 3;
            player.bullet.maxDistance += 3;
            player.bullet.maxSpeed += 0.15;
            player.bullet.damage += 15;
            player.bullet.size.x += 8;
            player.bullet.size.y += 8;
            player.size.x += 8;
            player.size.y += 8;
        },
        'ship2' : function(){
            player.level.current += 1;
            player.life.maxHealth += 10;
            player.speed += 0.2;
            player.bullet.fireRate -= 0.015;
            if (player.bullet.fireRate < 0.05) player.bullet.fireRate = 0.05;
            player.bullet.maxDistance -= 0.5;
            player.bullet.maxSpeed += 1;
            player.bullet.damage += 0.25;
            player.bullet.specialProperties.lifeSteal += 0.025;
            player.bullet.size.x += 0.5;
            player.bullet.size.y += 0.5;
            player.size.x += 2.5;
            player.size.y += 2.5;
        },
        'ship3' : function(){
            player.level.current += 1;
            player.life.maxHealth += 2;
            player.speed += 0.30;
            if (player.bullet.fireRate < 2) player.bullet.fireRate = 2;
            player.bullet.maxDistance += 10;
            player.bullet.maxSpeed += 0.30;
            player.bullet.damage += 5;
            player.bullet.specialProperties.maxDamage += 30;
            player.bullet.specialProperties.damageIncrease += 0.25;
            player.bullet.specialProperties.maxSize.x += 1;
            player.bullet.size.x += 0.5;
            // player.bullet.size.y += 0.5;
            player.size.x += 1.5;
            player.size.y += 1.5;
        },
    }

    levelUpProperties[player.shipStyle]();
    player.level.exp.max += 100; 
    player.level.exp.indicator = 0;
    player.life.health = player.life.maxHealth;
    player.life.indicator = 1;

}

function givePlayerExp(player, ammount){
    
        do {
            if (player.level.current < player.level.max){
                expToNext = player.level.exp.max - player.level.exp.current;
                if (ammount < expToNext){
                    player.level.exp.current += ammount;
                    player.level.exp.totalEarned += ammount;
                    player.level.exp.indicator = Math.lerp(0, player.level.exp.max, 0, 100, player.level.exp.current);
                    ammount = 0;
                }else{
                    levelUpPlayer(player);
                    player.level.exp.totalEarned += expToNext;
                    ammount -= expToNext;
                    player.level.exp.current = 0;
                }
            }else{break;}
        } while (ammount > 0);
        
}


function checkPlayerAlive(state){
    if (!state){
        return
    }

    let deathPlayer;
    for (i in state.players){
        player = state.players[i];
        if (player.life.health <= 0){
            xp = player.level.exp.totalEarned ? Math.percentage(40, player.level.exp.totalEarned) : 10;
            givePlayerExp(state.players[player.lastHitBy], xp);
            healPlayer(state.players[player.lastHitBy], Math.percentage(10, state.players[player.lastHitBy].life.maxHealth));
            deathPlayer = player;
            break;
        }
    };

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