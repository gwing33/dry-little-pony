var _   = require('underscore')
  , pos = require('pos');

var __validPOS = {
  'JJ':  'Adjective',
  'NN':  'Noun',
  'NNP': 'Proper noun',
  'RB':  'Adverb',
  'VB':  'Verb'
}

var wordTokenize = (function() {
  var lexer = new pos.Lexer()
  return function(text) {
    return lexer.lex(text)
  }
})()

var tagWords = (function() {
  var tagger = new pos.Tagger()

  function unpack(word) {
    return {
      text: word[0],
      tag:  word[1]
    }
  }

  return function(words) {
    return _.map(tagger.tag(words), unpack)
  }
})()

function isIntresting(word) {
  return __validPOS.hasOwnProperty(word.tag)
}

function getIntresting(taggedWords) {
  return _.filter(taggedWords, isIntresting)
}

function randomizer(items) {
  items = items.slice(0)
  return function() {
    var index = 0 ^ (Math.random() * items.length)
    return items.splice(index, 1)[0]
  }
}

function markPOS(taggedWords, percent) {
  var totalToMark = 0 ^ (percent * taggedWords.length)
    , getRandom   = randomizer(taggedWords)
    , i, word;

  for (i = 0; i < totalToMark; i++) {
    word     = getRandom()
    word.pos = __validPOS[word.tag]
  }
}

var spacingFix = (function() {
  var nospaceRe = / *([.?!,:;])/g
  return function(text) {
    return text.replace(nospaceRe, '$1')
  }
})()

function formatSentancePart(taggedWords) {
  return spacingFix(_.pluck(taggedWords, 'text').join(' '))
}

function checkCurrentMadlib(current, madlib) {
  if (current.length) {
    madlib.push(formatSentancePart(current))
    return []
  }
  return current
}

function formatTaggedWords(taggedWords) {
  var len     = taggedWords.length
    , madlib  = []
    , current = []
    , i, word;

  for (i = 0; i < len; i++) {
    word = taggedWords[i]

    if (word.pos) {
      current = checkCurrentMadlib(current, madlib)
      madlib.push({type: word.pos})
    } else {
      current.push(word)
    }
  }

  checkCurrentMadlib(current, madlib)
  return madlib
}

function _generate(taggedWords) {
  markPOS(getIntresting(taggedWords), 0.5)
  return formatTaggedWords(taggedWords)
}

function generate(text) {
  var words       = wordTokenize(text)
    , taggedWords = tagWords(words);

  return _generate(taggedWords)
}

function checkCurrentChunk(current, chunks, minIntresting) {
  var numIntresting = getIntresting(current).length
  if (numIntresting < minIntresting) {
    return current
  }

  chunks.push(current)
  return []
}

function splitChunks(taggedWords, minIntresting) {
  var chunks  = []
    , current = []
    , validSentence = false
    , i, word;

  for (i = 0; i < taggedWords.length; i++) {
    word = taggedWords[i]

    if (word.tag === '.') {
      validSentence = true
      current.push(word)
      continue
    }

    if (validSentence) {
      current       = checkCurrentChunk(current, chunks, minIntresting)
      validSentence = false
    }

    current.push(word)
  }

  var lastChunk = chunks[chunks.length-1]
  _.each(current, function(word) {
    lastChunk.push(word)
  })

  return chunks
}

function generateChunks(text, minIntresting) {
  var words       = wordTokenize(text)
    , taggedWords = tagWords(words)
    , chunks      = splitChunks(taggedWords, minIntresting);

  return _.map(chunks, _generate)
}

function prettyFormat(madlib) {
  return spacingFix(_.map(madlib, function(part) {
    if (part.type) {
      return "[" + part.type + "]"
    }
    return part
  }).join(' '))
}

module.exports = {
  generate:       generate,
  generateChunks: generateChunks,
  prettyFormat:   prettyFormat
}
