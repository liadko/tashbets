import './EnemyGrid.css'

import { GridState, EnemyState } from '../types/gameTypes'
import {getCell, getGridPosByCellIndex } from '../utils/gridUtils'

interface EnemyGridProps {
    grid: GridState;
    enemyState: EnemyState;
}

export default function EnemyGrid({ grid, enemyState }: EnemyGridProps) {
    // ----------- Render Utilities -----------

    function getCellClass(cellIndex: number) {
        let classes = "enemy-cell "


        if(getCell(getGridPosByCellIndex(cellIndex), grid).isBlock)
            classes += "blocked "
        else if (enemyState.selectedCellIndex == cellIndex)
            classes += "selected "

        else if (enemyState?.filledCells[cellIndex])
            classes += "filled "

        return classes
    }

    // ----------- Render -----------
    return (
        <>
            <div className="enemy-grid-wrapper">
                <div className='enemy-info'>
                    <span className='enemy-name'>TOMER</span>
                    <span className='enemy-text'>READY</span>
                </div>
                <div className="grid"
                    style={{ ["--grid-rows" as any]: grid.length }}>
                    {
                        enemyState.filledCells.map((cell, cellId) =>
                            <div key={`${cellId}`}
                                className={getCellClass(cellId)}>
                            </div>)
                    }
                </div>
            </div>
        </>

    )
}
