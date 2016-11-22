/* global location */

var TaskQueue = require('@hoodie/task-client')
var humbleLocalStorage = require('humble-localstorage')
var randomString = require('random-string')

var userId = humbleLocalStorage.getItem('_userId')
if (!userId) {
  userId = 'store-' + randomString({length: 7}).toLowerCase()
  humbleLocalStorage.setItem('_userId', userId)
}

global.task = new TaskQueue(userId, {
  remote: location.origin + '/api/queue'
})

module.exports = TaskQueue
