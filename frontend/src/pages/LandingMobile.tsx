import React, { useState } from "react";
import { VirtualKeyboard } from "../components/VirtualKeyboard";
import "./LandingMobile.css"; // put mobile CSS here
import { Toast, Toaster } from "../components/Toaster";

type MobileProps = {
    nameValue: string;
    setNameValue: (v: string) => void;
    codeValue: string;
    setCodeValue: (v: string) => void;
    handleCreate: () => void;
    handleJoin: (e: React.FormEvent) => void;
    toasts: Toast[];
};

export default function LandingMobile({
    nameValue,
    setNameValue,
    codeValue,
    setCodeValue,
    handleCreate,
    handleJoin,
    toasts
}: MobileProps) {
    // Which field is active? "name" | "code" | null
    const [activeField, setActiveField] = useState<"name" | "code" | null>(null);

    return (
        <div className="landing-mobile-container">
            <header className="landing-header-mobile">
                <h2>CROSSWORD</h2>
                <h1>ROYALE</h1>
                <div className="clue-bar-mobile">
                    <span className="clue-label-mobile">1A</span>
                    <span className="clue-text-mobile">
                        Made By Liad Koren
                    </span>
                </div>
            </header>

            <div className="landing-content-mobile">
                {/* Grid preview */}



                {/* Controls/Form */}
                <div className="controls-mobile">
                    <FakeInput
                        value={nameValue}
                        active={activeField === "name"}
                        placeholder="YOUR NAME"
                        className="name-input-mobile"
                        onFocus={() => setActiveField("name")}
                    />

                    <form onSubmit={handleJoin} className="join-form-mobile">
                        <FakeInput
                            value={codeValue}
                            active={activeField === "code"}
                            placeholder="ROOM CODE"
                            className="code-input-mobile"
                            onFocus={() => setActiveField("code")}
                        />
                        <button type="submit" className="join-button-mobile">
                            JOIN ROOM
                        </button>
                    </form>

                    <button className="create-button-mobile" onClick={handleCreate} >
                        CREATE ROOM
                    </button>
                </div>

            </div>



            {/* Virtual Keyboard appears only when a field is active */}
            {activeField && (
                <div className="vk-wrapper-mobile">
                    <VirtualKeyboard
                        value={activeField === "name" ? nameValue : codeValue}
                        onChange={(newVal) => {
                            if (activeField === "name") setNameValue(newVal);
                            else setCodeValue(newVal);
                        }}
                    />
                </div>
            )}

            <Toaster toasts={toasts} raised={activeField != null} />
        </div>
    );
}


type FakeInputProps = {
    value: string;
    active: boolean;
    placeholder?: string;
    className?: string;
    onFocus?: () => void;
};

export function FakeInput({
    value,
    active,
    placeholder,
    className = "",
    onFocus,
}: FakeInputProps) {
    return (
        <div className={`fake-input${active ? " fake-input--active" : ""} ${className}`}
            tabIndex={0}
            onClick={onFocus}
            onFocus={onFocus}>

            <span className="fake-input__text">
                {value ||
                    (!active && placeholder ? (
                        <span className="fake-input__placeholder">{placeholder}</span>
                    ) : null)}
                {active && <span className="blinking-cursor">|</span>}
            </span>
        </div>
    );
}