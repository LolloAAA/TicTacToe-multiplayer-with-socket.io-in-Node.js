const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
//  Export two function from 'functions.js file
const {resetTot, checkWin} = require('./functions.js')

//  Create the server app with express module
const app = express()
const server = http.createServer(app)
const io = socketio(server)
//  Set the connection PORT. Eviroment PORT (from the server-hosting settings) if exists, else 3000
const port = process.env.PORT || 3000

//  Set the folder of HTML pages to show
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

let reset = [0, 0]                          //  Array to record if players clicked button reset. If both clicked ([1,1]) the buttons are cleaned
let player = []                             //  Array for save players data. Is the list of all client connected. All this software is developed for only 2 players connection
let canvas = [2, 3, 4, 5, 6, 7, 8, 9, -1]   //  Tokens for every button. canvas[0] is the token assigned to the first button, ecc ecc
                                            //  If player1 clicks, his token in the canvas will be 0, player2 -> 1
                                            //  So these tokens are used for check if someone wins or tie

//  For every client connected...
io.on('connection', (socket) => {

    //  Server gets Client message about button clicked
    socket.on('btnCliccato', (index, player, callback) => {
        socket.broadcast.emit('informaAltriClientButtonCliccato', index)    //  Server sends message to the OTHER client connected about the button clicked by opponent
        canvas[index] = player                                              //  Canvas is updated with the player token in right position. If player1 click on first button, canvas[0] = 0. If player 2, canvas[0] = 1
        callback()
        flag = checkWin(canvas)
        if (flag != -1) {                       //  If someone won and NOT TIE...
            io.emit('notificaVittoria', flag)   //  Server send victory messages to both client connected
            canvas = resetTot()                 //  Reset canvas array with initial tokens
        }

        //  Check if canvas array is composed only by 0 and 1 tokens. This means that the players clicked ALL 9 buttons without a victory, so this is a TIE
        const checkDraw = canvas.filter(function (x) {
            return x === 1 || x === 0;
        })

        if (checkDraw.length === canvas.length) {   //  If players tie...
            io.emit('notificaPareggio')             //  Server sends message to every client about the TIE
            canvas = resetTot()
        }
    })

    //  Server gets Client message about his name. This name, with id connection and id-player (used for turn control) are stored in 'player' array
    socket.on('sceltoNome', (name) => {
        player.push({ id: socket.id, name: name, cnt: player.length })
        io.emit('informaNomi', player)  //  Server send to both clients the list of 2 players
    })

    //  Server gets Client message about his click on reset button for reset request
    socket.on('resetCliccato', (index) => {
        reset[index] = 1
        if (reset[0] + reset[1] === 2) {    //  If both players clicked reset button ('reset' array = [1, 1]), We can reset all buttons tokens
            io.emit('resetTotale')          //  Server sends message to every client for clean their buttons
            canvas = resetTot()
            reset = [0, 0]
        }
    })

    //  Server gets Client message about his disconnection
    //  By client's socket.id we find own index-player in 'player' array and delete him
    socket.on('disconnect', () => {
        canvas = resetTot()
        const trova = player.filter(function (x) {
            return x.id !== socket.id;
        })
        if (trova.length === 0) //  If second player disconneted, the first player is always in the first position in 'player' array
            player = trova
        else                    //  If first player disconneted, the second player will be put in the first position of 'player' array, changing his index-player (from 1 to 0)
            player = [{ id: trova[0].id, name: trova[0].name, cnt: 0 }]
        io.emit('informaNomi', player)  // Server sends message to the client about new 'player' in session without the deleted (disconnected) player
    })
})

server.listen(port, () => {
    console.log(`Server TIC-TAC-TOE is up on port ${port}!`)
})

