export interface Cell {
    row: number;
    col: number;

    isBlock: boolean;

    guess?: string;
    answer?: string;
    label?: string;
    clueIds?: [number, number];
}

export type GridState = Cell[][];

export interface Clue {
    id: number;
    label: string;
    text: string;
    dir: 0 | 1;
    cells: number[];
    relatives?: number[];

}

export interface RawCell {
    answer?: string; // this was without '?'. try to have no question marks
    label?: string;
    clues?: [number, number];
}

export interface RawClue {
    label: string;
    text: { plain: string }[];
    direction: "Across" | "Down";
    cells: number[];
    relatives?: number[];

}


export interface SelectedClueData {
    mainClueId: number;
    siblingClueId: number;
    dir: 0 | 1;

}

export interface RawPuzzleData {
    body: {
        clues: RawClue[], cells: RawCell[]
    }[]
}

export interface PlayerState {
    cell: [number, number];  // row, col
    dir: 0 | 1;              // 0 = horizontal, 1 = vertical
}


// --------- Enemy ---------
export interface EnemyState {
    id: string
    name: string
    
    ready: boolean
    infoText: string

    success: boolean

    ghostState: GhostState
}
export interface GhostState {
    filledCells: boolean[]

    selectedCellIndex: number
}
