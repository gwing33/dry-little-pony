var madlib_box = $('.madlib-box');
var loading = $('.loading');

var snippet = Handlebars.compile($('#snippet').html());
var complete = Handlebars.compile($('complete').html());
var active_users = Handlebars.compile($('active_users').html());

var new_sentence;

var socket = io.connect('http://localhost');

socket.on('dontknowyou', function (data) {
  console.log('What is your name?');
  //socket.emit('meetme', {name: 'Johnny'});
});

socket.on('story-complete', function(story){
    if(!story) return;

    madlib_box.html( complete(sentence) );
    
    /*{{#each madlibs}}
          {{#if typeof this === 'string'}}
            {{this}}
          {{else}}
            <span>People
              <i>Noun by: Littly Timmy</i>
            </span>
          {{/if}}
        {{/each}}*/
    madlib_box.html( snippet({snippet: html}) );
    
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
});

// get sentence
//socket.emit('need-sentence');
socket.on('new-sentence', function(sentence){
    if(!sentence) return;

    var html = '';


    /*
    {{#each madlibs}}
      {{#if typeof this === 'String'}}
        {{this}}
      {{else}}
    <span>People
      <i>Noun by: Littly Timmy</i>
    </span>
    {{/if}}
    {{/each}}
    */

    new_sentence = sentence;
    madlib_box.html( snippet({snippet: html}) );
});

// parts filled
submitSentence = function() {
    socket.emit('usethis', function(){

    });
};


$('.enter-user-name input[type="button"]').click(function() {
    $('.enter-user-name').hide();
    loading.show();
    socket.emit('meetme', {name: $('#username').val()});
    socket.emit('need-sentence');
});


$(document).on('click', '.madlib-snippet input[type="button"]', function() {
    submitSentence();
});

$(document).on('click', '.madlib-complete input[type="button"]', function() {
    console.log('reset');
});
