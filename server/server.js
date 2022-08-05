const io = require('socket.io')();
const { initGame, spawnPlayer, checkPlayerAlive, gameLoop, keyDown, keyUp } = require('./game');
const { makeid } = require('./utils');
const { FPS } = require('./constants');
const { ENG, PTBR } = require('./forbidden');

const state = {};
const clientRooms = {};
const MAXPLAYERPERROOM = 2;
const MAXROOMS = 10;

io.on('connection', client => {
    

    client.on('disconnect', handleDisconect);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);
    client.on('keyDown', handleKeyDown);
    client.on('keyUp', handleKeyUp);
    client.on('respawn', handleRespawn);


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

    function handleJoinGame(args) {
        console.log('-----------------------------------------------------');
        console.log(' > [handleJoinGame] Validando Nickname do Jogador');
        if (ENG.find(element => {return element.toLowerCase() === args.playerName.toLowerCase()}) || PTBR.find(element => {return element.toLowerCase() === args.playerName.toLowerCase()})){
            console.log(' > [handleJoinGame] Nickname Proibido, barrando conexão...');
            client.emit('forbiddenName');
            return;
        }

        console.log(' > [handleJoinGame] Tentando conectar jogador');

        if (!clientRooms[args.roomId]){
            console.log(' > [handleJoinGame]<Server> Sala não existe...');
            client.emit('roomDoesNotExist');
            return;
        } else {
            if (clientRooms[args.roomId].players.length >= MAXPLAYERPERROOM){
                console.log(' > [handleJoinGame]<Server> Sala cheia...');
                client.emit('roomFull');
                return;
            } else {
                console.log(' > [handleJoinGame] Sala disponível, conectando...');
                room = clientRooms[args.roomId];
                state[room.roomName].players[client.id] = (spawnPlayer({'shipStyle' : args.selected, 'id' : client.id, 'playerName': args.playerName}));
                room.players.push(client.id);
                client.emit('init', { roomId: room.roomName, playerId: client.id  });
                client.join(room.roomName);
                console.log(` > [handleJoinGame] Jogador: Id:${client.id} Nome: ${args.playerName} conectado a sala existente: ${room.roomName}`);
                return;
            }
        }

    }

    function handleRespawn(args) {
        console.log(' > [handleRespawn] Respawnando jogador');
        room = clientRooms[args.roomId];
        state[room.roomName].players[client.id] = (spawnPlayer({'shipStyle' : args.selected, 'id' : client.id, 'playerName': args.playerName}));
    }

    function handleNewGame(args) {
        console.log('-----------------------------------------------------');
        console.log(' > [handleNewGame] Validando Nickname do Jogador');
        if (ENG.find(element => {return element.toLowerCase() === args.playerName.toLowerCase()}) || PTBR.find(element => {return element.toLowerCase() === args.playerName.toLowerCase()})){
            console.log(' > [handleNewGame] Nickname Proibido, barrando conexão...');
            client.emit('forbiddenName');
            return;
        }

        console.log(' > [handleNewGame] Tentando conectar jogador');

        
        //Search for a room with available slots
        console.log(' > [handleNewGame] Procurando por salas existentes com jogadores');

        // clientRooms.forEach(room => {
        //     console.log(room.players);
        // });
            // JOIN GAME
        let checkRoom = false;

        

        for (i in clientRooms){
            room = clientRooms[i];
            if (room.players.length < MAXPLAYERPERROOM) {
                if (room.players.length === 0) {
                    delete state[room.roomName];
                    delete clientRooms[i];
                }
                else
                {
                    console.log(' > [handleNewGame] Encontrada sala com espaço para jogadores, conectando...');
                    state[room.roomName].players[client.id] = (spawnPlayer({'shipStyle' : args.selected, 'id' : client.id, 'playerName': args.playerName}));
                    room.players.push(client.id);
                    client.emit('init', { roomId: room.roomName, playerId: client.id  });
                    client.join(room.roomName);
                    console.log(` > [handleNewGame] Jogador: Id:${client.id} Nome: ${args.playerName} conectado a sala existente: ${room.roomName}`);
                    checkRoom = true;
                    break;
                }
            }
        }

        // Object.keys(clientRooms).forEach(key => {
        //     room = clientRooms[key];

        //     if (room.players.length < MAXPLAYERPERROOM) {
        //         if (room.players.length === 0) {
        //             delete state[room.roomName];
        //             delete clientRooms[key];
        //         }
        //         else
        //         {
        //             console.log(' > [handleNewGame] Encontrada sala com espaço para jogadores, conectando...');
        //             state[room.roomName].players[client.id] = (spawnPlayer({'shipStyle' : args.selected, 'id' : client.id, 'playerName': args.playerName}));
        //             room.players.push(client.id);
        //             client.emit('init', { roomId: room.roomName, playerId: client.id  });
        //             client.join(room.roomName);
        //             console.log(` > [handleNewGame] Jogador: Id:${client.id} Nome: ${args.playerName} conectado a sala existente: ${room.roomName}`);
        //             checkRoom = true;
        //             return;
        //         }
        //     }
        // });
        
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

            state[roomName] = initGame({'shipStyle' : args.selected, 'id' : client.id, 'playerName': args.playerName});

            client.join(roomName);
            client.number = 1;
            client.emit('init', { roomId: roomName, playerId: client.id  });
            
            console.log(` > [handleNewGame] Iniciando o jogo na sala ${roomName} com o player Id: ${client.id} Nome: ${args.playerName}`);
            startGameInterval(roomName);
        }
    }

    function handleDisconect() {
        console.log(` > [handleDisconect]<Server> Cliente desconectado ${client.id}.`);
        if (client.id){
            
            Object.keys(clientRooms).forEach(key => {
            const room = clientRooms[key];
            if (room.players.includes(client.id)){
                console.log(` > [handleDisconect]<Server> Removendo o cliente: ${client.id} da sala: ${room.roomName}`);
                room.players.splice(room.players.indexOf(client.id), 1);
                delete state[room.roomName].players[client.id];
                if (room.players.length === 0) {
                    //Delete room
                    console.log(` > [handleDisconect]<Server> Sala vazia, Removendo sala: ${room.roomName}`);
                    delete state[room.roomName];
                    delete clientRooms[key];
                }

            }});
        } else {
            return;
        }

    }

    
});



function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        // console.log(' > [startGameInterval] Atualizando estado do jogo');
        gameState = state[roomName];

        deathPlayer = checkPlayerAlive(gameState);
        // console.log(` > [startGameInterval] Jogador morto: ${deathPlayer}`);
        if(deathPlayer){
            console.log(' > [startGameInterval]<Server> Jogador morreu:', deathPlayer.playerName);
            io.sockets.in(roomName).emit('gameOver', JSON.stringify( {id : deathPlayer.playerId}));
            delete gameState.players[deathPlayer.playerId];
            
        }

        gameLoop(gameState);
        emitGameState(roomName, gameState);
        


    }, 1000 / FPS);
}

function emitGameState(room, gameState){
    io.sockets.in(room).emit('gameState', JSON.stringify(gameState));
}


io.listen(3000);