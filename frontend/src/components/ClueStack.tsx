import { useEffect } from 'react'
import './ClueStack.css'

import { SelectedClueData, Clue, GridState } from '../types/gameTypes'

interface ClueStackProps {
    clues: Clue[];
    selectedClues?: SelectedClueData,
    teleport: (cellPos: [number, number], dir: 0 | 1, grid?: GridState) => void;
}
function ClueStack({ clues, selectedClues, teleport }: ClueStackProps) {
    // ----------- State -----------

    // ----------- Render Utilities -----------
    // useEffect(() => {
    //     //console.log("rerender!", clues.length)
    //     //clues.forEach((clue) => console.log(clue.text))
    // })

    function getClueClass(clue_id: number) {

        if(!selectedClues) return "clue";

        let c = "clue "

        if (clue_id === selectedClues.mainClueId) {
            c += "selected ";
        } else if (clue_id === selectedClues.siblingClueId) {
            c += "sibling ";
        }
    
        const relativeId = clues[selectedClues.mainClueId]?.relatives?.[0];
        if (relativeId !== undefined && relativeId === clue_id) {
            c += "relative ";
        }
    

        return c
    }

    function clueClicked(clue: Clue) {
        const initialPosIndex = clue.cells[0]
        const initialPos = [Math.floor(initialPosIndex / 5), initialPosIndex % 5] as [number, number]

        teleport(initialPos, clue.dir)
    }

    // ----------- Render -----------
    return (
        <>
            <div className="clue-stack">
                <div className="clue-list">
                    <h3 className='clue-list-title'>ACROSS</h3>
                    <ol className='clue-list'>
                        {clues.map((clue, id) => {

                            if (clue.dir != 0) return null;

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

                            if (clue.dir != 1) return null;

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


