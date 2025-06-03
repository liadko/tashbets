import React from "react";
import "./LandingDesktop.css"; // put your desktop CSS here
import { Toast, Toaster } from "../components/Toaster";

type DesktopProps = {
    nameValue: string;
    setNameValue: (v: string) => void;
    codeValue: string;
    setCodeValue: (v: string) => void;
    handleCreate: () => void;
    handleJoin: (e: React.FormEvent) => void;
    toasts: Toast[]
};

export default function LandingDesktop({
    nameValue,
    setNameValue,
    codeValue,
    setCodeValue,
    handleCreate,
    handleJoin,
    toasts
}: DesktopProps) {
    return (
        <div className="landing-desktop-container">
            <header className="landing-header">
                <h1>CROSSWORD ROYALE</h1>
                <p>MADE BY LIAD KOREN</p>
            </header>

            <div className="landing-content-desktop">
                {/* Grid Preview (same markup you had) */}
                <div className="grid-wrapper-desktop">
                    <div className="clue-bar-desktop">
                        <span className="clue-label-desktop">1A</span>
                        <span className="clue-text-desktop">
                            Inspired by NYT Mini Crossword
                        </span>
                    </div>
                    <div className="grid-desktop">
                        {/* replicate 5×5 cells */}
                        <div className="cell lightgray"></div>
                        <div className="cell"></div>
                        <div className="cell blocked"></div>
                        <div className="cell"></div>
                        <div className="cell lightgray"></div>
                        <div className="cell"></div>
                        <div className="cell"></div>
                        <div className="cell"></div>
                        <div className="cell"></div>
                        <div className="cell "></div>
                        <div className="cell"></div>
                        <div className="cell eye"></div>
                        <div className="cell "></div>
                        <div className="cell eye"></div>
                        <div className="cell"></div>
                        <div className="cell"></div>
                        <div className="cell"></div>
                        <div className="cell pink"></div>
                        <div className="cell"></div>
                        <div className="cell"></div>
                        <div className="cell blocked"></div>
                        <div className="cell"></div>
                        <div className="cell"></div>
                        <div className="cell"></div>
                        <div className="cell blocked"></div>
                    </div>
                </div>

                {/* Controls/Form */}
                <div className="controls-desktop">
                    <input
                        type="text"
                        className="name-input-desktop"
                        placeholder="YOUR NAME"
                        spellCheck="false"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                    />

                    <form onSubmit={handleJoin} className="join-form-desktop">
                        <input
                            type="text"
                            className="code-input-desktop"
                            placeholder="ROOM CODE"
                            spellCheck="false"
                            maxLength={4}
                            value={codeValue}
                            onChange={(e) => setCodeValue(e.target.value.toUpperCase())}
                        />
                        <button type="submit" className="join-button-desktop">
                            JOIN ROOM
                        </button>
                    </form>

                    <button
                        className="create-button-desktop"
                        onClick={handleCreate}
                    >
                        CREATE ROOM
                    </button>
                </div>
            </div>
            <Toaster toasts={toasts} />
        </div>
    );
}
