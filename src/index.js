import Victor from 'victor'

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
    ctx.beginPath();
    ctx.arc(playerPosition.x, playerPosition.y, 20, 0, 2 * Math.PI);
    ctx.stroke();

    lastUpdate = Date.now()
}

window.setInterval(() => update(), 1.0 / 60.0)