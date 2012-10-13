var http = require('http')
  , cheerio = require('cheerio');

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

function parseText(title, body, callback) {
  callback(title, body)
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


// getMadLib('play', function(title, body) {
//   console.log(title)
//   console.log(body)
// })
