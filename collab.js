
var clone = require('clone');

var newStory = (function(){
    var library = [
        [],
        [],
        []
    ];

    var i = 0;

    return function ns (){
        return clone(library[++i % library.length], false);
    }
})()

var archive = [],
    activeCollab = new Collab();

function Collab (story){
    this.story = newStory();
    this.blocksSent = 0;
}

var onComplete = function(){};

module.exports = {
    setCompleteCB: function(cb){
        onComplete = cb;
    },
    getSentence: function(){
        return activeCollab.nextSentence();
    },
    saveSentence: function(data, user){
        activeCollab.story.blocks[data.id][1].value = data.value;
        activeCollab.story.blocks[data.id][1].value = data.user;
        activeCollab.blockComplete++;
        if (activeCollab.blockComplete == activeCollab.story.length){
            onComplete(activeCollab.story);
        }
        archive.push(activeCollab.story);
        activeCollab = new Collab();
    }
}