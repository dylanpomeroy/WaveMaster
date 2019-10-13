import Victor from 'victor'
import io from 'socket.io-client/dist/socket.io'

const speed = 0.5

const checkKeyDown = (e) => {
    e = e || window.event
    if (e.keyCode == '38') keys['up'] = true
    if (e.keyCode == '40') keys['down'] = true
    if (e.keyCode == '37') keys['left'] = true
    if (e.keyCode == '39') keys['right'] = true
}

const checkKeyUp = (e) => {
    e = e || window.event
    if (e.keyCode == '38') keys['up'] = false
    if (e.keyCode == '40') keys['down'] = false
    if (e.keyCode == '37') keys['left'] = false
    if (e.keyCode == '39') keys['right'] = false
}

document.onkeydown = checkKeyDown
document.onkeyup = checkKeyUp

var keys = {
    'up': false,
    'down': false,
    'left': false,
    'right': false,
}

var playerPosition = new Victor(0, 0)
var otherPlayerPositionsClient = {}
var otherPlayerPositionsServer = {}
var lastUpdate = null
const update = () => {
    var moveVector = new Victor(0, 0)
    if (keys['up']) moveVector.add(new Victor(0, -1))
    if (keys['down']) moveVector.add(new Victor(0, 1))
    if (keys['left']) moveVector.add(new Victor(-1, 0))
    if (keys['right']) moveVector.add(new Victor(1, 0))

    const deltaTimeSpeed = speed * (Date.now() - lastUpdate)


    if (moveVector.length() > 0)
        playerPosition = playerPosition.add(moveVector.normalize().multiply(new Victor(deltaTimeSpeed, deltaTimeSpeed)))

    var c = document.getElementById('mainCanvas')
    c.width = window.innerWidth - 20
    c.height = window.innerHeight - 20
    var ctx = c.getContext("2d")
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.beginPath()
    ctx.arc(playerPosition.x, playerPosition.y, 20, 0, 2 * Math.PI)
    ctx.stroke()

    ctx.font = "bold 20px Arial"
    ctx.fillText(`Player ${profileId}`, playerPosition.x - 35, playerPosition.y + 40)

    for (var playerPosKey of Object.keys(otherPlayerPositionsClient)) {
        console.log(`Old client pos: ${JSON.stringify(otherPlayerPositionsClient[playerPosKey], null, 2)}`)
        otherPlayerPositionsClient[playerPosKey].x = lerp(otherPlayerPositionsClient[playerPosKey].x, otherPlayerPositionsServer[playerPosKey].x, 0.1)
        otherPlayerPositionsClient[playerPosKey].y = lerp(otherPlayerPositionsClient[playerPosKey].y, otherPlayerPositionsServer[playerPosKey].y, 0.1)
        console.log(`New client pos: ${JSON.stringify(otherPlayerPositionsClient[playerPosKey], null, 2)}`)
        
        const positionVector = Victor.fromObject(otherPlayerPositionsClient[playerPosKey])
        ctx.beginPath()
        ctx.arc(positionVector.x, positionVector.y, 15, 0, 2 * Math.PI)
        ctx.stroke()

        ctx.font = "15px Arial"
        ctx.fillText(`Player ${playerPosKey}`, positionVector.x - 30, positionVector.y + 30)
    }

    lastUpdate = Date.now()
}

var socket = io()
var profileId = 0
socket.on('newProfileId', (message) => {
    console.log(`Received newProfileId message from server: ${message}`)
    profileId = message['profileId']
})

var sendPositionToServer = () => {
    socket.emit('positionUpdate', {
        'profileId': profileId,
        'position': playerPosition.toObject()
    })
}

socket.on('otherPlayerPositions', (message) => {
    delete message[profileId]
    otherPlayerPositionsServer = message

    for (var playerPosKey of Object.keys(otherPlayerPositionsServer)) {
        if (!(playerPosKey in otherPlayerPositionsClient)) {
            console.log('Adding new player position!')
            otherPlayerPositionsClient[playerPosKey] = {}
            otherPlayerPositionsClient[playerPosKey].x = otherPlayerPositionsServer[playerPosKey].x
            otherPlayerPositionsClient[playerPosKey].y = otherPlayerPositionsServer[playerPosKey].y
        }
    }
})

socket.on('playerDisconnected', (playerId) => {
    delete otherPlayerPositionsClient[playerId]
    delete otherPlayerPositionsServer[playerId]
})

var lerp = (start, end, amt) => {
    return (1-amt)*start+amt*end
}

window.setInterval(() => sendPositionToServer(), 100)
window.setInterval(() => update(), 1000 / 60)