const FPS = 60;

const shipProperties = {
    ship1 : {
        playerName: '',
        playerId: '',
        lastHitBy: '',
        life : {
            health: 0,
            maxHealth: 200,
            indicator: 1,
        },
        level : {
            current: 1,
            max: 0,
            exp : {
                current: 0,
                max: 0,
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
            speed: 6,
            maxSpeed: 6,
            spread: 0,
            distance: 0,
            maxDistance: 100,
            opacity:1,
            size: {
                x: 30,
                y: 30,
            },
            angle: 0,
            fireRate: 4,
            lastFire: 0,
            pos : {
                x : 0,
                y : 0,
            },
            specialProperties : {

            },
        },
        angle: 0,
        turnSpeed: 2,
        speed: 3,
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
                max: 0,
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
            speed: 8,
            maxSpeed: 8,
            spread: 10,
            distance: 0,
            maxDistance: 48,
            opacity:1,
            size: {
                x: 9,
                y: 9,
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
        angle: 0,
        turnSpeed: 12,
        speed: 5,
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
            totalEarned : 0,
        },
        level : {
            current: 1,
            max: 0,
            exp : {
                current: 0,
                max: 0,
                indicator : 0,
            },
        },
        pos: {
            x: 0,
            y: 0,
        },
        bullet: {
            type: 3,
            damage: 32,
            speed: 18,
            maxSpeed: 18,
            spread: 1.2,
            distance: 0,
            maxDistance: 70,
            opacity:1,
            size: {
                x: 10,
                y: 5,
            },
            angle: 0,
            fireRate: 2,
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
        turnSpeed: 6,
        speed: 9,
        size: {
            x: 32,
            y: 28,
        },
        shipStyle: 'ship3',
    }, //ship3
}

function returnShip(shipStyle){
    return (JSON.parse(JSON.stringify(shipProperties[shipStyle])));
}


module.exports = {
    FPS,
    returnShip,
}