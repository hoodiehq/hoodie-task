var Hapi = require('hapi')
var PouchDB = require('pouchdb')
var memdown = require('memdown')
var inert = require('inert')
var path = require('path')
var EventEmitter = require('events').EventEmitter
var hapiStore = require('../server')

var browserify = require('browserify')([], {
  standalone: 'hoodie'
})

browserify.require(path.join(__dirname, 'client.js'))

var bundleEE = new EventEmitter()
var STOREJS = null

bundleEE.on('done', function (error, buffer) {
  if (error) throw error
  STOREJS = buffer
})
browserify.bundle(bundleEE.emit.bind(bundleEE, 'done'))

var server = new Hapi.Server({})

server.connection({
  port: 4663
})

server.route({
  method: 'GET',
  path: '/hoodie/client.js',
  handler: function (request, reply) {
    if (!STOREJS) {
      return bundleEE.once('done', function (error, buffer) {
        if (!error) reply(buffer).type('application/javascript')
      })
    }
    reply(STOREJS).type('application/javascript')
  }
})

server.register(inert, function (err) {
  if (err) throw err
})

server.register({
  register: hapiStore,
  options: {
    PouchDB: PouchDB.defaults({
      db: memdown
    })
  }
}, function (error) {
  if (error) throw error
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply.file(path.join(__dirname, '..', 'public', 'index.html'))
    }
  })
})

server.start(function () {
  console.log('Server running at %s', server.info.uri)
})
