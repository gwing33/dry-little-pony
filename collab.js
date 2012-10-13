
var clone = require('clone');

var log = require('util').log;

var newStory = (function(){
    var library = [
        [], [], []
    ];

    var i = -1;

    return function ns (){
        log('sending story '+(i+1))
        return clone(library[++i % library.length], false);
    }
})()

function Collab (story){
    log('new collab');
    this.story = newStory();
    this.blocksSent = 0;
}

Collab.prototype = {
    nextSentence: function(){
        var s
        if (this.blocksSent >= this.story.length){
            log('all of the sentences have been sent')
            s = false;
        } else {
            log('sending sentence '+this.blocksSent)
            s = this.story[this.blocksSent]
            log(s)
            this.blocksSent++;
        }
        return s;
    }
}

var onComplete = function(){};

var archive = [],
    activeCollab = new Collab()

module.exports = {
    setCompleteCB: function(cb){
        log('story complete')
        onComplete = cb;
    },
    getSentence: function(){
        return activeCollab.nextSentence()
    },
    saveSentence: function(data, user){
        activeCollab.story[data.id][1].value = data.value
        activeCollab.story[data.id][1].value = data.user
        activeCollab.blockComplete++
        if (activeCollab.blockComplete == activeCollab.story.length) {
            onComplete(activeCollab.story)
        }
        archive.push(activeCollab.story)
        activeCollab = new Collab()
    },
    
}