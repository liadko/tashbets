import { useEffect } from 'react'
import './ClueStack.css'


function ClueStack({ clues, selectedClues, teleport }) {
    // ----------- State -----------

    // ----------- Render Utilities -----------
    // useEffect(() => {
    //     //console.log("rerender!", clues.length)
    //     //clues.forEach((clue) => console.log(clue.text))
    // })

    function getClueClass(clue_id) {
        let c = "clue "
        const selectedClueIndex = selectedClues.dir;
        if (clue_id === selectedClues.clues[selectedClueIndex])
            c += "selected "
        else if (clue_id === selectedClues.clues[selectedClueIndex ^ 1])
            c += "sibling "

        return c
    }

    function clueClicked(clue) {
        const initialPosIndex = clue.cells[0]
        const initialPos = [Math.floor(initialPosIndex / 5), initialPosIndex % 5]
        const directionNumber = clue.dir == "Across" ? 0 : 1

        teleport(initialPos, directionNumber)
    }

    // ----------- Render -----------
    return (
        <>
            <div className="clue-stack">
                <div className="clue-list">
                    <h3 className='clue-list-title'>ACROSS</h3>
                    <ol className='clue-list'>
                        {clues.map((clue, id) => {

                            if (clue.dir != "Across") return null;

                            return (
                                <li key={id} className={getClueClass(id)}
                                    onClick={() => clueClicked(clue)}>
                                    <div className='clue-side-highlight' />
                                    <span className='clue-label'>{clue.label}</span>
                                    <span className='clue-text'>{clue.text}</span>
                                </li>);
                        }
                        )}
                    </ol>
                </div>
                <div className="clue-list">
                    <h3 className='clue-list-title'>DOWN</h3>
                    <ol className='clue-list'>
                        {clues.map((clue, id) => {

                            if (clue.dir != "Down") return null;

                            return (
                                <li key={id} className={getClueClass(id)}
                                    onClick={() => clueClicked(clue)}>
                                    <div className='clue-side-highlight' />
                                    <span className='clue-label'>{clue.label}</span>
                                    <span className='clue-text'>{clue.text}</span>
                                </li>);
                        }
                        )}
                    </ol>
                </div>
            </div>
        </>

    )
}

export default ClueStack


