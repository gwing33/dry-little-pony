if (process.argv.length < 3) {
  console.log('Usage:', process.argv[0], process.argv[1], '<query>')
  process.exit(1)
}

var _          = require('underscore')
  , craigslist = require('../craigslist')
  , madlib     = require('../madlib');

craigslist.search(process.argv[2], function(err, links) {
  if (err || !links.length) {
    return console.log(err || 'No pages found!')
  }

  craigslist.getPage(links[0], function(err, result) {
    var chunks = madlib.generateChunks(result.body, 2)

    console.log('Title:', result.title, '\n')

    _.each(chunks, function(ml) {
      console.log(madlib.prettyFormat(ml), '\n')
    })
  })
})
