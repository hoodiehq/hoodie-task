var EventEmitter = require('events').EventEmitter
var path = require('path')

var browserify = require('browserify')([], {
  standalone: 'Task'
})
browserify.require(path.resolve(__dirname, '../../client'))

var bundleEE = new EventEmitter()
var STOREJS = null

bundleEE.on('done', function (error, buffer) {
  if (error) throw error
  STOREJS = buffer
})
browserify.bundle(bundleEE.emit.bind(bundleEE, 'done'))

module.exports = {
  method: ['GET'],
  path: '/task.js',
  handler: function (request, reply) {
    if (!STOREJS) {
      return bundleEE.once('done', function (error, buffer) {
        if (!error) reply(buffer).type('application/javascript')
      })
    }
    reply(STOREJS).type('application/javascript')
  }
}
