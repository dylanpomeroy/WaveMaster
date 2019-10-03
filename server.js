var express = require('express')
var app = express()
app.use('/scripts', express.static(`${__dirname}/dist/scripts`))
var http = require('http').createServer(app)
var io = require('socket.io')(http)

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/dist/index.html`)
})

var usersConnected = 0
playerPositions = {}
io.on('connection', (socket) => {
    console.log('a user connected')
    socket.emit('newProfileId', { profileId: usersConnected })
    usersConnected++

    socket.on('positionUpdate', (message) => {
        console.log(`Received positionUpdate message: ${message}`)
        playerPositions[message['profileId']] = message['position']
        console.log(`New player positions object: ${playerPositions}`)
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
        usersConnected--
    })
})

http.listen(3000, () => {
    console.log('listening on *:3000')
})
