import { PlayerState, GridState, RawCell, Cell } from '../types/gameTypes';
import { getCell } from './gridUtils';

// gets cell and direction. moves selection to nearest empty cell.
// if line is full goes to the initially requested cell
//initialCellPos = [int, int] , dir = 0 or 1 
export function smartTeleport(initialCellPos: [number, number], dir: 0 | 1, grid: GridState): { newCell: [number, number]; newDir: 0 | 1 } {

    const moveDirection = dir ^ 1
    let currentCellPos = [...initialCellPos] as [number, number]
    let currentCell = getCell(initialCellPos, grid)
    while (currentCell.isBlock || currentCell.guess != "") {
        currentCellPos[moveDirection]++

        if (currentCellPos[moveDirection] >= grid.length) {
            currentCellPos = initialCellPos
            break
        }

        currentCell = getCell(currentCellPos, grid)
    }


    return { newCell: currentCellPos, newDir: dir }

}


