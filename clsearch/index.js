var http = require('http')
  , cheerio = require('cheerio')
  , pos = require('pos');

function loadBody(resp, callback) {
  resp.setEncoding('utf8')

  var body = [];
  resp.on('data', function(chunk) {
    body.push(chunk)
  })

  resp.on('end', function() {
    callback(body.join(''))
  })
}

function parseSearch(body, callback) {
  var $ = cheerio.load(body)
    , href = $('.row a')[0].attribs.href;

  http.get(href, function(resp) {
    if (resp.statusCode !== 200) {
      return callback(err)
    }

    loadBody(resp, function(body) {
      parsePage(body, callback)
    })
  })
}

var __commentRe = /<!--[\s\S]*?-->/g
function parsePage(body, callback) {
  var $ = cheerio.load(body)
    , title = $('h2').text().trim()
    , body  = $('#userbody').text();

    var end = body.lastIndexOf('Location:');
    body = body.substring(0, end).replace(__commentRe, '').trim()

    parseText(title, body, callback)
}

function splitSentences(taggedWords) {
  var sentences = []
    , current = []
    , validSentence = false
    , word
    , i;

  for (i = 0; i < taggedWords.length; i++) {
    word = taggedWords[i]
    current.push(word)

    if (word[1] !== '.' && validSentence) {
      sentences.push(current)
      current = []
      validSentence = false
    } else {
      validSentence = true
    }
  }

  if (validSentence) {
    sentences.push(current)
  }

  return sentences
}

function splitChunks(sentences) {
  var chunks = []
    , current = []
    , i, j, sentence;

  for (i = 0; i < sentences.length; i++) {
    sentence = sentences[i];

    for (j = 0; j < sentence.length; j++) {
      current.push(sentence[j])
    }

    if (current.length >= 10) {
      chunks.push(current)
      current = []
    }
  }

  if (current.length) {
    chunks.push(current)
  }

  return chunks
}

var __pos = {
  'JJ': 'Adjective',
  'NN': 'Noun',
  'NNP': 'Proper noun',
  'VB': 'Verb'
};

function generateMadlib(chunk) {
  var i, word, attempts
  , inputs = 0
  , madlib = []
  , current = [];

  for (attempts = 0; attempts < chunk.length; attempts++) {
    if (inputs >= (chunk.length / 5)) {
      break
    }

    i =  0^(Math.random()*chunk.length)
    word = chunk[i]

    if (word.pos) {
      continue
    }

    word.pos = __pos[word[1]]
    if (word.pos) {
      inputs++
    }
  }

  for (i = 0; i < chunk.length; i++) {
    word = chunk[i]
    if (word.pos) {
      if (current.length) {
        madlib.push(current.join(' '))
        current = []
      }
      madlib.push({type: word.pos})
    } else {
      current.push(word[0])
    }
  }
  if (current.length) {
    madlib.push(current.join(' '))
    current = []
  }

  return madlib
}

function parseText(title, body, callback) {
  var words = new pos.Lexer().lex(body)
    , taggedWords = new pos.Tagger().tag(words)
    , sentences = splitSentences(taggedWords)
    , chunks = splitChunks(sentences)
    , madlibs = [], i;

  for (i=0; i<chunks.length; i++) {
    madlibs.push(generateMadlib(chunks[i]))
  }

  callback(null, {
    title: title,
    body: body,
    taggedWords: taggedWords,
    madlibs: madlibs
  })
}

getMadLib = function(query, callback){
  var url = 'http://phoenix.craigslist.org/search/?catAbb=ppp&query=';
  url += encodeURIComponent(query);

  http.get(url, function(resp) {
    if (resp.statusCode !== 200) {
      return callback(err)
    }

    loadBody(resp, function(body) {
      parseSearch(body, callback)
    })
  })
}


exports.getMadLib = getMadLib;


// getMadLib('stupid', function(err, result) {
//   console.log(result.title, '\n')
//   console.log(result.body, '\n')
//   console.log(result.taggedWords)

//   for (var i=0; i<result.madlibs.length; i++) {
//     console.log(JSON.stringify(result.madlibs[i]), '\n')
//   }
// })


// if (process.argv.length > 2) {
//   getMadLib(process.argv[2], function(err, result) {
//     console.log('Title:', result.title, '\n')

//     var buffer = []
//       , madlib
//       , part
//       , i, j;

//     for (var i=0; i<result.madlibs.length; i++) {
//       madlib = result.madlibs[i]
//       for (var j=0; j<madlib.length; j++) {
//         part = madlib[j]
//         if (part.type) {
//           buffer.push("[" + part.type + "]")
//         } else {
//           buffer.push(part)
//         }
//       }
//     }

//     console.log(buffer.join(' '), '\n')
//   })
// }
