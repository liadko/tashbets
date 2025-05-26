import { Clue, GridState, PlayerState, SelectedClueData } from '../types/gameTypes';
import './Grid.css'

interface GridProps {
    grid: GridState;
    onCellClick: (row: number, col: number) => void;
    playerState: PlayerState;
    clues: Clue[];
    selectedClues?: SelectedClueData
    gameWon: boolean

}
export default function Grid({ grid, onCellClick, playerState, clues, selectedClues, gameWon }: GridProps) {
    // ----------- state -----------


    // ----------- Effects -----------


    // ----------- Render Utilities -----------

    function getCellClass(row: number, col : number) {
        let classes = "cell"

        if (grid && grid[row][col].isBlock)
            classes += " blocked"

        else {

            if (row == playerState.cell[0] && col == playerState.cell[1])
                classes += " selected"
            
            if (playerState.dir == 0 && row == playerState.cell[0])
                classes += " highlighted"
            else if (playerState.dir == 1 && col == playerState.cell[1])
                classes += " highlighted"

        }


        const selectedClueId = selectedClues?.mainClueId;
        if (selectedClueId != undefined) {
            grid[row][col].clueIds?.forEach((clueId, index) => {
                if (clues[clueId]?.relatives?.[0] == selectedClueId) {
                    classes += " relative"
                }
            })
        }


        return classes
    }

    // ----------- Render -----------
    return (
        <>
            <div className="grid-wrapper">
                <div className="grid"
                    style={{ ["--grid-rows" as any]: grid.length }}>
                    {grid.map((rowData, rowId) =>
                        rowData.map((cell, colId) =>
                            <div key={`${rowId}-${colId}`}
                                className={getCellClass(rowId, colId)}
                                onClick={() => onCellClick(rowId, colId)}>
                                <span className={'letter' + (gameWon ? " win" : "")}>{cell.guess}</span>
                                <span className="number">{cell.label}</span>
                            </div>))
                    }
                </div>
            </div>
        </>

    )
}
