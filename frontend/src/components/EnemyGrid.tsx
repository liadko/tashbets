import './EnemyGrid.css'

import { GridState, GhostState, EnemyState } from '../types/gameTypes'
import { getCell, getGridPosByCellIndex } from '../utils/gridUtils'

interface EnemyGridProps {
    grid: GridState;
    enemyState: EnemyState;
}

export default function EnemyGrid({ grid, enemyState }: EnemyGridProps) {
    // ----------- Render Utilities -----------

    function getCellClass(cellIndex: number) {
        let classes = "enemy-cell "


        if (getCell(getGridPosByCellIndex(cellIndex), grid).isBlock)
            classes += "blocked "

        else {
            if (enemyState.ghostState.selectedCellIndex == cellIndex)
                classes += "selected "

            if (enemyState.ghostState.filledCells[cellIndex])
                classes += "filled "
        }

        return classes
    }
    function getTextClass() {
        let classes = "enemy-text"

        if (enemyState.ready)
            classes += " ready"
        else
            classes += " not-ready"

        return classes
    }
    // ----------- Render -----------
    return (
        <>
            <div className="enemy-grid-wrapper">
                <div className='enemy-info'>
                    <span className='enemy-name'>{enemyState.name}</span>
                    <span className={getTextClass()}>READY</span>
                </div>
                <div className="grid"
                    style={{ ["--grid-rows" as any]: grid.length }}>
                    {
                        enemyState.ghostState?.filledCells.map((cell, cellId) =>
                            <div key={`${cellId}`}
                                className={getCellClass(cellId)}>
                            </div>)
                    }
                </div>
            </div>
        </>

    )
}
