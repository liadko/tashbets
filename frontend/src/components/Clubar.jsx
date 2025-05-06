import './Cluebar.css'


function Cluebar({clues, selectedClues}) {
    // ----------- State -----------

    // ----------- Render Utilities -----------

    function getLabel() {
        if(!clues.length) return

        const dir = selectedClues.dir
        const clue = clues[selectedClues.clue_ids[dir]]

        return clue.label.toString() + (dir == "Across" ? "A" : "D")
    }
    function getClueText() {
        if(!clues.length) return

        const dir = selectedClues.dir
        const clue = clues[selectedClues.clue_ids[dir]]

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

export default Cluebar


