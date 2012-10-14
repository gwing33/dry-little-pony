var _       = require('underscore')
  , http    = require('http')
  , cheerio = require('cheerio');

function loadBody(resp, callback) {
  resp.setEncoding('utf8')

  var body = [];
  resp.on('data', function(chunk) {
    body.push(chunk)
  })

  resp.on('end', function() {
    resp.body = body.join('')
    callback(null, resp)
  })
}

function getHTML(href, callback) {
  http.get(href, function(resp) {
    if (resp.statusCode !== 200) {
      return callback(resp)
    }

    loadBody(resp, callback)
  })
}

function parseSearch(body, callback) {
  var $ = cheerio.load(body);

  var links = _.map($('.row'), function(el) {
    return $(el).find('a').first().attr('href')
  })

  callback(null, links)
}

function search(query, callback) {
  var urlBase = 'http://phoenix.craigslist.org/search/?catAbb=ppp&query=';

  getHTML(urlBase+encodeURIComponent(query), function(err, resp) {
    if (err) {
      return callback(err)
    }

    parseSearch(resp.body, callback)
  })
}

var __commentRe = /<!--[\s\S]*?-->/g
function parsePage(html, callback) {
  var $     = cheerio.load(html)
    , title = $('h2').text().trim()
    , body  = $('#userbody').text()
    , end   = body.lastIndexOf('Location:');

    body = body.substring(0, end).replace(__commentRe, '').trim()

    callback(null, {
      title: title,
      body:  body,
      html:  html
    })
}

function getPage(url, callback) {
  getHTML(url, function(err, resp) {
    if (err) {
      return callback(err)
    }

    parsePage(resp.body, callback)
  })
}

module.exports = {
  search: search,
  getPage: getPage
}

// Example:
//
// search('test', function(err, links) {
//   if (err || !links.length) {
//     return console.log(err)
//   }

//   getPage(links[0], function(err, data) {
//     console.log(data.title)
//     console.log(data.body)
//   })
// })
