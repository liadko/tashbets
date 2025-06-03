import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
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
import { createGrid, editGuess, getCell, getFirstEmptyCellPos, moveSelected, getGridPosByCellIndex, getAnswerString, fillGuesses } from '../utils/gridUtils'
import { copyToClipboard, smartTeleport } from '../utils/playerUtils'
import { getDefaultEnemyState, getGhostState, getTimeString } from '../utils/ghostUtils'
import { useCopyFlags } from '../hooks/useCopyFlags'


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
    const [puzzleDate, setPuzzleDate] = useState("")

    // ----------- player state -----------
    const { playerState, setDir, setCell } = usePlayerState(initialPlayerState)
    const [isReady, setReady] = useState<boolean>(false)

    // ----------- site state -----------
    const navigate = useNavigate()
    const { name, roomCode, id } = useSession();

    const [gameRunning, setGameRunning] = useState<boolean>(false)
    const [gameWon, setGameWon] = useState<boolean>(false)
    const [startTime, setStartTime] = useState<number>(0)
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
    const [shaking, setShaking] = useState<boolean>(false)
    const { copying1, copying2, setCopying } = useCopyFlags()
    const copyingTimeoutRef = useRef<NodeJS.Timeout | null>(null)


    // ----------- Networking -----------
    const [enemies, setEnemies] = useState<Record<string, EnemyState>>({})


    const answerString = useMemo(() => {
        const temp = getAnswerString(gridState)
        // maybe shake timer
        if (gameRunning && temp.length == 25)
            triggerShake()

        return temp
    }, [gridState])

    // player state updater
    useEffect(() => {
        sendMessage({
            "type": "update_state",
            "ready": isReady,
            "ghostState": getGhostState(gridState, playerState),
            "answerString": answerString,
        })

    }, [gridState, playerState, isReady])

    useEffect(() => {
        const interval = setInterval(() => {
            sendMessage({ type: "__ping" });
        }, 30000); // every 30s

        return () => clearInterval(interval);
    }, [sendMessage]);


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
                        ghostState: player.ghostState,
                        infoText: "READY",
                        success: false,

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
                if (msg.id == id) return;

                setEnemies((prev) => {
                    if (!prev[msg.id].success && msg.success) {
                        return {
                            ...prev,
                            [msg.id]: {
                                ...prev[msg.id],
                                ready: msg.ready,
                                ghostState: msg.ghostState,
                                infoText: getTimeString(msg.timeToWin),
                                success: msg.success,
                            }
                        }
                    }

                    // no success
                    return {
                        ...prev,
                        [msg.id]: {
                            ...prev[msg.id],
                            ready: msg.ready,
                            ghostState: msg.ghostState,
                        }
                    }

                })


            }
            else if (msg.type === "game_start") {
                console.log("AYO game starting")
                setGameRunning(true)
                setStartTime(msg.start_time)

                setEnemies(prev => {
                    const updated: typeof prev = {}
                    for (const id in prev) {
                        updated[id] = { ...prev[id], infoText: "" }
                    }
                    return updated
                })
            }
            else if (msg.type === "you_won") {
                setGameWon(true)
                setElapsedSeconds(msg.timeToWin)
                setGrid(prev => fillGuesses(prev, msg.answerString))
            }
            else
                console.log("Unrecognised message from server, type:", msg.type)
        })
    }, [setMessageHandler])


    function loadPuzzleData(puzzleData: RawPuzzleData) {
        if (puzzleData.body[0].cells.length != 25) {
            console.error("puzzleData is not not 5x5, problem")
        }
        setPuzzleData(puzzleData)
        const newGrid = createGrid(puzzleData.body[0].cells)
        setGrid(newGrid)
        handleTeleport([0, 0], 0, newGrid)
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
                if (gameWon) return

                const char = event.key.toUpperCase()

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
                if (gameWon) return

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
            else if (event.key == "Enter" || event.key === "Tab") {
                event.preventDefault() // prevents tab hopping around the browser

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


    function handleTeleport(initialCellPos: [number, number], dir: 0 | 1, grid?: GridState) {
        if (grid === undefined) grid = gridState

        const { newCell, newDir } = smartTeleport(initialCellPos, dir, grid)

        setCell(newCell)
        setDir(newDir)
    }

    // Screen Logic

    function readyClick() {
        setReady(prev => !prev)
    }



    function triggerShake() {
        setShaking(false) // reset first

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setShaking(true)
                setTimeout(() => setShaking(false), 400)
            })
        })
    }
    function triggerCopy(copyIndex: 1 | 2) {
        clearTimeout(copyingTimeoutRef.current!)
        setCopying(copyIndex, false) // reset first

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setCopying(copyIndex, true)
                copyingTimeoutRef.current = setTimeout(() => setCopying(copyIndex, false), 1500)
            })
        })
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
        if (!gameRunning || !startTime || gameWon) return

        const tick = () => {
            const now = Date.now()
            setElapsedSeconds(Math.floor((now - startTime * 1000) / 1000))
        }

        tick() // update immediately
        const interval = setInterval(tick, 200)

        return () => clearInterval(interval)
    }, [gameRunning, startTime, gameWon])


    // ----------- Render -----------
    return (
        <>
            <div className='game-container'>
                <div className="navbar">
                    <img src="/close.svg" className="close-button" alt="Close"
                        onClick={leaveRoom} />

                    <div className="room-code" onClick={() => { triggerCopy(1); copyToClipboard(roomCode) }}>
                        ROOM: <span className='actual-code'>{roomCode}</span>
                        <img src="/copy-paste.svg" className="copy-icon" alt="Copy" />
                        {copying1 && <span className='copied-tooltip'>Copied!</span>}
                    </div>

                    <span className='puzzle-date'>{puzzleDate}</span>

                </div>

                <div className="player-side">
                    <div className='grid-cluestack'>


                        <div className={'puzzle-area' + (shaking ? ' shake' : '')}>
                            <div className="info-bar">
                                <span className='nametag'>{name}</span>
                                <span className={'timer' + (gameWon ? ' done' : '')}>
                                    {getTimeString(elapsedSeconds)}
                                </span>
                            </div>
                            <Cluebar clues={parsedClues} selectedClues={selectedClues} gameRunning={gameRunning} />
                            <Grid grid={gridState} playerState={playerState} onCellClick={handleClickCell} clues={parsedClues} selectedClues={selectedClues} gameWon={gameWon} />

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

                    {(Object.keys(enemies).length == 0) ?
                        (<>
                            <span className='invite-friends'>
                                Invite Friends Using Room Code
                            </span>
                            <div className="room-code" onClick={() => { triggerCopy(2); copyToClipboard(roomCode) }}>
                                <span className='actual-code big'>{roomCode}</span>
                                <img src="/copy-paste.svg" className="copy-icon big" alt="Copy" />
                                {copying2 && <span className='copied-tooltip big'>Copied!</span>}
                            </div>
                        </>)
                        : (Object.values(enemies).map((enemy) => (
                            <EnemyGrid
                                key={enemy.id}
                                grid={gridState}
                                enemyState={enemy}
                            />
                        )))}
                </div>

            </div>
        </>

    )
}



