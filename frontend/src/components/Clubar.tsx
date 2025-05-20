import { Clue, SelectedClueData } from '../types/gameTypes';
import './Cluebar.css'

interface CluebarProps {
    clues: Clue[];
    selectedClues?: SelectedClueData;
    gameRunning: boolean;
}
export default function Cluebar({clues, selectedClues, gameRunning} : CluebarProps) {
    // ----------- State -----------

    // ----------- Render Utilities -----------

    function getLabel() {
        if(!clues.length || !selectedClues) return "SMH"

        const dir = selectedClues.dir
        const clue = clues[selectedClues.mainClueId]

        return clue.label.toString() + (dir == 0 ? "A" : "D")
    }
    function getClueText() {
        if(!gameRunning) return "This 5-letter word starts the game"
        if(!clues.length || !selectedClues) return "No Clue! (Ha)"

        const clue = clues[selectedClues.mainClueId]

        return clue.text
    }
    // ----------- Render -----------
    return (
        <>
            <div className="clue-bar">
                <div className="cluebar-label">{getLabel()}</div>
                <div className="cluebar-text">{getClueText()}</div>
            </div>
        </>

    )
}



