import { useEffect, useState } from 'react'
import './Grid.css'
import Cluebar from './Clubar'


function Grid({grid, onCellClick, playerState}) {
    // ----------- state -----------
    

    // ----------- Effects -----------


    // ----------- Render Utilities -----------

    function getCellClass(row, col) {
        let classes = "cell "

        if (row == playerState.cell[0] && col == playerState.cell[1])
            classes += " selected"
        else if (grid && grid[row][col].isBlock)
            classes += " blocked"
        else if (playerState.dir == 0 && row == playerState.cell[0])
            classes += " highlighted"
        else if (playerState.dir == 1 && col == playerState.cell[1])
            classes += " highlighted"



        return classes
    }

    // ----------- Render -----------
    return (
        <>
            <div className="grid-wrapper">
                <div className="grid"
                    style={{ "--grid-rows": grid.length }}>
                    {grid.map((rowData, rowId) =>
                        rowData.map((cell, colId) =>
                            <div key={`${rowId}-${colId}`}
                                className={getCellClass(rowId, colId)}
                                onClick={() => onCellClick(rowId, colId)}>
                                <span className="letter">{cell.guess}</span>
                                <span className="number">{cell.label}</span>
                            </div>))
                    }
                </div>
            </div>
        </>

    )
}

export default Grid


