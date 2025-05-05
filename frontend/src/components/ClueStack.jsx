import { useEffect } from 'react'
import './ClueStack.css'


function ClueStack({ clues }) {
    // ----------- State -----------

    // ----------- Render Utilities -----------
    //const currentClue = getCurrentClue()
    useEffect(() => {
        console.log("rerender!", clues.length)
        //clues.forEach((clue) => console.log(clue.text))
    })
    // ----------- Render -----------
    return (
        <>
            <div className="clue-stack">
                <div className="clue-list">
                    <h3 className='clue-list-title'>ACROSS</h3>
                    <ol className='clue-list'>
                        {clues.filter(c => c.direction == "Across").map((clue, id) => 
                            <li key={id} className="clue">
                                <div className='clue-side-highlight'/>
                                <span className='clue-label'>{clue.label}</span>
                                <span className='clue-text'>{clue.text}</span>
                            </li>
                        )}
                    </ol>
                </div>
                <div className="clue-list">
                    <h3 className='clue-list-title'>DOWN</h3>
                    <ol className='clue-list'>
                    {clues.filter(c => c.direction == "Down").map((clue, id) => 
                            <li key={id} className="clue">
                                <div className='clue-side-highlight'/>
                                <span className='clue-label'>{clue.label}</span>
                                <span className='clue-text'>{clue.text}</span>
                            </li>
                        )}
                    </ol>
                </div>
            </div>
        </>

    )
}

export default ClueStack


