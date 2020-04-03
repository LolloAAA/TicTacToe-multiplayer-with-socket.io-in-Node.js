//  Reset all the canvas to initial tokens for reset the game
const resetTot = () => {
    return [2, 3, 4, 5, 6, 7, 8, 9, -1]
}


//  Check if a player win. Returns an array of arrays:
//  [0, [indexes]] -> if player1 won and indexes are the three winning buttons
//  [1, [indexes]] -> if player2 won and indexes are the three winning buttons
//  -1 if no players has not won yet
const checkWin = (canvas) => {
    for (var i = 0; i < 3; i++) {
        if (canvas[0 + 3 * i] === canvas[1 + 3 * i] && canvas[1 + 3 * i] === canvas[2 + 3 * i])
            return [canvas[0 + 3 * i], [3 * i, 1 + 3 * i, 2 + 3 * i]]
        if (canvas[i] === canvas[i + 3] && canvas[i + 3] === canvas[i + 6])
            return [canvas[i], [i, i + 3, i + 6]]
    }
    if (canvas[0] === canvas[4] && canvas[4] === canvas[8])
        return [canvas[0], [0, 4, 8]]
    if (canvas[2] === canvas[4] && canvas[4] === canvas[6])
        return [canvas[2], [2, 4, 6]]
    return -1
}

module.exports = {
    resetTot,
    checkWin, 
}