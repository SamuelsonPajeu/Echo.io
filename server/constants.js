const FPS = 27;
Math.lerp = function (X1, X2, Y1, Y2, X3) { return Number((X2 - X3) * Y1 + (X3 - X1) * Y2) / (X2 - X1);};

const multiplier = Math.lerp(0,60,3,1,FPS);
const shipProperties = {
    ship1 : {
        playerName: '',
        playerId: '',
        lastHitBy: '',
        life : {
            health: 0,
            maxHealth: 160,
            indicator: 1,
        },
        level : {
            current: 1,
            max: 0,
            exp : {
                current: 0,
                max: 100,
                indicator : 0,
                totalEarned : 0,
            },
        },
        pos: {
            x: 0,
            y: 0,
        },
        bullet: {
            type: 1,
            damage: 60,
            speed: 6 * multiplier,
            maxSpeed: 6 * multiplier,
            spread: 0,
            distance: 0,
            maxDistance: 50 / multiplier,
            opacity:1,
            size: {
                x: 30,
                y: 30,
            },
            angle: 0,
            fireRate: 4 / multiplier,
            fireRateMin: 3 / multiplier,
            lastFire: 0,
            pos : {
                x : 0,
                y : 0,
            },
            specialProperties : {

            },
        },
        angle: 0,
        turnSpeed: 2 * multiplier,
        speed: 3 * multiplier,
        size: {
            x: 30,
            y: 30,
        },
        shipStyle: 'ship1',
    }, //ship1

    ship2 : {
        playerName: '',
        playerId: '',
        lastHitBy: '',
        life : {
            health: 0,
            maxHealth: 75,
            indicator: 1,
        },
        level : {
            current: 1,
            max: 0,
            exp : {
                current: 0,
                max: 100,
                indicator : 0,
                totalEarned : 0,
            },
        },
        pos: {
            x: 0,
            y: 0,
        },
        bullet: {
            type: 2,
            damage: 15,
            speed: 8 * multiplier,
            maxSpeed: 8 * multiplier,
            spread: 10,
            distance: 0,
            maxDistance: 60 / multiplier,
            opacity:1,
            size: {
                x: 9,
                y: 9,
            },
            angle: 0,
            fireRate: 0.5 / multiplier,
            fireRateMin: 0.015 / multiplier,
            lastFire: 0,
            pos : {
                x : 0,
                y : 0,
            },
            specialProperties : {
                lifeSteal : 3,
            },
        },
        angle: 0,
        turnSpeed: 7 * multiplier,
        speed: 6 * multiplier,
        size: {
            x: 35,
            y: 30,
        },
        shipStyle: 'ship2',
    }, //ship2

    ship3 : {
        playerName: '',
        playerId: '',
        lastHitBy: '',
        life : {
            health: 0,
            maxHealth: 60,
            indicator: 1,
        },
        level : {
            current: 1,
            max: 0,
            exp : {
                current: 0,
                max: 100,
                indicator : 0,
                totalEarned : 0,
            },
        },
        pos: {
            x: 0,
            y: 0,
        },
        bullet: {
            type: 3,
            damage: 10,
            speed: 18 * multiplier,
            maxSpeed: 18 * multiplier,
            spread: 0.8,
            distance: 0,
            maxDistance: 70 / multiplier,
            opacity:1,
            size: {
                x: 10,
                y: 5,
            },
            angle: 0,
            fireRate: 3.5 / multiplier,
            fireRateMin: 2 / multiplier,
            lastFire: 0,
            pos : {
                x : 0,
                y : 0,
            },
            specialProperties : {
                maxDamage : 100,
                maxSize : {
                    x: 50,
                    y: 5,
                },
                sizeIncrease : 1,
                damageIncrease : 1.5,

            },
        },
        angle: 0,
        turnSpeed: 5* multiplier,
        speed: 9* multiplier,
        size: {
            x: 32,
            y: 28,
        },
        shipStyle: 'ship3',
    }, //ship3
}

const enemiesProperties = {
    anarchy : {
        enemyName : 'anarchy',
        size : { 
            x : 30,
            y : 30,
        },
        pos : {
            x : 0,
            y : 0,
        },
        angle : 0,
        speed : 0,
        turnSpeed: 5,
        bullet: {
            type: 0,
            damage: 5,
            speed: 14,
            maxSpeed: 14,
            spread: 0.5,
            distance: 0,
            maxDistance: 30,
            opacity:1,
            size: {
                x: 5,
                y: 5,
            },
            angle: 0,
            fireRate: 0.5,
            lastFire: 0,
            pos : {
                x : 0,
                y : 0,
            },
            specialProperties : {

            },
        },
    },
}

const collectablesProperties = {
    xp : {
        assetName: 'xporb',
        type : 'xp',
        size : {
            x: 7,
            y: 9,
            multiplier : 1,
        },
        pos : {
            x: 0,
            y: 0,
        },
        angle: 0,
        ammount : 13,
    },

    heal : {
        assetName: 'healorb',
        type : 'heal',
        size : {
            x: 5,
            y: 5,
            multiplier : 1,
        },
        pos : {
            x: 0,
            y: 0,
        },
        angle: 0,
        ammount : 20,
    }
}



function returnShip(shipStyle){
    return (JSON.parse(JSON.stringify(shipProperties[shipStyle])));
}

function returnCollectables(type){
    return (JSON.parse(JSON.stringify(collectablesProperties[type])));
}


module.exports = {
    FPS,
    returnShip,
    returnCollectables,
}