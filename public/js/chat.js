const socket = io()

let primaMossa = 0              //  Id (0 or 1) of the player that must do the first move in a sigle match. 
                                //  If is the first match, will be 0 so it's the player1 turn to click for first. Second match will be 1 so player2 will click for first
let turno = 0                   //  Count the turn number so every player knows if it's his turn or opponent's turn
let fermaGioco = true           //  If true no player can click and the match is stopped. If false, players can start the match
let player = []                 //  Array of all player in the room
let defaultColorButton = ""

const name = 'User'+ Math.floor(Math.random() * 50)

//  Client -> Server message to notify his name
socket.emit('sceltoNome', name)

//  Save the references of some HTML elements to modify them with JavaScript
btn = document.querySelectorAll('.buttons')
defaultColorButton = btn[0].style.backgroundColor
btnReset = document.querySelector('#reset')
loadingImg = document.querySelector('#loading')

playerScore = [document.getElementById('punteggio1'), document.getElementById('punteggio2')]

playerName = [document.getElementById('name1'), document.getElementById('name2')]

//  Client gets Server message about who entered on the same room, updating opponent name.
//  If there are 2 players in the room, the game can start.
//  Everything is developed for only 2-player game
socket.on('informaNomi', (data) => {
    loadingImg.style.visibility = 'visible'
    player = data
    playerScore[0].innerText = playerScore[1].innerText = "" + 0
    playerName[0].innerText = data[0].name
    try {
        playerName[1].innerText = data[1].name
        loadingImg.style.visibility = 'hidden'
    } catch (e) {
        playerName[1].innerText = ""
    }
    fermaGioco = data.length < 2
    btn.forEach((btn) => { btn.innerText = '' })    //  Reset every button
})

//  Client gets Server message about clicked button by the opponent
socket.on('informaAltriClientButtonCliccato', (data) => {
    btn[data].innerText = 'O'
    turno = (turno + 1) % 2
})

//  Client gets Server message about who won
socket.on('notificaVittoria', (data) => {
    playerScore[data[0]].innerText = parseInt(playerScore[data[0]].innerText) + 1
    btnReset.style.visibility = "visible";
    fermaGioco = true
    colorButtonWin(data[1])
})

//  Client gets Server message about not-win and not-lose (TIE)
socket.on('notificaPareggio', () => {
    btnReset.style.visibility = "visible";
    fermaGioco = true
})

//  Client gets Server message about reset the game-canvas
socket.on('resetTotale', () => {
    primaMossa = (primaMossa + 1) % 2
    btn.forEach((btn) => { btn.innerText = '' })
    btnReset.style.visibility = "hidden"
    fermaGioco = false
    colorButtonReset()
})

//  Set addEventListener(click) to all buttons
btn.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        if (btn.innerText === '' && turno === findId(socket.id, player) && fermaGioco === false) invioMsgBtnCliccato(index)
    })
})

//  Client -> Server message about the button Reset clicked
btnReset.addEventListener('click', () => {
    socket.emit('resetCliccato', findId(socket.id, player))
})

//  Client -> Server message about the button clicked
const invioMsgBtnCliccato = (index) => {
    socket.emit('btnCliccato', index, findId(socket.id, player), () => {
        btn[index].innerText = 'X'
        turno = (turno + 1) % 2
    })
}

//  Search own id in player array by socket.id
const findId = (id, playerArray) => {
    const trova = playerArray.filter(function (x) {
        return x.id === id;
    })
    return trova[0].cnt
}

//  Color the 3 winning buttons
const colorButtonWin = (a) => {
    btn[a[0]].style.backgroundColor = 'red'
    btn[a[1]].style.backgroundColor = 'red'
    btn[a[2]].style.backgroundColor = 'red'
}

//  Reset all buttons color
const colorButtonReset = () => {
    btn.forEach(btn => {
        btn.style.backgroundColor = defaultColorButton
    })
}