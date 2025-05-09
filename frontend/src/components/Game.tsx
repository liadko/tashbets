import { useEffect, useState, useMemo, useCallback } from 'react'
import './Game.css'
import Cluebar from './Clubar'
import Grid from './Grid'
import ClueStack from './ClueStack'
import LoginPage from './LoginPage'
import { useWebSocket } from './useWebSocket'

import type { Cell, RawCell, GridState, Clue, RawClue, SelectedClueData, RawPuzzleData, PlayerState } from '../types/gameTypes'

export default function Game() {
    // ----------- constants -----------

    const initialPlayerState: PlayerState = {
        cell: [-1, -1],
        dir: 0,  // 0 = horizontal, 1 = vertical
    }
    const gridSize = 5

    // ----------- puzzle state -----------
    const [puzzleData, setPuzzleData] = useState<RawPuzzleData | null>(null)
    const [gridState, setGrid] = useState<GridState>(() => createGrid(null))

    // ----------- player state -----------
    const [loggedIn, setLoggedIn] = useState(true)
    const [playerState, setPlayerState] = useState<PlayerState>(initialPlayerState)



    // ----------- Networking -----------

    // const { sendMessage } = useWebSocket('ws://localhost:8080/ws', useCallback((msg) => {
    //     console.log("Server Message: ", msg)
    //     // your handling logic
    // }, [])
    // )

    // const handleSend = () => {
    //     console.log("Sending Message")
    //     const message = { type: 'guess', cell: [1, 2], letter: 'A' }
    //     sendMessage(message)
    // }

    // ----------- Effects -----------

    // load puzzle json
    useEffect(() => {
        fetch("2024-12-26.json")
            .then((res) => res.json())
            .then((data : RawPuzzleData) => {
                setPuzzleData(data)
                const newGrid = createGrid(data?.body[0].cells ?? null)
                setGrid(newGrid)
                startGame(newGrid)
            })
            .catch((err) => {
                console.error("Error loading puzzle json", err)
            })
    }, [])

    // key input
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (!gridState || !puzzleData) return // don't allow clicks before grid has formed

            // arrows
            let arrowDirection = 0
            let specificArrow: (-1 | 0 | 1) = 0 // default 0
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
                if (arrowDirection != playerState.dir) setDir(arrowDirection as 0 | 1)

                // moving with direction
                else setCell(movedSelected(arrowDirection, specificArrow))
            }

            // letter input
            else if (/^[a-zA-z]$/.test(event.key)) {
                const char = event.key.toUpperCase()
                //if (char != getCell(playerState.cell, gridState).guess) handleSend()

                editGuess(playerState.cell, char)

                const nextPosition = movedSelected(playerState.dir, 1)
                if (nextPosition[0] == playerState.cell[0] &&
                    nextPosition[1] == playerState.cell[1]) {
                    const teleportLocation = getFirstEmptyCellPos(
                        playerState.cell[playerState.dir], playerState.dir, gridState)
                    if (teleportLocation) setCell(teleportLocation)
                }
                else
                    setCell(nextPosition)

            }

            // backspace - delete letter
            else if (event.key == "Backspace") {
                // erasing self
                if (getCell(playerState.cell, gridState).guess?.length) {
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
                if (!puzzleData || !selectedClues) return

                const currentIndex = selectedClues.mainClueId;
                const nextClueIndex = (currentIndex + 1) % parsedClues.length;
                const nextClue = parsedClues[nextClueIndex];
            
                const clueFirstCellIndex = nextClue.cells[0];
                smartTeleport(getGridPosByCellIndex(clueFirstCellIndex), nextClue.dir, gridState);
            
            }

        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [gridState, playerState])


    // Game Logic
    function startGame(grid: GridState) {
        // const firstCell = getValidCell(grid)
        // setCell(firstCell)
        smartTeleport([0, 0], 0, grid)
    }

    // Player State Functions
    function setDir(newDir: 0 | 1) {

        setPlayerState((prev) => ({
            ...prev,
            dir: newDir
        }))
    }
    function setCell(newCell: [number, number]) {
        setPlayerState((prev) => ({
            ...prev,
            cell: newCell
        }))
    }
    // gets cell and direction. moves selection to nearest empty cell.
    // if line is full goes to the initially requested cell
    //initialCellPos = [int, int] , dir = 0 or 1 
    function smartTeleport(initialCellPos: [number, number], dir: 0 | 1, grid: GridState | null) {

        if (grid === null) grid = gridState


        const moveDirection = dir ^ 1
        let currentCellPos = [...initialCellPos] as [number, number]
        let currentCell = getCell(initialCellPos, grid)
        while (currentCell.isBlock || currentCell.guess != "") {
            currentCellPos[moveDirection]++

            if (currentCellPos[moveDirection] >= gridSize) {
                currentCellPos = initialCellPos
                break
            }

            currentCell = getCell(currentCellPos, grid)
        }

        setPlayerState((prev) => ({
            ...prev,
            cell: currentCellPos
        }))

        setDir(dir)
    }

    // Grid functions 
    function createGrid(rawCells: RawCell[] | null): GridState {
        const size = 5//Math.sqrt(rawAnswers.length)
        const grid: GridState = []

        const validGrid = !!rawCells


        for (let row = 0; row < size; row++) {
            const rowData = []

            for (let col = 0; col < size; col++) {
                const cellIndex = row * size + col
                const rawCell = rawCells?.[cellIndex]

                const isBlock = (rawCell?.answer) == undefined

                const answer = rawCell?.answer
                const label = rawCell?.label
                const clueIds = rawCell?.clues

                const cell: Cell = {
                    row,
                    col,

                    guess: "",
                    answer,
                    isBlock,
                    label,
                    clueIds,
                };

                rowData.push(cell)
            }

            grid.push(rowData)
        }

        return grid
    }

    function editGuess(cellPos: [number, number], newGuess: string) {
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
    function getCell(cellPos: [number, number], grid: GridState): Cell {
        if (!Array.isArray(cellPos) || cellPos.length != 2) {
            throw new Error(`Invalid cell: ${cellPos}`)
        }

        return grid[cellPos[0]][cellPos[1]]
    }

    // returns undefined if doesn't exist
    function getFirstEmptyCellPos(positionIndex: number, dir: 0 | 1, grid: GridState): [number, number] | undefined {

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
    function movedSelected(direction: 0 | 1, move: -1 | 1): [number, number] {
        const movementAxis = direction ^ 1
        const updatedCell = [...playerState.cell] as [number, number]

        updatedCell[movementAxis] += move

        // check if current cell is invalid, if so, trace back the movement
        if (updatedCell[movementAxis] < 0 || updatedCell[movementAxis] >= gridSize
            || gridState[updatedCell[0]][updatedCell[1]].isBlock)
            updatedCell[movementAxis] -= move

        return updatedCell

    }

    // assumes live gridState
    function handleClickCell(row: number, col: number) {
        if (!gridState) return // don't allow clicks before grid has formed


        if (row == playerState.cell[0] && col == playerState.cell[1]) {
            setDir((playerState.dir ^ 1) as 0 | 1)
            return
        }

        // blocked cell
        if (gridState[row][col].isBlock)
            return


        // clicked on other cell
        setCell([row, col])
    }

    // Clue functions

    const parsedClues: Clue[] = useMemo<Clue[]>(() => {
        return (puzzleData?.body[0].clues ?? []).map((clue: RawClue, index) => ({
            id: index,
            label: clue.label,
            text: clue.text[0]?.plain ?? "ERROR PARSING CLUE",
            dir: clue.direction == "Across" ? 0 : 1,
            cells: clue.cells,
            relatives: clue.relatives
        }))
    }, [puzzleData])

    // currently selected clue
    const selectedClues: SelectedClueData | undefined = useMemo(() => {
        const clueIds = gridState?.[playerState.cell[0]]?.[playerState.cell[1]]?.clueIds
        
        if(clueIds == undefined) return undefined

        return {
            mainClueId: clueIds[playerState.dir],
            siblingClueId: clueIds[playerState.dir ^ 1],
            dir: playerState.dir
        };
    }, [playerState, puzzleData, gridState])


    function getGridPosByCellIndex(cellIndex: number) {
        return [Math.floor(cellIndex / 5), cellIndex % 5] as [number, number]
    }

    // ----------- Render -----------
    return (
        <>
            <div className="container">
                <div className="puzzle-area">
                    <Cluebar clues={parsedClues} selectedClues={selectedClues} />
                    <Grid grid={gridState} playerState={playerState} onCellClick={handleClickCell} clues={parsedClues} selectedClues={selectedClues} />

                </div>
                {loggedIn ? (
                    <ClueStack
                        clues={parsedClues}
                        selectedClues={selectedClues}
                        teleport={smartTeleport} />
                ) : (
                    <LoginPage />)}
            </div>
        </>

    )
}



