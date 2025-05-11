import { useEffect, useState, useMemo, useCallback } from 'react'
import './LandingPage.css'

export default function LandingPage() {
    // ----------- constants -----------

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
                        <input type="text" className="landing-name-input" placeholder="YOUR NAME" spellCheck="false"/>
                        
                        
                        <input type="text" className="landing-code-input" placeholder="ROOM CODE" spellCheck="false" maxLength={4}/>

                        <button className="landing-join-button">JOIN ROOM</button>

                        <button className="landing-create-button">CREATE ROOM</button>
                    </div>

                </div>

            </div>

        </>

    )
}



