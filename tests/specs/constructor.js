/* global task store */

var test = require('tape')

require('../../client/')

test('task(type)', function (t) {
  t.plan(1)

  var taskApi = task('test')

  t.is(typeof taskApi, 'object', 'is a constructor')
})

test('taskApi.start', function (t) {
  t.plan(1)

  var taskApi = task('test')

  t.is(typeof taskApi.start, 'function', 'has "start" method')
})

test('taskApi.on', function (t) {
  t.plan(3)

  var taskApi = task('test')
  var events = []

  taskApi.on('start', function (task) {
    events.push(task)
  })

  taskApi.start({
    property: 'value'
  })

  setTimeout(function () {
    t.is(typeof taskApi.on, 'function', 'has "on" method')
    t.is(events.length, 1, 'emits one "start" event')
    t.is(events[0].attributes.property, 'value', 'emits correct task')
  }, 500)
})

test('taskApi.one', function (t) {
  t.plan(3)

  var taskApi = task('test')
  var events = []

  taskApi.one('start', function (task) {
    events.push(task)
  })

  taskApi.start({
    property: 'value'
  })

  taskApi.start({
    property: 'another value'
  })

  setTimeout(function () {
    t.is(typeof taskApi.one, 'function', 'has "one" method')
    t.is(events.length, 1, 'emits one "start" event')
    t.is(events[0].attributes.property, 'value', 'emits correct task')
  }, 500)
})
