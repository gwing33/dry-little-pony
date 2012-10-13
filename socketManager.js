var collab = require('./collab.js'),
    connections = [],
    log = require('util').log;

collab.setCompleteCB(function(story){
    connections.forEach(function(socket, i, arr){
        socket.emit('story-complete', story);
    });
});

function Socket(socket){

    var user = null;
    this.emit = socket.emit;

    socket.on('disconnect', function(){
        connections.forEach(function(s, i, arr){
            if (s === socket){
                arr.splice(i, 1);
            }
        })
    });

    socket.on('meetme', function(data){
        user = {
            name: data.name
        }
    })

    socket.on('need-sentence', function(){
        log('I need a sentence')
        collab.getSentence().then(function(block){
            socket.emit('new-sentence', block);
        });
    });

    socket.on('usethis', function(sentence){
        collab.saveSentence(sentence, user.name);
    })

    socket.on('needuserlist', function(){
        socket.emit('userlist', collab.allUserNames)
    })

    socket.emit('dontknowyou');
}

module.exports = function connect(io){
    io.sockets.on('connection', function (sock) {
        connections.push(new Socket(sock));
    });
}