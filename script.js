const gameBoard = document.getElementById('game-board');
const newGameButton = document.getElementById('new-game');
const scoreElement = document.getElementById('score');

let board = [];
let score = 0;
const size = 4;

let startX, startY;

// 在文件顶部添加以下变量
let audioContext;

function initializeGame() {
    // 初始化Web Audio API
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    board = Array(size).fill().map(() => Array(size).fill(0));
    score = 0;
    updateScore();
    addNewTile();
    addNewTile();
    renderBoard();
}

function addNewTile() {
    const emptyTiles = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j] === 0) {
                emptyTiles.push({i, j});
            }
        }
    }
    if (emptyTiles.length > 0) {
        const {i, j} = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        board[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
}

function renderBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            if (board[i][j] !== 0) {
                tile.textContent = board[i][j];
                tile.classList.add(`tile-${board[i][j]}`);
            }
            gameBoard.appendChild(tile);
        }
    }
}

function move(direction) {
    console.log('尝试移动:', direction);
    let hasChanged = false;
    const newBoard = JSON.parse(JSON.stringify(board));

    function moveLeft(row) {
        const filtered = row.filter(val => val !== 0);
        let newRow = [];
        for (let i = 0; i < filtered.length; i++) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                newRow.push(filtered[i] * 2);
                score += filtered[i] * 2;
                i++;
                hasChanged = true;
            } else {
                newRow.push(filtered[i]);
            }
        }
        newRow = newRow.concat(Array(size - newRow.length).fill(0));
        if (newRow.join(',') !== row.join(',')) {
            hasChanged = true;
        }
        return newRow;
    }

    switch (direction) {
        case 'left':
            for (let i = 0; i < size; i++) {
                newBoard[i] = moveLeft(newBoard[i]);
            }
            break;
        case 'right':
            for (let i = 0; i < size; i++) {
                newBoard[i] = moveLeft(newBoard[i].reverse()).reverse();
            }
            break;
        case 'up':
            for (let j = 0; j < size; j++) {
                const column = [newBoard[0][j], newBoard[1][j], newBoard[2][j], newBoard[3][j]];
                const newColumn = moveLeft(column);
                for (let i = 0; i < size; i++) {
                    newBoard[i][j] = newColumn[i];
                }
            }
            break;
        case 'down':
            for (let j = 0; j < size; j++) {
                const column = [newBoard[3][j], newBoard[2][j], newBoard[1][j], newBoard[0][j]];
                const newColumn = moveLeft(column);
                for (let i = 0; i < size; i++) {
                    newBoard[3-i][j] = newColumn[i];
                }
            }
            break;
    }

    if (hasChanged) {
        board = newBoard;
        addNewTile();
        renderBoard();
        updateScore();
        if (isGameOver()) {
            alert('游戏结束!');
        } else if (hasWon()) {
            alert('恭喜你赢了!');
        }
        
        // 播放移动音效
        playSound(440, 0.1); // 440Hz, 持续0.1秒
        
        // 如果发生了合并,播放合并音效
        if (score > 0) {
            setTimeout(() => playSound(660, 0.15), 100); // 660Hz, 持续0.15秒,延迟100毫秒播放
        }
    }
    console.log('移动后的棋盘:', board);
}

function updateScore() {
    scoreElement.textContent = score;
}

function isGameOver() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j] === 0) {
                return false;
            }
            if (j < size - 1 && board[i][j] === board[i][j + 1]) {
                return false;
            }
            if (i < size - 1 && board[i][j] === board[i + 1][j]) {
                return false;
            }
        }
    }
    return true;
}

function hasWon() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j] === 2048) {
                return true;
            }
        }
    }
    return false;
}

document.addEventListener('keydown', (e) => {
    // 确保音频上下文已初始化
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    console.log('按键被按下:', e.key);
    switch(e.key) {
        case 'ArrowUp':
            console.log('向上移动');
            move('up');
            break;
        case 'ArrowDown':
            console.log('向下移动');
            move('down');
            break;
        case 'ArrowLeft':
            console.log('向左移动');
            move('left');
            break;
        case 'ArrowRight':
            console.log('向右移动');
            move('right');
            break;
    }
});

newGameButton.addEventListener('click', initializeGame);

initializeGame();
initializeGame();

function updateGame() {
    renderBoard();
    updateScore();
}

// 在初始化游戏和每次移动后调用 updateGame
initializeGame();
updateGame();

gameBoard.addEventListener('mousedown', (e) => {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    startX = e.clientX;
    startY = e.clientY;
});

gameBoard.addEventListener('mouseup', (e) => {
    if (!startX || !startY) return;

    const endX = e.clientX;
    const endY = e.clientY;
    const diffX = endX - startX;
    const diffY = endY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平移动
        if (diffX > 0) {
            move('right');
        } else {
            move('left');
        }
    } else {
        // 垂直移动
        if (diffY > 0) {
            move('down');
        } else {
            move('up');
        }
    }

    startX = null;
    startY = null;
});

// 防止拖拽时选中文本
gameBoard.addEventListener('dragstart', (e) => {
    e.preventDefault();
});

gameBoard.addEventListener('touchstart', (e) => {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

gameBoard.addEventListener('touchend', (e) => {
    if (!startX || !startY) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - startX;
    const diffY = endY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平移动
        if (diffX > 0) {
            move('right');
        } else {
            move('left');
        }
    } else {
        // 垂直移动
        if (diffY > 0) {
            move('down');
        } else {
            move('up');
        }
    }

    startX = null;
    startY = null;
});

// 防止触摸时滚动页面
gameBoard.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// 添加以下函数来生成音效
function playSound(frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}