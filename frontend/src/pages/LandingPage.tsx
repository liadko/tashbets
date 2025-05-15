import { useEffect, useRef, useState, useMemo, useCallback, useContext } from 'react'
import './LandingPage.css'
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext'

type LandingProps = {
    sendMessage: (msg: any) => void;
    setMessageHandler: (fn: (msg: any) => void) => void;
};
export default function LandingPage({ sendMessage, setMessageHandler }: LandingProps) {
    // ----------- constants -----------
    const navigate = useNavigate()
    const codeRef = useRef<HTMLInputElement>(null)
    const nameRef = useRef<HTMLInputElement>(null)
    const { name, setName, setRoomCode } = useSession()



    // ----------- Networking -----------
    const handleCreate = () => {
        const name = nameRef.current?.value.trim();

        if (!name) {
            alert("Please Enter Your Name");
            return;
        }

        setName(name)

        sendMessage({
            "type": "create_room",
            "name": name
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
                            <span className="landing-cluebar-text">Have fun</span>
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
                        <input type="text" className="landing-name-input" ref={nameRef} placeholder="YOUR NAME" spellCheck="false" />


                        <input type="text" className="landing-code-input" ref={codeRef} placeholder="ROOM CODE" spellCheck="false" maxLength={4} />

                        <button className="landing-join-button" onClick={() => navigate("/game")}>JOIN ROOM</button>

                        <button className="landing-create-button" onClick={handleCreate}>CREATE ROOM</button>
                    </div>

                </div>

            </div>

        </>

    )
}



