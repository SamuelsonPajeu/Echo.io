const io = require('socket.io')();
const { initGame, spawnPlayer, gameLoop, keyDown, keyUp } = require('./game');
const { makeid } = require('./utils');
const { FPS } = require('./constants');

const state = {};
const clientRooms = {};

io.on('connection', client => {
    

    
    client.on('newGame', handleNewGame);
    client.on('keyDown', handleKeyDown);
    client.on('keyUp', handleKeyUp);


    function handleKeyDown(command) {
        // console.log(` > [handleKeyDown]<Server> Tecla pressionada: ${command} Pelo jogador: ${client.id}`);
        Object.keys(clientRooms).forEach(key => {
            const room = clientRooms[key];
            if (room.players.includes(client.id)){
                // console.log(` > [getRoomNameByClientId]<Server> Encontrou a sala ${room.roomName} para o cliente ${client.id}`);
                keyDown(state[room.roomName], client.id, command);

            }});
        

    }

    function handleKeyUp(command) {
        Object.keys(clientRooms).forEach(key => {
            const room = clientRooms[key];
            if (room.players.includes(client.id)){
                keyUp(state[room.roomName], client.id, command);
        }});

    }

    function handleNewGame(selected) {
        console.log(' > [handleNewGame] Tentando conectar jogador');
        
        //Search for a room with available slots
        console.log(' > [handleNewGame] Procurando por salas existentes com jogadores');

        // clientRooms.forEach(room => {
        //     console.log(room.players);
        // });
            // JOIN GAME
        let checkRoom = false;
        Object.keys(clientRooms).forEach(key => {
            room = clientRooms[key];


            if (room.players.length < 10) {
                if (room.players.length === 0) {
                    //Delete room
                    clientRooms.splice(clientRooms.indexOf(room), 1);
                }
                else
                {
                    console.log(' > [handleNewGame] Encontrada sala com espaço para jogadores, conectando...');
                    state[room.roomName].players[client.id] = (spawnPlayer({'shipStyle' : selected, 'id' : client.id}));
                    room.players.push(client.id);
                    client.join(room.roomName);
                    client.emit('init', room.roomName);
                    checkRoom = true;
                    return;
                }
            }
        });
        
        //If there is no room, create a new one
        if (!checkRoom) {
            // CREATE GAME
            console.log(' > [handleNewGame] Nenhuma sala encontrada, criando uma nova');
            let roomName = makeid(5);
            clientRooms[roomName] = {
                    roomName : roomName,
                    players : [client.id],
                }
            
            client.emit('gameCode', roomName);

            state[roomName] = initGame({'shipStyle' : selected, 'id' : client.id});

            client.join(roomName);
            client.number = 1;
            client.emit('init', roomName);
            // console.log(clientRooms);
            // console.log(io.sockets.in(roomName).rooms);
            startGameInterval(roomName);
        }

        
    }

    
});

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        // console.log(' > [startGameInterval] Atualizando estado do jogo');
        gameState = state[roomName];
        gameLoop(gameState);
        emitGameState(roomName, gameState);
        // console.log(gameState.players);

    }, 1000 / FPS);
}

function emitGameState(room, gameState){
    io.sockets.in(room).emit('gameState', JSON.stringify(gameState));
}


io.listen(3000);