#!/usr/bin/env node

var corsHeaders = require('hapi-cors-headers')
var Hapi = require('hapi')
var path = require('path')

var plugin = require('../index')

var server = new Hapi.Server()
server.connection({ port: 3000 })

server.register({
  register: require('inert')
}, function (error) {
  if (error) throw error
})

// serve demo app at route path
server.route({
  method: 'GET',
  path: '/{path*}',
  handler: {
    directory: {
      path: path.resolve(__dirname, '../demo')
    }
  }
})

server.register({
  register: require('good'),
  options: {
    reporters: [{
      reporter: 'good-console',
      events: { error: '*', log: '*', request: '*', response: '*', wreck: '*' }
    }]
  }
}, function (err) {
  if (err) {
    console.error(err)
  }
})

server.register({
  register: require('h2o2')
}, function (error) {
  if (error) throw error
})

server.register({
  register: plugin
}, function (error) {
  if (error) throw error

  // enable CORS
  server.ext('onPreResponse', corsHeaders)

  server.start(function () {
    console.log('Server running at:', server.info.uri)
  })
})

