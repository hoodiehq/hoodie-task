/* global location */

var TaskQueue = require('hoodie-client-task')
var humbleLocalStorage = require('humble-localstorage')
var randomString = require('random-string')

var userId = humbleLocalStorage.getItem('_userId')
if (!userId) {
  userId = 'store-' + randomString({length: 7}).toLowerCase()
  humbleLocalStorage.setItem('_userId', userId)
}

global.store = new TaskQueue(userId, {
  remote: location.origin + '/api'
})

module.exports = TaskQueue
