module.exports = hapiCouchDbStore
hapiCouchDbStore.attributes = {
  name: 'couchdb-task-standalone'
}

var PouchDB = require('pouchdb')

var spawnPouchdbServer = require('spawn-pouchdb-server')

var serverTaskPlugin = require('@hoodie/task-server')
var clientRoutes = require('./lib/routes/client')

function hapiCouchDbStore (server, options, next) {
  server.dependency('h2o2', function (server, next) {
    server.route(clientRoutes)
    server.register({
      register: serverTaskPlugin
    }, {
      routes: {
        prefix: '/api'
      }
    }, function (error) {
      if (error) {
        throw error
      }
    })
    next()
  })

  server.log(['couchdb-task'], 'Starting PouchDB Server...')
  spawnPouchdbServer({
    port: 1234,
    config: {
      admins: {
        admin: 'secret'
      }
    }
  }, function (error, pouch) {
    if (error) return next(error)

    var couchUrl = 'http://admin:secret@localhost:1234'
    server.log(['couchdb-task'], 'PouchDB Server ready at localhost:1234/_utils')
    server.expose('couchUrl', couchUrl)
    server.expose('dbUrl', couchUrl + '/tasks')
    next()

    var db = new PouchDB('http://admin:secret@localhost:1234/tasks')
    db.changes({
      include_docs: true,
      live: true,
      since: 'now'
    })
      .on('change', function (change) {
        if (change.doc._rev.slice(0, 2) === '1-') {
          console.log('change in %s', change.id)
          console.log(change.doc.attributes)
          if (change.doc.attributes.error) {
            change.doc.error = change.doc.attributes.error
            console.log('setting error on %s', change.id)
          } else {
            change.doc.attributes.funky = 'fresh!'
            change.doc._deleted = true
            console.log('deleting %s', change.id)
          }
          db.put(change.doc).catch(console.error.bind(console))
          // console.log('deleting %s', change.id)
          // db.remove(change.doc)
        }
      })
      .on('create', function (doc) {
        console.log(doc)
      })
  })
}
