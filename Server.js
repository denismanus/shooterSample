var io = require('socket.io')(process.env.PORT||3000); 
var shortid = require('shortid');

var players = [];
var bullets = [];

io.on('connection', function(socket){
    var thisPlayerId = shortid.generate();
    var thisPlayerTeam = Math.floor(Math.random() * 2);
    socket.emit('register', { id: thisPlayerId, teamId: thisPlayerTeam});
    socket.broadcast.emit('spawn', { id: thisPlayerId, teamId: thisPlayerTeam });

    var player = {
        id: thisPlayerId,
        teamId: thisPlayerTeam
    };

    players[thisPlayerId] = player;
    socket.broadcast.emit('requestPosition');
    socket.broadcast.emit('requestDestination');
    
    for(var playerId in players){
        
        if(playerId == thisPlayerId)
            continue;
        
        socket.emit('spawn', players[playerId]);
        console.log('sending spawn to new player for id: ', playerId);
    };

    socket.on('move', function(data){
        //data.id = thisPlayerId;
        console.log('client moved', data.x)
        console.log('client id', thisPlayerId)
        socket.broadcast.emit('move', data);
    });

    socket.on('shoot', function(data){
        data.teamId = thisPlayerTeam;
        socket.broadcast.emit('shoot', data);
    });

    socket.on('updatePosition', function(data) {
        console.log("update position: ", data.y);
        data.id = thisPlayerId;
        
        socket.broadcast.emit('updatePosition', data);
    });

    socket.on('updateDestination', function(data) {
        data.id = thisPlayerId;
        
        socket.broadcast.emit('updateDestination', data);
    });  

    socket.on('respawn', function(data){
        thisPlayerId = shortid.generate();
        thisPlayerTeam = Math.floor(Math.random() * 2);
        socket.emit('register', { id: thisPlayerId, teamId: thisPlayerTeam});
        socket.broadcast.emit('spawn', { id: thisPlayerId, teamId: thisPlayerTeam });
    
        var player = {
            id: thisPlayerId,
            teamId: thisPlayerTeam
        };
    
        players[thisPlayerId] = player;
        
        // for(var playerId in players){
            
        //     if(playerId == thisPlayerId)
        //         continue;
            
        //     socket.emit('spawn', players[playerId]);
        //     console.log('sending spawn to new player for id: ', playerId);
        // };
    })

    socket.on('killPlayer', function(data){
        delete players[data.playerId];
        socket.broadcast.emit('playerKilled', { id: data.playerId });
    });

    socket.on('disconnect', function(data){
        
        delete players[thisPlayerId];
        
        socket.broadcast.emit('disconnected', { id: thisPlayerId });
	});
})
