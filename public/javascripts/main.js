var socket = io.connect('http://localhost');
    socket.on('dontknowyou', function (data) {
      console.log('What is your name?');
      socket.emit('meetme', {name: 'Johnny'});
    });

    socket.on('story-complete', function(story){
        console.log('this is the story', story);
        /*
            [
                [   // sentence
                    'I want',
                    {
                        type: 'noun',
                        value: 'pics',
                        user: 'Johhny'
                    },
                    'in my mouth.'
                ],
                [
                    'I want',
                    {
                        type: 'noun',
                        value: 'pics',
                        user: 'Johhny'
                    },
                    'in my mouth.'
                ],
                ...
            ]
        */
    })

    // get sentence
    socket.emit('need-sentence');
    socket.on('new-sentence', function(sentence){

    })

    // parts filled
    submitSentence = function(){
        socket.emit('usethis', ['start', {}, 'end'])
    }

    
