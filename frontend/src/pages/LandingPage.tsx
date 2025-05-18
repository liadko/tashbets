import { useEffect, useRef, useState, useMemo, useCallback, useContext } from 'react'
import './LandingPage.css'
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext'

type LandingProps = {
    sendMessage: (msg: any) => boolean;
    setMessageHandler: (fn: (msg: any) => void) => void;
};
export default function LandingPage({ sendMessage, setMessageHandler }: LandingProps) {
    // ----------- constants -----------
    const navigate = useNavigate()
    const codeRef = useRef<HTMLInputElement>(null)
    const nameRef = useRef<HTMLInputElement>(null)
    const { setName, setRoomCode } = useSession()



    // ----------- Networking -----------
    function handleCreate() {
        const name = nameRef.current?.value.trim();

        if (!name) {
            alert("Please Enter Your Name");
            return;
        }

        setName(name)

        const success = sendMessage({
            "type": "create_room",
            "name": name
        })
        if(!success)
            console.log("TOAST: server unavailable")

    }
    function handleJoin() {
        const code = codeRef.current?.value.trim().toUpperCase();
        const name = nameRef.current?.value.trim();

        if (!name) {
            alert("Please Enter Your Name");
            return;
        }

        if (!code) {
            alert("Please Enter Room Code");
            return;
        }

        setName(name)

        sendMessage({
            "type": "join_room",
            "name": name,
            "code": code
        })
    }

    // ----------- Effects -----------
    useEffect(() => {
        setMessageHandler((msg) => {
            if (msg.type === "room_created") {
                console.log("Room created with code:", msg.room_code)
                setRoomCode(msg.room_code)

                navigate("/game")
            }
            else if (msg.type === "room_joined") {
                console.log("Room joined with code:", msg.room_code)
                setRoomCode(msg.room_code)

                navigate("/game")
            }
            else if (msg.type === "room_invalid") {
                console.log("Room not found")
                

            }
            else 
                console.log("Unrecognised message from server, type:", msg.type)
        })
    }, [setMessageHandler])

    // ----------- Render -----------
    return (
        <>
            <div className="page-container">

                {/* Header */}
                <header className="header">
                    <h1>CROSSWORD ROYALE</h1>
                    <p>MADE BY LIAD KOREN</p>
                </header>

                <div className="landing-main-area">

                    <div className="landing-grid-wrapper">
                        <div className="landing-clue-bar">
                            <span className="landing-cluebar-label">1A</span>
                            <span className="landing-cluebar-text">Inspired By NYT Mini Crossword</span>
                        </div>
                        <div className='landing-grid'>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>
                            <div className="landing-cell"></div>

                        </div>
                    </div>

                    <div className="landing-controls">
                        <input type="text" className="landing-name-input" ref={nameRef} placeholder="YOUR NAME" spellCheck="false" defaultValue="Liad"/>


                        <input type="text" className="landing-code-input" ref={codeRef} placeholder="ROOM CODE" spellCheck="false" maxLength={4} />

                        <button className="landing-join-button" onClick={handleJoin}>JOIN ROOM</button>

                        <button className="landing-create-button" onClick={handleCreate}>CREATE ROOM</button>
                    </div>

                </div>

            </div>

        </>

    )
}



