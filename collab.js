
var clone = require('clone'),
    log = require('util').log,
    Q = require('q'),
    clsearch = require('./clsearch');

var getNewStory = (function(){
    var terms = [
        'desert',
        'pony',
        'geek',
        'web',
        'internet'
    ];

    var i = -1;

    return function ns (){
        var q = Q.defer();
        log('sending story '+(i+1));
        i = ( i + 1 ) % terms.length
        process.nextTick(function search (){
            clsearch.getMadLib(terms[i], function(err, data){
                if (err){
                    r.reject(err);
                } else {
                    q.resolve(data);
                }
            })
        })
        return q.promise;
    }
})()

function Collab (story){
    log('new collab');
    var collab = this;
    getNewStory().then(function(data){
        collab.story = data.madlibs;
        collab.blocksSent = 0;
        collab.onReady.forEach(function(cb){
            cb();
        });
    });
}

Collab.prototype = {
    nextSentence: function(){
        var q = Q.defer(),
            act = function(){
                if (me.blocksSent >= me.story.length){
                    log('all of the sentences have been sent')
                    q.resolve(false);
                } else {
                    log('sending sentence '+me.blocksSent)
                    q.resolve(me.story[me.blocksSent])
                    me.blocksSent++;
                }
            },
            me = this;
        if (this.ready){
            act()
        } else {
            this.onReady.push(act)
        }
        return q.promise;
    },
    ready: false,
    onReady: []
}

var onComplete = function(){};

var archive = [],
    activeCollab = new Collab()

module.exports = {
    setCompleteCB: function(cb){
        onComplete = cb;
    },
    getSentence: function(){
        return activeCollab.nextSentence()
    },
    saveSentence: function(data, user){
        data.forEach(function(chunk){
            if (typeof chunk === 'object'){
                chunk.user = user.name;
            }
        })
        activeCollab.story[data.id] = data;
        activeCollab.blockComplete++;
        if (activeCollab.blockComplete == activeCollab.story.length) {
            onComplete(activeCollab.story);
            archive.push(activeCollab.story);
            activeCollab = new Collab()
        }
    }
}