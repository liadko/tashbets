import { PlayerState, GridState, RawCell, Cell, GhostState, EnemyState } from '../types/gameTypes';

import { getCell, getCellIndexByGridPos } from './gridUtils';


export function getDefaultEnemyState(id: string, name: string): EnemyState {
    const initialGhostState: GhostState = {
        filledCells: [
            false, false, false, false, false,
            false, false, false, false, false,
            false, false, false, false, false,
            false, false, false, false, false,
            false, false, false, false, false,
        ],
        selectedCellIndex: 0
    }

    return {
        id,
        name,
        ready: false,
        ghostState: initialGhostState,
    }
}

export function getGhostState(grid: GridState, playerState: PlayerState): GhostState {

    const selectedIndex = getCellIndexByGridPos(playerState.cell)
    const ghost: GhostState = { filledCells: [], selectedCellIndex: selectedIndex }
    for (let row = 0; row < 5; row++) {

        for (let col = 0; col < 5; col++) {
            const cell = getCell([row, col], grid)

            ghost.filledCells.push(!!cell.guess) // true if filled, false otherwise

        }
    }

    return ghost
}

// export function editGhost(prev: GhostState, cellPos: [number, number], newGuess: string): GridState {
//     const [row, col] = cellPos

//     return prev.map((rowData, r) =>
//         rowData.map((cell, c) => {
//             if (r === row && c === col) {
//                 return {
//                     ...cell,
//                     guess: newGuess,
//                 }
//             }
//             else
//                 return cell
//         })
//     )

// }
