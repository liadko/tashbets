import { useEffect, useState, useMemo, useCallback } from 'react'
import './Game.css'
import Cluebar from '../components/Clubar'
import Grid from '../components/Grid'
import EnemyGrid from '../components/EnemyGrid'
import ClueStack from '../components/ClueStack'
import { useWebSocket } from '../hooks/useWebSocket'
import { usePlayerState } from '../hooks/usePlayerState'
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext'



import type { Cell, RawCell, GridState, Clue, RawClue, SelectedClueData, RawPuzzleData, PlayerState, GhostState, EnemyState } from '../types/gameTypes'
import { createGrid, editGuess, getCell, getFirstEmptyCellPos, moveSelected, getGridPosByCellIndex, getAnswerString } from '../utils/gridUtils'
import { smartTeleport } from '../utils/playerUtils'
import { getDefaultEnemyState, getGhostState } from '../utils/ghostUtils'
import { Toast, Toaster } from '../components/Toaster'


type GameProps = {
    sendMessage: (msg: any) => boolean;
    setMessageHandler: (fn: (msg: any) => void) => void;
    serverStatus: 'open' | 'connecting' | 'closed';
}
export default function Game({ sendMessage, setMessageHandler, serverStatus }: GameProps) {
    // ----------- constants -----------

    const initialPlayerState: PlayerState = {
        cell: [-1, -1],
        dir: 0,  // 0 = horizontal, 1 = vertical
    }

    // ----------- puzzle state -----------
    const [puzzleData, setPuzzleData] = useState<RawPuzzleData | null>(null)
    const [gridState, setGrid] = useState<GridState>(() => createGrid(null))
    const answerString = useMemo(() => getAnswerString(gridState), [gridState])
    const [puzzleDate, setPuzzleDate] = useState("")

    // ----------- player state -----------
    const { playerState, setDir, setCell } = usePlayerState(initialPlayerState)
    const [isReady, setReady] = useState<boolean>(false)

    // ----------- site state -----------
    const navigate = useNavigate()
    const { name, roomCode, id } = useSession();

    const [gameRunning, setGameRunning] = useState<boolean>(false)
    const [startTime, setStartTime] = useState<number>(0)
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)

    // ----------- Networking -----------
    const [enemies, setEnemies] = useState<Record<string, EnemyState>>({})


    // player state updater
    useEffect(() => {
        sendMessage({
            "type": "update_state",
            "ready": isReady,
            "ghostState": getGhostState(gridState, playerState),
            "answerString": answerString,
        })
    }, [gridState, playerState, isReady])


    // fetch info about room. single time thing
    useEffect(() => {
        sendMessage({
            "type": "get_room_info",
        })
    }, [])

    // ----------- Effects -----------
    // server status listener
    useEffect(() => {
        if (serverStatus === 'closed')
            leaveRoom()
    }, [serverStatus])

    // Message Handling
    useEffect(() => {
        setMessageHandler((msg) => {
            if (msg.type === "room_info") {

                const enemyList: Record<string, EnemyState> = {}
                for (const player of msg.players) {
                    if (player.id === id) continue

                    const enemyState: EnemyState = {
                        id: player.id,
                        name: player.name,
                        ready: player.ready,
                        ghostState: player.ghostState
                    }
                    enemyList[player.id] = enemyState
                }

                setEnemies(enemyList)
                loadPuzzleData(msg.puzzleData)
                setPuzzleDate(msg.puzzleDate)
            }
            else if (msg.type === "new_player_joined") {
                console.log("Someone joined with id:", msg.id)

                setEnemies((prev) => ({
                    ...prev,
                    [msg.id]: getDefaultEnemyState(msg.id, msg.name)
                }))
            }
            else if (msg.type === "player_left") {
                console.log("Player left with id", msg.id)

                setEnemies((prev) => {
                    const updated = { ...prev };
                    delete updated[msg.id];
                    return updated;
                });
            }
            else if (msg.type === "player_update") {

                setEnemies((prev) => ({
                    ...prev,
                    [msg.id]: {
                        ...prev[msg.id],
                        ready: msg.ready,
                        ghostState: msg.ghostState
                    }
                }))
            }
            else if (msg.type === "game_start") {
                console.log("AYO game starting")
                setGameRunning(true)
                setStartTime(msg.start_time)
            }
            else
                console.log("Unrecognised message from server, type:", msg.type)
        })
    }, [setMessageHandler])


    function loadPuzzleData(puzzleData: RawPuzzleData) {
        if(puzzleData.body[0].cells.length != 25) {
            console.log("puzzleData is not not 5x5, problem")
        }
        setPuzzleData(puzzleData)
        const newGrid = createGrid(puzzleData.body[0].cells)
        setGrid(newGrid)
        initGrid(newGrid)
    }

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
                if (!selectedClues) return

                const currentIndex = selectedClues.mainClueId;
                const nextClueIndex = (currentIndex + 1) % parsedClues.length;
                const nextClue = parsedClues[nextClueIndex];

                const clueFirstCellIndex = nextClue.cells[0];
                handleTeleport(getGridPosByCellIndex(clueFirstCellIndex), nextClue.dir, gridState)
            }

        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [gridState, playerState])

    // refresh kicks to landing page
    useEffect(() => {
        if (!name || !roomCode) {
            leaveRoom()
        }
    }, [name, roomCode]);

    // Game Logic
    function initGrid(grid: GridState) {
        // const firstCell = getValidCell(grid)
        // setCell(firstCell)
        handleTeleport([0, 0], 0, grid)

    }

    function readyClick() {
        setReady(prev => !prev)
    }

    function handleTeleport(initialCellPos: [number, number], dir: 0 | 1, grid?: GridState) {
        if (grid === undefined) grid = gridState

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

    function leaveRoom() {
        sendMessage({
            "type": "leave_room"
        })
        navigate("/")
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

    // Timer
    useEffect(() => {
        if (!gameRunning || !startTime) return

        const tick = () => {
            const now = Date.now()
            setElapsedSeconds(Math.floor((now - startTime * 1000) / 1000))
        }

        tick() // update immediately
        const interval = setInterval(tick, 200)

        return () => clearInterval(interval)
    }, [gameRunning, startTime])

    const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')
    const seconds = String(elapsedSeconds % 60).padStart(2, '0')

    // ----------- Render -----------
    return (
        <>
            <div className='game-container'>
                <div className="navbar">
                    <img src="/close.svg" className="close-button" alt="Close"
                        onClick={leaveRoom} />

                    <div className="room-code" onClick={() => navigator.clipboard.writeText(roomCode)}>
                        ROOM: <span>{roomCode}</span>
                        <img src="/copy-paste.svg" className="copy-icon" alt="Copy" />
                    </div>

                    <span className='puzzle-date'>{puzzleDate}</span>

                </div>

                <div className="player-side">
                    <div className='grid-cluestack'>


                        <div className="puzzle-area">
                            <div className="info-bar">
                                <span className='nametag'>{name}</span>
                                <span className='timer'>
                                    {minutes}:{seconds}
                                </span>
                            </div>
                            <Cluebar clues={parsedClues} selectedClues={selectedClues} gameRunning={gameRunning} />
                            <Grid grid={gridState} playerState={playerState} onCellClick={handleClickCell} clues={parsedClues} selectedClues={selectedClues} />

                        </div>
                        <div className={"cluestack-wrapper" + (gameRunning ? "" : " blurred")}>

                            <ClueStack
                                clues={parsedClues}
                                selectedClues={selectedClues}
                                teleport={handleTeleport} />

                            {!gameRunning && <div className='cluestack-overlay'>
                                <button className={"ready-button" + (isReady ? " filled" : "")} onClick={readyClick}>READY</button>
                            </div>}


                        </div>

                    </div>
                </div>
                <div className='enemy-side'>
                    {Object.values(enemies).map((enemy) => (
                        <EnemyGrid
                            key={enemy.id}
                            grid={gridState}
                            enemyState={enemy}
                        />
                    ))}
                </div>

            </div>
        </>

    )
}



