import { useEffect, useState, useRef, useCallback } from 'react';
import { PlayerState } from '../types/gameTypes';


export function usePlayerState(initialState: PlayerState) {
  const [playerState, setPlayerState] = useState(initialState);

  const setDir = (newDir: 0 | 1) => {
    setPlayerState(prev => ({ ...prev, dir: newDir }));
  };

  const setCell = (newCell: [number, number]) => {
    setPlayerState(prev => ({ ...prev, cell: newCell }));
  };

  return { playerState, setDir, setCell };
}
