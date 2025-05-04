import { useEffect, useState, useRef } from 'react'
import './PuzzleViewer.css'


function PuzzleViewer() {
    // ----------- state -----------
    const initialGrid = [
        ["D", "", "", "", ""],
        ["", "B", "", "", ""],
        ["", "", "C", "", ""],
        ["", "", "", "D", "."],
        ["", "", "", "", "."],
    ]

    const initialPlayerState = {
        cell: [-1, -1],
        dir: 0,  // 0 horiz. 1 vert.
    }
    const gridSize = 5
    const [puzzleData, setPuzzleData] = useState(null)


    const [playerState, setPlayerState] = useState(initialPlayerState)
    const [grid, setGrid] = useState(() => createGrid(null))



    // ----------- Effects -----------

    // load puzzle json
    useEffect(() => {
        fetch("2024-12-26.json")
            .then((res) => res.json())
            .then((data) => {
                setPuzzleData(data)
                const newGrid = createGrid(data.body[0].cells)
                setGrid(newGrid)
                startGame(newGrid)
            })
            .catch((err) => {
                console.error("Error loading puzzle json", err)
            })
    }, [])

    // key input
    useEffect(() => {
        function handleKeyDown(event) {
            if(!grid) return; // don't allow clicks before grid has formed

            // arrows
            let arrowDirection = 0
            let specificArrow = 0 // default 0
            if (event.key === "ArrowLeft") specificArrow = -1
            else if (event.key === "ArrowRight") specificArrow = 1
            else if (event.key === "ArrowUp") {
                arrowDirection = 1
                specificArrow = -1
            }
            else if (event.key === "ArrowDown") {
                arrowDirection = 1
                specificArrow = 1
            }

            // arrow was pressed
            if (specificArrow != 0) {
                // changing direction
                if (arrowDirection != playerState.dir) setDir(arrowDirection)

                // moving with direction
                else setCell(movedSelected(arrowDirection, specificArrow))
            }

            // letter input
            else if (/^[a-zA-z]$/.test(event.key)) {
                const char = event.key.toUpperCase()
                console.log(char)
                editGuess(playerState.cell, char)

                setCell(movedSelected(playerState.dir, 1))
            }

            // backspace
            else if (event.key == "Backspace") {
                // erasing self
                if (grid[playerState.cell[0]][playerState.cell[1]].guess.length) {
                    editGuess(playerState.cell, "")
                }
                // erasing behind
                else {
                    const newCell = movedSelected(playerState.dir, -1)
                    editGuess(newCell, "")
                    setCell(newCell)
                }

            }

        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [grid, playerState])

    function setDir(newDir) {
        if (newDir !== 0 && newDir !== 1) {
            throw new Error(`Invalid direction: ${newDir}`);
        }

        setPlayerState((prev) => ({
            ...prev,
            dir: newDir
        }))
    }
    function setCell(newCell) {
        if (!Array.isArray(newCell)) {
            throw new Error(`Invalid cell: ${newCell}`);
        }

        setPlayerState((prev) => ({
            ...prev,
            cell: newCell
        }))
    }

    function createGrid(rawCells) {
        const size = 5//Math.sqrt(rawAnswers.length);
        const grid = [];


        const validGrid = !!rawCells



        for (let row = 0; row < size; row++) {
            const rowData = []

            for (let col = 0; col < size; col++) {
                const cellIndex = row * size + col
                const rawCell = rawCells?.[cellIndex]

                const isBlock = validGrid && (!rawCell?.answer)

                let answerChar = "???"; let label = undefined; let clues = undefined;
                if(validGrid && !isBlock) {
                    answerChar = rawCell.answer
                    label = rawCell.label
                    clues = rawCell.clues
                }


                rowData.push({
                    row,
                    col,
                    guess: "",
                    answer: answerChar,
                    isBlock,
                    label,
                    clues,
                })
            }

            grid.push(rowData)
        }

        return grid;
    }

    function editGuess(cellPos, newGuess) {
        const [row, col] = cellPos

        setGrid((prev) => prev.map((rowData, r) =>
            rowData.map((cell, c) => {
                if (r === row && c === col) {
                    return {
                        ...cell,
                        guess: newGuess,
                    }
                }
                else 
                    return cell
            })
        )
        )
    }
    // ----------- Render Utilities -----------
    function startGame(grid) {
        const firstCell = getValidCell(grid);
        setCell(firstCell)
    }
    function getValidCell(grid) {
        for(let i = 0; i < gridSize; i++) {
            if(!grid[0][i].isBlock)
                return [0, i]
        }
        throw new Error("Couldn't find valid cell")
    }

    function handleClickCell(row, col) {
        if(!grid) return; // don't allow clicks before grid has formed

        if (row == playerState.cell[0] && col == playerState.cell[1]) {
            setDir(playerState.dir ^ 1)
            return
        }

        // blocked cell
        if (grid[row][col].isBlock)
            return

        // clicked on other cell
        setCell([row, col])
    }

    // depends on playerState and grid being live.
    function movedSelected(direction, move) {
        const movementAxis = direction ^ 1
        const updatedCell = [...playerState.cell]

        updatedCell[movementAxis] += move

        // check if current cell is invalid, if so, trace back the movement
        if (updatedCell[movementAxis] < 0 || updatedCell[movementAxis] >= gridSize
            || grid[updatedCell[0]][updatedCell[1]].isBlock)
            updatedCell[movementAxis] -= move

        return updatedCell

    }

    function getCellClass(row, col) {
        let classes = "cell "

        if (row == playerState.cell[0] && col == playerState.cell[1])
            classes += " selected"
        else if (grid && grid[row][col].isBlock)
            classes += " blocked"
        else if (playerState.dir == 0 && row == playerState.cell[0])
            classes += " highlighted"
        else if (playerState.dir == 1 && col == playerState.cell[1])
            classes += " highlighted"



        return classes
    }

    // ----------- Render -----------
    return (
        <>
            <div className="puzzle-area">
                <div className="clue-bar">
                    <div className="clue-label">1A</div>
                    <div className="clue-text">Niggin in the night?</div>
                </div>
                <div className="grid-wrapper">
                    <div className="grid"
                        style={{ "--grid-rows": grid.length }}>
                        {grid.map((rowData, rowId) =>
                            rowData.map((cell, colId) =>
                                <div key={`${rowId}-${colId}`}
                                    className={getCellClass(rowId, colId)}
                                    onClick={() => handleClickCell(rowId, colId)}>
                                    <span className="letter">{cell.guess}</span>
                                    <span className="number">{cell.label}</span>
                                </div>))
                        }
                    </div>
                </div>
            </div>
        </>

    )
}

export default PuzzleViewer


