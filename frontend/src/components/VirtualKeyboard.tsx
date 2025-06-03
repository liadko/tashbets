import { useState, useRef, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

type VKProps = {
    value: string;
    onChange: (newValue: string) => void;
};

export function VirtualKeyboard({ value, onChange }: VKProps) {
    const keyboardRef = useRef<any>(null);

    // Whenever `value` prop changes (e.g. user pastes), update the keyboard’s display
    useEffect(() => {
        keyboardRef.current?.setInput(value);
    }, [value]);

    return (
        <Keyboard
            keyboardRef={(r) => (keyboardRef.current = r!)}
            layout={{
                default: [
                    "Q W E R T Y U I O P",
                    "A S D F G H J K L",
                    "Z X C V B N M {bksp}",
                ],
            }}
            display={{
                "{bksp}": "⌫",
                "{done}": "Done"
            }}
            onKeyPress={(button) => {
                if (button === "{bksp}") {
                    onChange(value.slice(0, -1));
                } else if (button === "{space}") {
                    onChange(value + " ");
                } else {
                    onChange(value + button);
                }
            }}
            theme={"hg-theme-default hg-layout-default myTheme"}
        />
    );
}
