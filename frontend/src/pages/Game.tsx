import { useEffect, useState, useMemo, useCallback } from 'react'
import './Game.css'
import Cluebar from '../components/Clubar'
import Grid from '../components/Grid'
import EnemyGrid from '../components/EnemyGrid'
import ClueStack from '../components/ClueStack'
import { useWebSocket } from '../hooks/useWebSocket'
import { usePlayerState } from '../hooks/usePlayerState'
import { useNavigate } from 'react-router-dom';


import type { Cell, RawCell, GridState, Clue, RawClue, SelectedClueData, RawPuzzleData, PlayerState, EnemyState } from '../types/gameTypes'
import { createGrid, editGuess, getCell, getFirstEmptyCellPos, moveSelected, getGridPosByCellIndex } from '../utils/gridUtils'
import { smartTeleport } from '../utils/playerUtils'

export default function Game() {
    // ----------- constants -----------

    const initialPlayerState: PlayerState = {
        cell: [-1, -1],
        dir: 0,  // 0 = horizontal, 1 = vertical
    }

    const tempEnemyState: EnemyState = {
        filledCells: [
            false, false, false, false, false, 
            false, false, false, false, false, 
            true, true, true, true, false, 
            false, false, false, false, false, 
            false, false, false, false, false, 
        ],
        selectedCellIndex: 10
    }
    const gridSize = 5

    // ----------- puzzle state -----------
    const [puzzleData, setPuzzleData] = useState<RawPuzzleData | null>(null)
    const [gridState, setGrid] = useState<GridState>(() => createGrid(null))

    // ----------- player state -----------
    const [loggedIn, setLoggedIn] = useState(true)
    const { playerState, setDir, setCell } = usePlayerState(initialPlayerState)
    const [isReady, setReady] = useState<boolean>(false)

    // ----------- site state -----------
    const navigate = useNavigate()


    // ----------- Networking -----------
    const [enemyState, setEnemyState] = useState<EnemyState>(tempEnemyState)

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
            .then((data: RawPuzzleData) => {
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
                else setCell(moveSelected(arrowDirection, specificArrow, playerState, gridState))
            }

            // letter input
            else if (/^[a-zA-z]$/.test(event.key)) {
                const char = event.key.toUpperCase()
                //if (char != getCell(playerState.cell, gridState).guess) handleSend()

                setGrid(prev => editGuess(prev, playerState.cell, char))

                const nextPosition = moveSelected(playerState.dir, 1, playerState, gridState)
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
                    setGrid(prev => editGuess(prev, playerState.cell, ""))
                }
                // erasing behind
                else {
                    const newCell = moveSelected(playerState.dir, -1, playerState, gridState)
                    setGrid(prev => editGuess(prev, newCell, ""))
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
        handleTeleport([0, 0], 0, grid)
        
    }

    function handleTeleport(initialCellPos: [number, number], dir: 0 | 1, grid?: GridState) {
        if(grid === undefined) grid = gridState

        const { newCell, newDir } = smartTeleport(initialCellPos, dir, grid)

        setCell(newCell)
        setDir(newDir)
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

    const parsedClues = useMemo<Clue[]>(() => {
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
    const selectedClues = useMemo<SelectedClueData | undefined>(() => {
        const clueIds = gridState?.[playerState.cell[0]]?.[playerState.cell[1]]?.clueIds

        if (clueIds == undefined) return undefined

        return {
            mainClueId: clueIds[playerState.dir],
            siblingClueId: clueIds[playerState.dir ^ 1],
            dir: playerState.dir
        };
    }, [playerState, puzzleData, gridState])


    // ----------- Render -----------
    return (
        <>
            <div className='game-container'>
                <div className="navbar">
                    <img src="/close.svg" className="close-button" alt="Close"
                        onClick={() => navigate("/")} />

                    <div className="room-code" onClick={() => navigator.clipboard.writeText("FSAW")}>
                        ROOM: <span>FSAW</span>
                        <img src="/copy-paste.svg" className="copy-icon" alt="Copy" />
                    </div>
                </div>

                <div className="player-side">
                    <div className='grid-cluestack'>



                        <div className="puzzle-area">
                            <div className="info-bar">
                                <span className='nametag'>Liad</span>
                                <span className='timer'>00:00</span>
                            </div>
                            <Cluebar clues={parsedClues} selectedClues={selectedClues} />
                            <Grid grid={gridState} playerState={playerState} onCellClick={handleClickCell} clues={parsedClues} selectedClues={selectedClues} />

                        </div>
                        <div className='cluestack-wrapper blurred'>

                            <ClueStack
                                clues={parsedClues}
                                selectedClues={selectedClues}
                                teleport={handleTeleport} />

                            <div className='cluestack-overlay'>
                                <button className='ready-button'>READY</button>
                            </div>


                        </div>

                    </div>
                </div>
                <div className='enemy-side'>
                    <EnemyGrid grid={gridState} enemyState={enemyState}/>
                    <EnemyGrid grid={gridState} enemyState={enemyState}/>
                </div>
            </div>
        </>

    )
}



