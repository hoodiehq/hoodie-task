# hapi-couchdb-task

> CouchDB-based REST & front-end API for asynchronous background tasks

## Scope

The goal is to create very simplistic server for static apps that can
run background tasks that require back-end logic using a simple front-end
API.

## Install

```
npm install --save hapi-couchdb-task
```

## Client API

The client API can be loaded at `/task.js`

```js
task('email').start({
  to: 'john@example.com',
  subject: 'Ohaj there',
  body: 'Hey John,\n\nhow are things?\n\n– Jane'
}).then(function (task) {
  alert('Email "' + task.subject + '" sent')
}).catch(function (error) {
  alert(error)
})
```

Full API

```js
taskApi = task(type)
task.on(eventName, handler)
task.one(eventName, handler)

taskApi.start(attributes/*, options */)
taskApi.abort(id/*, options */)
taskApi.restart(id/*, options */)
taskApi.on(eventName, handler)
taskApi.one(eventName, handler)
```

Events, same for `task.on / one` and `taskApi.on / one`

```js
task.on('start', handleNewTask)
task.on('abort', handleNewTaskError)
task.on('success', handleNewTaskSuccess)
task.on('error', handleNewTaskError)
```

## Server API

Example usage with [nodemailer](https://www.npmjs.com/package/nodemailer) to
send emails from the front-end

```js
var Hapi = require('hapi')
var hapiTask = require('hapi-couchdb-task')

var options = {
  backend: {
    name: 'couchdb',
    location: 'http://localhost:5984',
    database: 'tasks',
    auth: {
      username: 'admin',
      password: 'sercret'
    }
  }
})

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'mailer@example.com',
    pass: 'secret'
  }
})

server.register({register: hapiTask}, options, function (error) {
  var taskApi = server.plugins.task.api
  taskApi('email').on('start', handleTask)
});

function handleTask (task) {
  task.from = 'mailer@example.com'
  transporter.sendMail(task, function (error, info) {
    if (error) {
      return taskApi.error(task, error, function (error) {
        if (error) {
          console.log('FATAL: could not set error on %s/%s: %s', task.type, task.id, error)
        }
      })
    }

    taskApi.success(task, function (error) {
      if (error) {
        console.log('FATAL: could not mark task %s/%s as finished', task.type, task.id)
      }
    })
  })
}

server.connection({
  port: 8000
});

server.start(function () {
  console.log('Server running at %s', server.info.uri);
});
```

## REST API

```
POST /api/user/<id>/_bulk_docs
GET /api/user/<id>/_changes
GET /task.js
```

## How it works

Tasks are simple json objects with special properties. `hapi-couchdb-task` creates a `tasks`
database where all task objects from all users are replicated to / from. Users can only
access their own tasks (`/api/user/<id>/_changes` is a filtered changes feed by the given user id).

## Local setup & tests

```bash
git clone git@github.com:hoodiehq/hapi-couchdb-task.git
cd hapi-couchdb-task
npm install
npm test
```

To start the [local dev server](bin/server), run

```
npm start
```

## License

MIT
