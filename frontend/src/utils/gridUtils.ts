import { PlayerState, GridState, RawCell, Cell } from '../types/gameTypes';



export function getAnswerString(grid: GridState) : string {
    return grid
        .flat()                              // flatten 2D -> 1D
        .filter(cell => !cell.isBlock)       // ignore black squares
        .map(cell => cell.guess ?? ' ')      // use guess, fallback to space
        .join('')                            // combine into a string

}

export function createGrid(rawCells: RawCell[] | null): GridState {
    const size = 5//Math.sqrt(rawAnswers.length)
    const grid: GridState = []

    const validGrid = !!rawCells


    for (let row = 0; row < size; row++) {
        const rowData = []

        for (let col = 0; col < size; col++) {
            const cellIndex = row * size + col
            const rawCell = rawCells?.[cellIndex]

            const isBlock = validGrid && (rawCell?.answer) == undefined

            const answer = rawCell?.answer
            const label = rawCell?.label
            const clueIds = rawCell?.clues

            const cell: Cell = {
                row,
                col,

                guess: "",
                answer,
                isBlock,
                label,
                clueIds,
            };

            rowData.push(cell)
        }

        grid.push(rowData)
    }

    return grid
}

export function editGuess(prev: GridState, cellPos: [number, number], newGuess: string): GridState {
    const [row, col] = cellPos

    return prev.map((rowData, r) =>
        rowData.map((cell, c) => {
            if (r === row && c === col) {
                return {
                    ...cell,
                    guess: newGuess,
                }
            }
            else
                return cell
        })
    )

}
export function getCell(cellPos: [number, number], grid: GridState): Cell {

    return grid[cellPos[0]][cellPos[1]]
}

// returns undefined if doesn't exist
export function getFirstEmptyCellPos(positionIndex: number, dir: 0 | 1, grid: GridState): [number, number] | undefined {

    for (let i = 0; i < 5; i++) {
        if (dir == 0 && grid[positionIndex][i].guess == "" && !grid[positionIndex][i].isBlock) {
            return [positionIndex, i]
        }
        else if (dir == 1 && grid[i][positionIndex].guess == "" && !grid[i][positionIndex].isBlock) {
            return [i, positionIndex]
        }
    }

    return undefined

}

export function moveSelected(direction: 0 | 1, move: -1 | 1, playerState: PlayerState, grid: GridState): [number, number] {
    const movementAxis = direction ^ 1
    const updatedCell = [...playerState.cell] as [number, number]

    updatedCell[movementAxis] += move

    // check if current cell is invalid, if so, trace back the movement
    if (updatedCell[movementAxis] < 0 || updatedCell[movementAxis] >= grid.length
        || grid[updatedCell[0]][updatedCell[1]].isBlock)
        updatedCell[movementAxis] -= move

    return updatedCell

}



export function getGridPosByCellIndex(cellIndex: number) {
    return [Math.floor(cellIndex / 5), cellIndex % 5] as [number, number]
}


export function getCellIndexByGridPos(pos: [number, number]) {
    return pos[1] + pos[0] * 5
}
