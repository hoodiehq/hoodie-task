// TODO: update these integration tests to be applicable to hoodie-task (hoodie-task used as basis)
// add "test": "frontend-test-background mocha test/*.js" when ready (using standard for now)

/* global describe, beforeEach, afterEach, it, hoodie */
require('@gr2m/frontend-test-setup')

var expect = require('chai').expect

function toValue (result) {
  if (isError(result.value)) {
    var error = new Error(result.value.message)
    Object.keys(result.value).forEach(function (key) {
      error[key] = result.value[key]
    })

    throw error
  }

  return result.value
}

function isError (value) {
  return value && value.status
}

describe('hoodie.store', function () {
  this.timeout(90000)

  beforeEach(function () {
    return this.client.url('/')

    // keep track of events for tests
    .execute(function setEvents () {
      window.storeEvents = []

      ;[
        'change',
        'add',
        'update',
        'remove',
        'clear'
      ].forEach(function (eventName) {
        hoodie.store.on(eventName, function () {
          window.storeEvents.push(eventName)
        })
      })
    })
  })

  afterEach(function () {
    return this.client.execute(function () {
      window.localStorage.clear()
    })
  })

  it('.isConnected()', function () {
    return this.client
    .executeAsync(function (done) {
      var connectedList = [hoodie.store.isConnected()]
      hoodie.store.connect()
        .then(function () {
          connectedList.push(hoodie.store.isConnected())
        })
        .then(function () {
          return hoodie.store.disconnect()
        })
        .then(function () {
          connectedList.push(hoodie.store.isConnected())
          done(connectedList)
        })
    })
    .then(toValue)
    .then(function (connectedList) {
      expect(connectedList).to.eql([false, true, false])
    })
  })

  it('.add() generates uuid', function () {
    return this.client

    .executeAsync(function add (done) {
      hoodie.store.add({foo: 'bar'})

      .then(done, done)
    }).then(toValue)
    .then(function (object) {
      expect(typeof object.id).to.equal('string')
    })
  })

  it('.add() emits "add" & "change" events', function () {
    return this.client

    .executeAsync(function add (done) {
      hoodie.store.add({foo: 'baz'})

      .then(function () {
        done(window.storeEvents)
      })

      .catch(done)
    }).then(toValue)
    .then(function (events) {
      expect(events.length).to.equal(2)
      expect(events[0]).to.equal('add')
      expect(events[1]).to.equal('change')
    })
  })

  it('.add() accepts custom id', function () {
    return this.client

    .executeAsync(function add (done) {
      hoodie.store.add({id: '123'})

      .then(done, done)
    }).then(toValue)
    .then(function (object) {
      expect(object.id).to.equal('123')
    })
  })

  it('.add() conflict', function () {
    return this.client

    .executeAsync(function add (done) {
      hoodie.store.add({id: '456'})

      .then(function () {
        return hoodie.store.add({id: '456'})
      })

      .then(done, done)
    }).then(toValue)
    .then(function () {
      throw new Error('should reject with Conflict error')
    })
    .catch(function (error) {
      expect(error.status).to.equal(409)
      // https://github.com/hoodiehq/hoodie-client-store/issues/69
      // expect(error.name).to.equal('Conflict')
      // expect(error.message).to.equal('Object with id "123" already exists')
    })
  })

  it('.update() updates existing object', function () {
    return this.client

    .executeAsync(function (done) {
      hoodie.store.add({id: '788'})

      .then(function () {
        return hoodie.store.update('788', {foo: 'bar'})
      })

      .then(done, done)
    }).then(toValue)
    .then(function (object) {
      expect(object.id).to.equal('788')
      expect(object.foo).to.equal('bar')
    })
  })

  it('.updateOrAdd() updates existing object', function () {
    return this.client

    .executeAsync(function (done) {
      hoodie.store.add({id: '789'})

      .then(function () {
        return hoodie.store.updateOrAdd({id: '789', foo: 'bar'})
      })

      .then(done, done)
    }).then(toValue)
    .then(function (object) {
      expect(object.id).to.equal('789')
      expect(object.foo).to.equal('bar')
    })
  })

  it('.find() succeeds if object exists', function () {
    return this.client

    .executeAsync(function (done) {
      hoodie.store.add({id: '1011'})

      .then(function () {
        return hoodie.store.find('1011')
      })

      .then(done, done)
    }).then(toValue)
    .then(function (object) {
      expect(object.id).to.equal('1011')
    })
  })

  it('.find() fails if object does not exist', function () {
    return this.client

    .executeAsync(function (done) {
      return hoodie.store.find('nothinghere')

      .then(done, done)
    }).then(toValue)
    .then(function () {
      throw new Error('should reject with Not Found error')
    })
    .catch(function (error) {
      expect(error.status).to.equal(404)
      // https://github.com/hoodiehq/hoodie-client-store/issues/70
      // expect(error.name).to.equal('Not Found')
      // expect(error.message).to.equal('Object with id "nothinghere" is missing')
    })
  })

  it('.findAll()', function () {
    return this.client

    .executeAsync(function (done) {
      hoodie.store.removeAll()

      .then(function () {
        return hoodie.store.add([
          {foo: 'bar'},
          {type: 'note', foo: 'baz'}
        ])
      })

      .then(function () {
        return hoodie.store.findAll()
      })

      .then(done, done)
    }).then(toValue)
    .then(function (objects) {
      expect(objects.length).to.equal(2)
      var foos = objects.map(function (object) {
        return object.foo
      }).sort()
      expect(foos[0]).to.equal('bar')
      expect(foos[1]).to.equal('baz')
    })
  })

  it('.updateAll()', function () {
    return this.client
      .executeAsync(function (done) {
        hoodie.store.removeAll()
          .then(function () {
            hoodie.store.add([
              {a: 1},
              {b: 2}
            ])
          })
          .then(function () {
            return hoodie.store.updateAll({cool: 'yes'})
          })
          .then(done, done)
      })
      .then(toValue)
      .then(function (objects) {
        expect(objects.length).to.equal(2)
        expect(objects[0].cool).to.equal('yes')
        expect(objects[1].cool).to.equal('yes')
      })
  })

  it('.hasLocalChanges()', function () {
    return this.client
      .executeAsync(function (done) {
        var hadChanges = [hoodie.store.hasLocalChanges()]

        hoodie.store.add([
          {id: 'test1', foo: 'bar1'},
          {id: 'test2', foo: 'bar2'}
        ])
        .then(function () {
          hadChanges.push(hoodie.store.hasLocalChanges())
          return hoodie.store.sync()
        })
        .then(function () {
          hadChanges.push(hoodie.store.hasLocalChanges())
          done(hadChanges)
        })
      })
      .then(toValue)
      .then(function (hadChanges) {
        expect(hadChanges.length).to.equal(3)
        expect(hadChanges).to.eql([false, true, false])
      })
  })
})
