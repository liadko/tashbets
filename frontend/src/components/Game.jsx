import { useEffect, useState, useMemo } from 'react'
import './Game.css'
import Cluebar from './Clubar'
import Grid from './Grid'
import ClueStack from './ClueStack'

function Game() {
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
    const [gridState, setGrid] = useState(() => createGrid(null))



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
            if (!gridState) return // don't allow clicks before grid has formed

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
                editGuess(playerState.cell, char)

                const nextPosition =  movedSelected(playerState.dir, 1)
                if(nextPosition[0] == playerState.cell[0] && 
                    nextPosition[1] == playerState.cell[1]){
                    const teleportLocation = getFirstEmptyCellPos(
                        playerState.cell[playerState.dir], playerState.dir, gridState)
                    if(teleportLocation) setCell(teleportLocation)
                }
                else
                    setCell(nextPosition)
            }

            // backspace - delete letter
            else if (event.key == "Backspace") {
                // erasing self
                if (gridState[playerState.cell[0]][playerState.cell[1]].guess.length) {
                    editGuess(playerState.cell, "")
                }
                // erasing behind
                else {
                    const newCell = movedSelected(playerState.dir, -1)
                    editGuess(newCell, "")
                    setCell(newCell)
                }

            }

            // enter - skip clue
            else if (event.key == "Enter") {

                const nextClueIndex = (selectedClues.clue_ids[selectedClues.dir] + 1) % parsedClues.length
                const nextClue = parsedClues[nextClueIndex]
                const clueFirstCell = nextClue.cells[0]
                smartTeleport(getGridPosByCellIndex(clueFirstCell), nextClue.dir, gridState)

            }

        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [gridState, playerState])


    // Game Logic
    function startGame(grid) {
        // const firstCell = getValidCell(grid)
        // setCell(firstCell)
        smartTeleport([0, 0], 0, grid)
    }

    // Player State Functions
    function setDir(newDir) {
        if (newDir !== 0 && newDir !== 1) {
            throw new Error(`Invalid direction: ${newDir}`)
        }

        setPlayerState((prev) => ({
            ...prev,
            dir: newDir
        }))
    }
    function setCell(newCell) {
        if (!Array.isArray(newCell)) {
            throw new Error(`Invalid cell: ${newCell}`)
        }

        setPlayerState((prev) => ({
            ...prev,
            cell: newCell
        }))
    }
    // gets cell and direction. moves selection to nearest empty cell.
    // if line is full goes to the initially requested cell
    //initialCellPos = [int, int] , dir = 0 or 1 
    function smartTeleport(initialCellPos, dir, grid) {
        if (!Array.isArray(initialCellPos)) {
            throw new Error(`Invalid cell: ${initialCellPos}`)
        }

        if (grid === undefined) grid = gridState
        if (typeof dir === 'string') {
            if (dir != "Across" && dir != "Down") throw new Error(`Invalid dir: ${dir}`)
            dir = dir == "Across" ? 0 : 1;
        }


        const moveDirection = dir ^ 1
        let currentCellPos = [...initialCellPos];
        let currentCell = getCell(initialCellPos, grid)
        while (currentCell.isBlock || currentCell.guess != "") {
            currentCellPos[moveDirection]++;

            if (currentCellPos[moveDirection] >= gridSize) {
                currentCellPos = initialCellPos
                break;
            }

            currentCell = getCell(currentCellPos, grid);
        }

        setPlayerState((prev) => ({
            ...prev,
            cell: currentCellPos
        }))

        setDir(dir)
    }

    // Grid functions 
    function createGrid(rawCells) {
        const size = 5//Math.sqrt(rawAnswers.length)
        const grid = []

        const validGrid = !!rawCells


        for (let row = 0; row < size; row++) {
            const rowData = []

            for (let col = 0; col < size; col++) {
                const cellIndex = row * size + col
                const rawCell = rawCells?.[cellIndex]

                const isBlock = validGrid && (!rawCell?.answer)

                let answerChar = "???"; let label = undefined; let clues = undefined;
                if (validGrid && !isBlock) {
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

        return grid
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
    function getCell(cellPos, grid) {
        if (!Array.isArray(cellPos) || cellPos.length != 2) {
            throw new Error(`Invalid cell: ${cellPos}`)
        }

        return grid[cellPos[0]][cellPos[1]]
    }

    // returns undefined if doesn't exist
    function getFirstEmptyCellPos(positionIndex, dir, grid) {

        for (let i = 0; i < 5; i++) {
            if (dir == 0 && grid[positionIndex][i].guess == "" && !grid[positionIndex][i].isBlock) {
                return [positionIndex, i]
            }
            else if (dir == 1 && grid[i][positionIndex].guess == "" && !grid[i][positionIndex].isBlock) {
                return [i, positionIndex]
            }
        }

        return undefined

    }
    // assumes live gridState
    function movedSelected(direction, move) {
        const movementAxis = direction ^ 1
        const updatedCell = [...playerState.cell]

        updatedCell[movementAxis] += move

        // check if current cell is invalid, if so, trace back the movement
        if (updatedCell[movementAxis] < 0 || updatedCell[movementAxis] >= gridSize
            || gridState[updatedCell[0]][updatedCell[1]].isBlock)
            updatedCell[movementAxis] -= move

        return updatedCell

    }

    // assumes live gridState
    function handleClickCell(row, col) {
        if (!gridState) return // don't allow clicks before grid has formed


        if (row == playerState.cell[0] && col == playerState.cell[1]) {
            setDir(playerState.dir ^ 1)
            return
        }

        // blocked cell
        if (gridState[row][col].isBlock)
            return


        // clicked on other cell
        setCell([row, col])
    }

    // Clue functions

    const parsedClues = useMemo(() => {
        return (puzzleData?.body[0]?.clues ?? []).map((clue, index) => ({
            id: index,
            label: clue.label,
            text: clue.text[0].plain,
            dir: clue.direction,
            cells: clue.cells,
            relatives: clue.relatives
        }))
    }, [puzzleData])

    // currently selected clue
    const selectedClues = useMemo(() => {
        const clue_ids = gridState?.[playerState.cell[0]]?.[playerState.cell[1]]?.clues
        return { clue_ids, dir: playerState.dir }
    }, [playerState, puzzleData, gridState])

    function getGridPosByCellIndex(cellIndex) {
        return [Math.floor(cellIndex / 5), cellIndex % 5]
    }

    //  TODO
    // ----------- Render -----------
    return (
        <>
            <div className="container">
                <div className="puzzle-area">
                    <Cluebar clues={parsedClues} selectedClues={selectedClues} />
                    <Grid grid={gridState} playerState={playerState} onCellClick={handleClickCell} clues={parsedClues} selectedClues={selectedClues} />

                </div>
                <ClueStack clues={parsedClues} selectedClues={selectedClues} teleport={smartTeleport} />
            </div>
        </>

    )
}

export default Game


