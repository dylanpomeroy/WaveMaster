var express = require('express')
var app = express()
app.use('/scripts', express.static(`${__dirname}/dist/scripts`))
var http = require('http').createServer(app)
var io = require('socket.io')(http)

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/dist/index.html`)
})

var usersConnected = 0
var playerSockets = {}
playerPositions = {}
io.on('connection', (socket) => {
    console.log('a user connected')
    const playerId = usersConnected
    socket.emit('newProfileId', { profileId: playerId })
    playerSockets[playerId] = socket
    usersConnected++

    socket.on('positionUpdate', (message) => {
        playerPositions[message['profileId']] = message['position']
    })

    socket.on('disconnect', () => {
        console.log(`user disconnected. Removing ${playerId} from playerPositions.`)
        delete playerSockets[playerId]
        delete playerPositions[playerId]

        for (const socket of Object.values(playerSockets)) {
            socket.emit('playerDisconnected', playerId)
        }
    })
})

http.listen(3000, () => {
    console.log('listening on *:3000')
})

setInterval(() => {
    for (const socket of Object.values(playerSockets)) {
        socket.emit('otherPlayerPositions', playerPositions)
    }
}, 10)