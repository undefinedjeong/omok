const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const boardSize = 15;
const margin = 24;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

let canvasSize;
let cellSize;
let board = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(EMPTY)
);

let currentTurn = BLACK; //흑 선
let gameOver = false;

function setupCanvas() {
    const maxWidth = Math.min(window.innerWidth - 24, 420);

    canvasSize = maxWidth;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    cellSize = (canvasSize - margin * 2) / (boardSize - 1);

    drawGame();
}

function drawGame() {
    drawBoard();
    drawStones();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#d9a441";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;

    for (let i = 0; i < boardSize; i++) {
        const pos = margin + i * cellSize;

        ctx.beginPath();
        ctx.moveTo(pos, margin);
        ctx.lineTo(pos, canvasSize - margin);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(margin, pos);
        ctx.lineTo(canvasSize - margin, pos);
        ctx.stroke();
    }

    drawStarPoints();
}

function drawStarPoints() {
    const starPoints = [
        [3, 3],
        [7, 3],
        [11, 3],
        [3, 7],
        [7, 7],
        [11, 7],
        [3, 11],
        [7, 11],
        [11, 11],
    ];

    ctx.fillStyle = "#222";

    for (const [x, y] of starPoints) {
        ctx.beginPath();
        ctx.arc(
        margin + x * cellSize,
        margin + y * cellSize,
        4,
        0,
        Math.PI * 2
        );
        ctx.fill();
    }
}

function drawStones() {
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            if (board[y][x] !== EMPTY) {
                drawStone(x, y, board[y][x]);
            }
        }
    }
}

function drawStone(x, y, color) {
    const centerX = margin + x * cellSize;
    const centerY = margin + y * cellSize;
    const radius = cellSize * 0.4;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

    if (color === BLACK) {
        ctx.fillStyle = "#111";
    }
    else if (color === WHITE) {
        ctx.fillStyle = "#f5f5f5"
    }

    ctx.fill();
}

function handleCanvasInput(event) {
    event.preventDefault();

    if(gameOver) {
        document.getElementById("status").textContent = "게임이 종료되었습니다. 다시 시작하려면 '게임 다시 시작' 버튼을 눌러주세요.";
        return;
    }

    const rect = canvas.getBoundingClientRect();

    const clientX = event.clientX ?? event.touches?.[0]?.clientX;
    const clientY = event.clientY ?? event.touches?.[0]?.clientY;

    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    const boardX = Math.round((canvasX - margin) / cellSize);
    const boardY = Math.round((canvasY - margin) / cellSize);

    if (!isInsideBoard(boardX, boardY)) {
        document.getElementById("status").textContent = "오목판 안쪽을 선택하세요.";
        return;
    }

    if (board[boardY][boardX] !== EMPTY) {
        document.getElementById("status").textContent = "이미 돌이 있는 자리입니다.";
        return;
    }

    board[boardY][boardX] = currentTurn;
    const turnName = currentTurn === BLACK ? "흑" : "백";
    document.getElementById("status").textContent =
        `${turnName}돌 위치: (${boardX + 1}, ${boardY + 1})`;
    drawGame();

    if(checkWin(boardX, boardY, currentTurn)) {
        gameOver = true;
        document.getElementById("status").textContent = `${turnName}돌이 승리했습니다!`;
        return;
    }

    currentTurn = currentTurn === BLACK ? WHITE : BLACK;
}

function isInsideBoard(x, y) {
    return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
}

function checkWin(x, y, color) {
    const directions = [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, -1],
    ];

    for (const [dx, dy] of directions) {
        const count = 1 +
        countStones(x, y, dx, dy, color) +
        countStones(x, y, -dx, -dy, color);

        if (count >= 5) {
            return true;
        }
    }

    return false;
}

function countStones(x, y, dx, dy, color) {
    let count = 0;
    let nextX = x + dx;
    let nextY = y + dy;

    while (
        isInsideBoard(nextX, nextY) &&
        board[nextY][nextX] === color
    ) {
        count++;
        nextX += dx;
        nextY += dy;
    }

    return count;
}

function resetGame() {

    currentTurn = BLACK;

    board = Array.from({ length: boardSize }, () =>
        Array(boardSize).fill(EMPTY)
    );

    gameOver = false;

    document.getElementById("status").textContent = "게임을 다시 시작했습니다.";
        drawGame();
}

function changeMode() {
    document.getElementById("status").textContent = "AI 모드는 다음 단계에서 구현합니다.";
}

function showHelp() {
    document.getElementById("status").textContent =
    "오목판을 터치하면 해당 위치에 돌이 놓입니다.";
}

canvas.addEventListener("click", handleCanvasInput);
canvas.addEventListener("touchstart", handleCanvasInput, { passive: false });

window.addEventListener("resize", setupCanvas);

setupCanvas();