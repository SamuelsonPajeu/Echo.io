const FPS = 60;

const shipProperties = {
    ship1 : {
        playerName: '',
        life : {
            healh: 100,
            indicator: 1,
        },
        pos: {
            x: 0,
            y: 0,
        },
        bullet: {
            damage: 60,
            speed: 6,
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
        colliding : false,
        life : {
            healh: 75,
            indicator: 1,
        },
        pos: {
            x: 0,
            y: 0,
        },
        bullet: {
            damage: 15,
            speed: 7,
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
        },
        angle: 0,
        turnSpeed: 6,
        speed: 4,
        size: {
            x: 35,
            y: 30,
        },
        shipStyle: 'ship2',
    }, //ship2

    ship3 : {
        playerName: '',
        colliding : false,
        life : {
            healh: 60,
            indicator: 1,
        },
        pos: {
            x: 0,
            y: 0,
        },
        bullet: {
            damage: 32,
            speed: 13,
            size: {
                x: 13,
                y: 10,
            },
            angle: 0,
            fireRate: 2,
            lastFire: 0,
            pos : {
                x : 0,
                y : 0,
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