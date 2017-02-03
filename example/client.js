var Task = require('../client')
var humbleLocalStorage = require('humble-localstorage')
var randomString = require('random-string')

var userId = humbleLocalStorage.getItem('_userId')
if (!userId) {
  userId = randomString({length: 7}).toLowerCase()
  humbleLocalStorage.setItem('_userId', userId)
}

var hoodie = {
  task: Task(userId, {remoteBaseUrl: window.location.origin + '/hoodie/task/api'})
}

module.exports = hoodie
