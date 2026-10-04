document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('gameBoard');
    const messageDisplay = document.getElementById('message');
    const moveCountDisplay = document.getElementById('moveCount');
    const timerDisplay = document.getElementById('timer');
    const startOverlay = document.getElementById('startOverlay');
    const startBtn = document.getElementById('startBtn');
    const hintBtn = document.getElementById('hintBtn');
    const undoBtn = document.getElementById('undoBtn');
    const resetBtn = document.getElementById('resetBtn');
    const gameTitle = document.getElementById('gameTitle');
    const secretSolveBtn = document.getElementById('secretSolveBtn');
    
    // Side High Score Box Elements
    const highscoreSideBox = document.getElementById('highscoreSideBox');
    const playerNameInput = document.getElementById('playerNameInput');
    const saveScoreBtn = document.getElementById('saveScoreBtn');
    const finalTimeDisplay = document.getElementById('finalTimeDisplay');
    const finalMovesDisplay = document.getElementById('finalMovesDisplay');
    
    const leaderboardBody = document.getElementById('leaderboardBody');
    const fireworksCanvas = document.getElementById('fireworksCanvas');

    // Board Configuration
    const BOARD_ROWS = [6, 6, 2];
    const TOTAL_ROWS = BOARD_ROWS.length;
    const SQUARE_SIZE = 60;
    const TARGET_ROW = 2;
    const TARGET_COL = 0;

    let board = [];
    let pieces = [];
    let selectedPiece = null;

    // Gameplay Stats & History
    let moveCount = 0;
    let timerSeconds = 0;
    let timerInterval = null;
    let gameActive = false;
    let isSolving = false;
    let moveHistory = [];

    // Funny NPC Bot Names
    const npcNames = [
        "Stockfish_On_A_Budget",
        "ChatGPT_In_A_Trenchcoat",
        "HAL_9000_Mini",
        "RoboKnight_3000",
        "DeepThought_v0.1",
        "404_Human_Not_Found",
        "ByteSized_Grandmaster"
    ];

    // Snarky Win Messages
    const snarkyMessages = [
        "Well, you won... eventually. My grandma moves knights faster.",
        "Good job! Though standard grandmasters usually solve this in fewer moves.",
        "Victory! It only took a minor eternity.",
        "Puzzle solved! We were starting to think you got lost.",
        "You actually did it. Color us surprised!"
    ];

    const initialPieces = [
        { id: 'bk', type: 'knight', color: 'black', name: 'Black Knight', startRow: 0, startCol: 5 },
        { id: 'wk1', type: 'knight', color: 'white', name: 'White Knight', startRow: 1, startCol: 5 },
        { id: 'wk2', type: 'knight', color: 'white', name: 'White Knight', startRow: 1, startCol: 4 },
        { id: 'wk3', type: 'knight', color: 'white', name: 'White Knight', startRow: 1, startCol: 3 },
        { id: 'wk4', type: 'knight', color: 'white', name: 'White Knight', startRow: 1, startCol: 2 },
        { id: 'wb1', type: 'bishop', color: 'white', name: 'White Bishop', startRow: 0, startCol: 1 },
        { id: 'wb2', type: 'bishop', color: 'white', name: 'White Bishop', startRow: 0, startCol: 2 },
        { id: 'wb3', type: 'bishop', color: 'white', name: 'White Bishop', startRow: 0, startCol: 3 },
        { id: 'wb4', type: 'bishop', color: 'white', name: 'White Bishop', startRow: 0, startCol: 4 },
        { id: 'wr1', type: 'rook', color: 'white', name: 'White Rook', startRow: 0, startCol: 0 },
        { id: 'wr2', type: 'rook', color: 'white', name: 'White Rook', startRow: 1, startCol: 0 },
        { id: 'wr3', type: 'rook', color: 'white', name: 'White Rook', startRow: 1, startCol: 1 },
        { id: 'wr4', type: 'rook', color: 'white', name: 'White Rook', startRow: 2, startCol: 1 }
    ];

    // --- Control Event Listeners ---
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    undoBtn.addEventListener('click', undoMove);
    hintBtn.addEventListener('click', showHint);
    
    // Easter Egg Auto-Solve Triggers
    gameTitle.addEventListener('dblclick', triggerAutoSolve);
    secretSolveBtn.addEventListener('click', triggerAutoSolve);

    function startGame() {
        startOverlay.style.display = 'none';
        highscoreSideBox.classList.add('hidden');
        resetStats();
        initializeBoard();
        startTimer();
        gameActive = true;
        isSolving = false;
        messageDisplay.textContent = "Move the pieces to guide the Black Knight to the black square!";
    }

    function resetGame() {
        if (isSolving) return;
        stopTimer();
        gameActive = false;
        isSolving = false;
        resetStats();
        initializeBoard();
        highscoreSideBox.classList.add('hidden');
        startOverlay.style.display = 'flex';
        startBtn.textContent = 'Start Game';
        messageDisplay.textContent = "Game reset. Click Start Game to play!";
    }

    function resetStats() {
        stopTimer();
        moveCount = 0;
        timerSeconds = 0;
        moveHistory = [];
        moveCountDisplay.textContent = '0';
        timerDisplay.textContent = '00:00';
    }

    function startTimer() {
        stopTimer();
        timerInterval = setInterval(() => {
            timerSeconds++;
            const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
            const secs = String(timerSeconds % 60).padStart(2, '0');
            timerDisplay.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) clearInterval(timerInterval);
    }

    // --- Board Initialization ---
    function initializeBoard() {
        gameBoard.innerHTML = '';
        board = [];
        pieces = [];
        selectedPiece = null;

        gameBoard.style.gridTemplateColumns = `repeat(6, ${SQUARE_SIZE}px)`;
        gameBoard.style.gridTemplateRows = `repeat(${TOTAL_ROWS}, ${SQUARE_SIZE}px)`;

        for (let r = 0; r < TOTAL_ROWS; r++) {
            board[r] = [];
            const numColsInRow = BOARD_ROWS[r];
            for (let c = 0; c < numColsInRow; c++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.dataset.row = r;
                square.dataset.col = c;
                square.id = `square-${r}-${c}`;

                square.style.backgroundColor = (r + c) % 2 === 0 ? '#b0c4de' : '#778899';

                if (r === 2) {
                    square.style.gridColumn = (c === 0) ? '1' : '2';
                } else {
                    square.style.gridColumn = (c + 1).toString();
                }
                square.style.gridRow = (r + 1).toString();

                if (r === TARGET_ROW && c === TARGET_COL) {
                    square.classList.add('target');
                }

                gameBoard.appendChild(square);
                board[r][c] = null;
            }
        }

        initialPieces.forEach(pData => {
            const piece = createPiece(pData.id, pData.type, pData.color, pData.name, pData.startRow, pData.startCol);
            pieces.push(piece);
            placePieceOnBoard(piece, pData.startRow, pData.startCol);
        });

        gameBoard.removeEventListener('click', handleBoardClick);
        gameBoard.addEventListener('click', handleBoardClick);
    }

    function createPiece(id, type, color, name, row, col) {
        const pieceElement = document.createElement('div');
        pieceElement.classList.add('piece', color);

        const imgElement = document.createElement('img');
        imgElement.alt = `${color} ${type}`;

        let imageFileName = '';
        switch (type) {
            case 'knight': imageFileName = `${color}_knight.svg`; break;
            case 'bishop': imageFileName = `white_bishop.svg`; break;
            case 'rook': imageFileName = `white_rook.svg`; break;
        }
        imgElement.src = `images/${imageFileName}`;
        pieceElement.appendChild(imgElement);

        return { id, type, color, name, row, col, element: pieceElement };
    }

    function placePieceOnBoard(piece, row, col) {
        const targetSquare = document.getElementById(`square-${row}-${col}`);
        if (targetSquare) {
            targetSquare.appendChild(piece.element);
            board[row][col] = piece;
            piece.row = row;
            piece.col = col;
        }
    }

    // --- Movement Mechanics ---
    function handleBoardClick(event) {
        if (!gameActive || isSolving) return;

        const clickedSquare = event.target.closest('.square');
        if (!clickedSquare) return;

        const row = parseInt(clickedSquare.dataset.row);
        const col = parseInt(clickedSquare.dataset.col);
        const pieceAtClickedSquare = board[row][col];

        if (selectedPiece) {
            if (isValidMove(selectedPiece, row, col)) {
                movePiece(selectedPiece, row, col);
                clearHighlights();
                selectedPiece.element.classList.remove('selected');
                selectedPiece = null;
                checkWinCondition(false);
            } else {
                clearHighlights();
                selectedPiece.element.classList.remove('selected');
                selectedPiece = null;
                if (pieceAtClickedSquare) selectPiece(pieceAtClickedSquare);
            }
        } else {
            if (pieceAtClickedSquare) selectPiece(pieceAtClickedSquare);
        }
    }

    function selectPiece(piece) {
        if (selectedPiece) {
            selectedPiece.element.classList.remove('selected');
            clearHighlights();
        }
        selectedPiece = piece;
        selectedPiece.element.classList.add('selected');
        highlightValidMoves(selectedPiece);
    }

    function highlightValidMoves(piece) {
        const validMoves = getValidMoves(piece);
        validMoves.forEach(move => {
            const square = document.getElementById(`square-${move.row}-${move.col}`);
            if (square) square.classList.add('highlight');
        });
    }

    function clearHighlights() {
        document.querySelectorAll('.square.highlight, .square.hint-source, .square.hint-target')
            .forEach(s => s.classList.remove('highlight', 'hint-source', 'hint-target'));
    }

    function getValidMoves(piece) {
        const moves = [];
        const { row, col, type } = piece;

        const isValidSquare = (r, c) => r >= 0 && r < TOTAL_ROWS && c >= 0 && c < BOARD_ROWS[r];
        const isOccupied = (r, c) => isValidSquare(r, c) && board[r][c] !== null;

        const addMoveIfValid = (r, c) => {
            if (isValidSquare(r, c) && !isOccupied(r, c)) {
                moves.push({ row: r, col: c });
                return true;
            }
            return false;
        };

        switch (type) {
            case 'knight':
                const knightMoves = [
                    { dr: -2, dc: -1 }, { dr: -2, dc: 1 },
                    { dr: -1, dc: -2 }, { dr: -1, dc: 2 },
                    { dr: 1, dc: -2 }, { dr: 1, dc: 2 },
                    { dr: 2, dc: -1 }, { dr: 2, dc: 1 }
                ];
                knightMoves.forEach(m => addMoveIfValid(row + m.dr, col + m.dc));
                break;

            case 'rook':
                [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
                    for (let i = 1; ; i++) {
                        const newR = row + dr * i;
                        const newC = col + dc * i;
                        if (!isValidSquare(newR, newC) || isOccupied(newR, newC)) break;
                        moves.push({ row: newR, col: newC });
                    }
                });
                break;

            case 'bishop':
                [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                    for (let i = 1; ; i++) {
                        const newR = row + dr * i;
                        const newC = col + dc * i;
                        if (!isValidSquare(newR, newC) || isOccupied(newR, newC)) break;
                        moves.push({ row: newR, col: newC });
                    }
                });
                break;
        }
        return moves;
    }

    function isValidMove(piece, targetRow, targetCol) {
        return getValidMoves(piece).some(m => m.row === targetRow && m.col === targetCol);
    }

    function movePiece(piece, newRow, newCol) {
        moveHistory.push({
            pieceId: piece.id,
            fromRow: piece.row,
            fromCol: piece.col,
            toRow: newRow,
            toCol: newCol
        });

        board[piece.row][piece.col] = null;
        board[newRow][newCol] = piece;
        piece.row = newRow;
        piece.col = newCol;

        const newSquareElement = document.getElementById(`square-${newRow}-${newCol}`);
        newSquareElement.appendChild(piece.element);

        moveCount++;
        moveCountDisplay.textContent = moveCount;
    }

    function undoMove() {
        if (!gameActive || isSolving || moveHistory.length === 0) return;

        const lastMove = moveHistory.pop();
        const piece = pieces.find(p => p.id === lastMove.pieceId);

        if (piece) {
            board[lastMove.toRow][lastMove.toCol] = null;
            board[lastMove.fromRow][lastMove.fromCol] = piece;
            piece.row = lastMove.fromRow;
            piece.col = lastMove.fromCol;

            const originalSquare = document.getElementById(`square-${lastMove.fromRow}-${lastMove.fromCol}`);
            originalSquare.appendChild(piece.element);

            moveCount = Math.max(0, moveCount - 1);
            moveCountDisplay.textContent = moveCount;

            clearHighlights();
            if (selectedPiece) {
                selectedPiece.element.classList.remove('selected');
                selectedPiece = null;
            }
            messageDisplay.textContent = "Undid last move.";
        }
    }

    // --- BFS Pathfinding Solver for Auto-Solve & Hints ---
    function solveBFSPath() {
        const isValidSquare = (r, c) => r >= 0 && r < TOTAL_ROWS && c >= 0 && c < BOARD_ROWS[r];
        const pieceList = pieces.map(p => ({ id: p.id, type: p.type, row: p.row, col: p.col }));

        // Encode current state: array of piece positions
        const startState = pieceList.map(p => `${p.row},${p.col}`).join('|');
        const queue = [{ stateStr: startState, piecesState: pieceList, path: [] }];
        const visited = new Set([startState]);

        while (queue.length > 0) {
            const { piecesState, path } = queue.shift();
            
            const blackKnight = piecesState.find(p => p.id === 'bk');
            if (blackKnight.row === TARGET_ROW && blackKnight.col === TARGET_COL) {
                return path; // Return optimal path array of moves
            }

            // Map occupied squares
            const occupiedMap = {};
            piecesState.forEach(p => { occupiedMap[`${p.row},${p.col}`] = p; });

            // Try moves for each piece
            for (let i = 0; i < piecesState.length; i++) {
                const p = piecesState[i];
                const validMoves = [];

                if (p.type === 'knight') {
                    const knightDeltas = [
                        [-2,-1],[-2,1],[-1,-2],[-1,2],
                        [1,-2],[1,2],[2,-1],[2,1]
                    ];
                    knightDeltas.forEach(([dr, dc]) => {
                        const nr = p.row + dr, nc = p.col + dc;
                        if (isValidSquare(nr, nc) && !occupiedMap[`${nr},${nc}`]) validMoves.push({ r: nr, c: nc });
                    });
                } else if (p.type === 'rook') {
                    [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr, dc]) => {
                        for (let step = 1; step < 6; step++) {
                            const nr = p.row + dr * step, nc = p.col + dc * step;
                            if (!isValidSquare(nr, nc) || occupiedMap[`${nr},${nc}`]) break;
                            validMoves.push({ r: nr, c: nc });
                        }
                    });
                } else if (p.type === 'bishop') {
                    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => {
                        for (let step = 1; step < 6; step++) {
                            const nr = p.row + dr * step, nc = p.col + dc * step;
                            if (!isValidSquare(nr, nc) || occupiedMap[`${nr},${nc}`]) break;
                            validMoves.push({ r: nr, c: nc });
                        }
                    });
                }

                for (const m of validMoves) {
                    const nextPieces = piecesState.map((pc, idx) => idx === i ? { ...pc, row: m.r, col: m.c } : pc);
                    const nextStateStr = nextPieces.map(pc => `${pc.row},${pc.col}`).join('|');

                    if (!visited.has(nextStateStr)) {
                        visited.add(nextStateStr);
                        queue.push({
                            stateStr: nextStateStr,
                            piecesState: nextPieces,
                            path: [...path, { pieceId: p.id, toRow: m.r, toCol: m.c }]
                        });
                    }
                }
            }
        }
        return null;
    }

    // --- Hint Feature ---
    function showHint() {
        if (!gameActive || isSolving) return;

        clearHighlights();
        const solutionPath = solveBFSPath();

        if (solutionPath && solutionPath.length > 0) {
            const nextMove = solutionPath[0];
            const piece = pieces.find(p => p.id === nextMove.pieceId);

            const sourceSq = document.getElementById(`square-${piece.row}-${piece.col}`);
            const targetSq = document.getElementById(`square-${nextMove.toRow}-${nextMove.toCol}`);

            if (sourceSq) sourceSq.classList.add('hint-source');
            if (targetSq) targetSq.classList.add('hint-target');

            messageDisplay.textContent = `💡 Hint: Move ${piece.name} to Row ${nextMove.toRow + 1}, Col ${nextMove.toCol + 1}!`;
        } else {
            messageDisplay.textContent = "No valid path found from this board state. Try undoing!";
        }
    }

    // --- Animated Auto-Solve ---
    function triggerAutoSolve() {
        if (!gameActive) startGame();
        if (isSolving) return;

        clearHighlights();
        if (selectedPiece) {
            selectedPiece.element.classList.remove('selected');
            selectedPiece = null;
        }

        const solutionPath = solveBFSPath();
        if (!solutionPath || solutionPath.length === 0) {
            messageDisplay.textContent = "Unable to auto-solve from this state. Resetting board...";
            return;
        }

        isSolving = true;
        messageDisplay.textContent = "🤖 Computer AI takes over! Watch closely...";

        let stepIndex = 0;
        const animationInterval = setInterval(() => {
            if (stepIndex >= solutionPath.length) {
                clearInterval(animationInterval);
                isSolving = false;
                checkWinCondition(true); // Trigger NPC win
                return;
            }

            const step = solutionPath[stepIndex];
            const piece = pieces.find(p => p.id === step.pieceId);
            if (piece) {
                movePiece(piece, step.toRow, step.toCol);
            }
            stepIndex++;
        }, 350); // Smooth 350ms per step move
    }

    // --- Win Handling & High Scores ---
    function checkWinCondition(isNPC = false) {
        const blackKnight = pieces.find(p => p.id === 'bk');
        if (blackKnight && blackKnight.row === TARGET_ROW && blackKnight.col === TARGET_COL) {
            stopTimer();
            gameActive = false;
            launchFireworks();

            if (isNPC) {
                const randomNpcName = npcNames[Math.floor(Math.random() * npcNames.length)];
                saveScoreData(randomNpcName, true);
                messageDisplay.textContent = `🤖 Auto-solved by ${randomNpcName}! Recorded to leaderboard.`;
                startOverlay.style.display = 'flex';
                startBtn.textContent = 'Play Again';
            } else {
                if (isHighScore(timerSeconds, moveCount, false)) {
                    finalTimeDisplay.textContent = timerDisplay.textContent;
                    finalMovesDisplay.textContent = moveCount;
                    highscoreSideBox.classList.remove('hidden');
                    playerNameInput.focus();
                    messageDisplay.textContent = "Congratulations! You earned a spot on the leaderboard!";
                } else {
                    const randomSnark = snarkyMessages[Math.floor(Math.random() * snarkyMessages.length)];
                    messageDisplay.textContent = randomSnark;
                    startOverlay.style.display = 'flex';
                    startBtn.textContent = 'Play Again';
                }
            }
        }
    }

    saveScoreBtn.addEventListener('click', () => {
        const name = playerNameInput.value.trim() || 'Human Player';
        saveScoreData(name, false);
        highscoreSideBox.classList.add('hidden');
        playerNameInput.value = '';
        messageDisplay.textContent = `Great work ${name}! Your high score is registered.`;
        startOverlay.style.display = 'flex';
        startBtn.textContent = 'Play Again';
    });

    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveScoreBtn.click();
    });

    function saveScoreData(name, isNPC) {
        const scores = getScores();
        const newScore = {
            name: name,
            isNPC: isNPC,
            date: new Date().toLocaleDateString(),
            timeSec: timerSeconds,
            timeFormatted: timerDisplay.textContent,
            moves: moveCount
        };

        scores.push(newScore);
        const sorted = sortScoresWithHumanPrecedence(scores);
        const top5 = sorted.slice(0, 5);

        localStorage.setItem('bkp_highscores', JSON.stringify(top5));
        renderLeaderboard();
    }

    // --- Human Precedence Sorting Logic ---
    function sortScoresWithHumanPrecedence(scoresList) {
        return scoresList.sort((a, b) => {
            // Rule 1: Humans (isNPC: false) ALWAYS beat NPCs (isNPC: true)
            if (a.isNPC !== b.isNPC) {
                return a.isNPC ? 1 : -1;
            }
            // Rule 2: Among same tier (Human vs Human or NPC vs NPC), sort by Time, then Moves
            return a.timeSec - b.timeSec || a.moves - b.moves;
        });
    }

    function isHighScore(timeSec, moves, isNPC) {
        const scores = getScores();
        if (scores.length < 5) return true;

        const simulated = [...scores, { isNPC, timeSec, moves }];
        const sorted = sortScoresWithHumanPrecedence(simulated);
        const top5 = sorted.slice(0, 5);

        return top5.some(s => s.timeSec === timeSec && s.moves === moves && s.isNPC === isNPC);
    }

    function getScores() {
        const saved = localStorage.getItem('bkp_highscores');
        return saved ? JSON.parse(saved) : [];
    }

    function renderLeaderboard() {
        const scores = getScores();
        leaderboardBody.innerHTML = '';

        if (scores.length === 0) {
            leaderboardBody.innerHTML = `<tr><td colspan="5" style="color: #777;">No high scores yet!</td></tr>`;
            return;
        }

        scores.forEach((s, idx) => {
            const tr = document.createElement('tr');
            const npcPrefix = s.isNPC ? `<span class="npc-tag">🤖</span>` : '';
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${npcPrefix}${escapeHtml(s.name)}</td>
                <td>${s.date}</td>
                <td>${s.timeFormatted}</td>
                <td>${s.moves}</td>
            `;
            leaderboardBody.appendChild(tr);
        });
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    }

    // --- Fireworks Effect ---
    function launchFireworks() {
        const ctx = fireworksCanvas.getContext('2d');
        fireworksCanvas.width = gameBoard.clientWidth;
        fireworksCanvas.height = gameBoard.clientHeight;

        let particles = [];
        const colors = ['#1db954', '#ffffff', '#ffd700', '#ff4d4d', '#4da6ff'];

        for (let i = 0; i < 60; i++) {
            particles.push({
                x: fireworksCanvas.width / 2,
                y: fireworksCanvas.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                radius: Math.random() * 3 + 1,
                alpha: 1
            });
        }

        let frame = 0;
        function animate() {
            ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.02;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.fill();
            });

            particles = particles.filter(p => p.alpha > 0);

            if (particles.length > 0 && frame < 100) {
                frame++;
                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
            }
        }
        animate();
    }

    // Initial render of saved scores
    renderLeaderboard();
});