/* global location */

var EventEmitter = require('events').EventEmitter

var Store = require('pouchdb-hoodie-store')
var humbleLocalStorage = require('humble-localstorage')
var randomString = require('random-string')

var taskStoreId = humbleLocalStorage.getItem('_taskStoreId')
if (!taskStoreId) {
  taskStoreId = randomString({length: 7}).toLowerCase()
  humbleLocalStorage.setItem('_userId', taskStoreId)
}

var CustomStore = Store.defaults({
  remoteBaseUrl: location.origin + '/api/user/'
})
global.task = new TaskStore(taskStoreId)

module.exports = CustomStore

function TaskStore (id) {
  var store = new CustomStore(taskStoreId)
  var state = {
    id: id,
    store: store
  }

  store.connect()
  store.on('error', function (error) {
    debugger
  })
  window.store = store

  return getTaskApi.bind(null, state)
}

function getTaskApi (state, type) {
  var emitter = new EventEmitter()

  return {
    start: function (attributes, options) {
      return state.store.add({
        type: type,
        attributes: attributes
      })

      .then(function (task) {
        emitter.emit('start', task)
        return new Promise(function (resolve, reject) {
          state.store.on('change', handleStoreChange)

          function handleStoreChange (eventName, changedTask, options) {
            if (task.id !== changedTask.id) return

            if (!options || !options.remote) return

            if (eventName === 'remove') {
              emitter.emit('success', changedTask)
              return resolve(changedTask.attributes)
            }

            if (changedTask.error) {
              // EventEmitter throws an Error if an "error" event
              // is emitted without a listener.
              try {
                emitter.emit('error', changedTask.error, changedTask)
              } catch (error) {}
              return reject(new Error(changedTask.error))
            }

            console.log('unhandled task change', task)
          }
        })
      })
    },
    on: emitter.on.bind(emitter),
    one: emitter.once.bind(emitter)
  }
}
