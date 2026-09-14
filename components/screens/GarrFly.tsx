'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Coins, Trophy, Heart, Sparkles, RefreshCw } from 'lucide-react';
import { GameOverModal } from '@/components/game/GameOverModal';

const ROWS = 7;
const COLS = 6;
const INITIAL_MOVES = 25;

interface GemType {
  id: number;
  color: string;
  glow: string;
  border: string;
  icon: string;
}

const GEM_TYPES: GemType[] = [
  { id: 0, color: '#00f3ff', glow: 'rgba(0,243,255,0.4)', border: 'border-[#00f3ff]', icon: '💎' },
  { id: 1, color: '#ffb700', glow: 'rgba(255,183,0,0.4)', border: 'border-[#ffb700]', icon: '🪙' },
  { id: 2, color: '#ef4444', glow: 'rgba(239,68,68,0.4)', border: 'border-red-500', icon: '🔥' },
  { id: 3, color: '#34d399', glow: 'rgba(52,211,153,0.4)', border: 'border-emerald-400', icon: '⚡' },
  { id: 4, color: '#a855f7', glow: 'rgba(168,85,247,0.4)', border: 'border-purple-500', icon: '🔮' },
];

function getRandomGem(): number {
  return Math.floor(Math.random() * GEM_TYPES.length);
}

function createInitialBoard(): number[][] {
  let board: number[][] = [];
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      let gem: number;
      do {
        gem = getRandomGem();
      } while (
        (c >= 2 && board[r][c - 1] === gem && board[r][c - 2] === gem) ||
        (r >= 2 && board[r - 1][c] === gem && board[r - 2][c] === gem)
      );
      board[r][c] = gem;
    }
  }
  return board;
}

export function GarrFly() {
  const { setScreen, addCoins, userRole, vip } = useGame();

  const [board, setBoard] = useState<number[][]>(createInitialBoard);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [moves, setMoves] = useState(INITIAL_MOVES);
  const [gameOver, setGameOver] = useState(false);
  const [comboMessage, setComboMessage] = useState<string | null>(null);

  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const movesRef = useRef(INITIAL_MOVES);
  const isProcessingRef = useRef(false);

  const initGame = useCallback(() => {
    const newBoard = createInitialBoard();
    setBoard(newBoard);
    setSelected(null);
    setScore(0);
    setCoinsEarned(0);
    setMoves(INITIAL_MOVES);
    setGameOver(false);
    setComboMessage(null);
    scoreRef.current = 0;
    coinsRef.current = 0;
    movesRef.current = INITIAL_MOVES;
    isProcessingRef.current = false;
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const findMatches = (grid: number[][]): { r: number; c: number }[] => {
    const matched = new Set<string>();

    // Horizontales
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 2; c++) {
        const val = grid[r][c];
        if (val !== -1 && val === grid[r][c + 1] && val === grid[r][c + 2]) {
          matched.add(`${r},${c}`);
          matched.add(`${r},${c + 1}`);
          matched.add(`${r},${c + 2}`);
        }
      }
    }

    // Verticales
    for (let r = 0; r < ROWS - 2; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = grid[r][c];
        if (val !== -1 && val === grid[r + 1][c] && val === grid[r + 2][c]) {
          matched.add(`${r},${c}`);
          matched.add(`${r + 1},${c}`);
          matched.add(`${r + 2},${c}`);
        }
      }
    }

    return Array.from(matched).map((str) => {
      const [r, c] = str.split(',').map(Number);
      return { r, c };
    });
  };

  const processCascades = async (currentBoard: number[][]) => {
    let activeBoard = currentBoard.map((row) => [...row]);
    let comboMultiplier = 1;
    let totalScoreGained = 0;
    let totalCoinsGained = 0;

    while (true) {
      const matches = findMatches(activeBoard);
      if (matches.length === 0) break;

      // Puntuación y Monedas
      const points = matches.length * 15 * comboMultiplier;
      const coins = Math.floor(matches.length / 3) * comboMultiplier;
      totalScoreGained += points;
      totalCoinsGained += coins;

      if (comboMultiplier > 1) {
        setComboMessage(`¡COMBO x${comboMultiplier}! 🔥`);
        setTimeout(() => setComboMessage(null), 1200);
      }

      // Eliminar gemas que coincidieron
      for (const m of matches) {
        activeBoard[m.r][m.c] = -1;
      }

      // Caída en Cascada
      for (let c = 0; c < COLS; c++) {
        let emptySpot = ROWS - 1;
        for (let r = ROWS - 1; r >= 0; r--) {
          if (activeBoard[r][c] !== -1) {
            activeBoard[emptySpot][c] = activeBoard[r][c];
            if (emptySpot !== r) {
              activeBoard[r][c] = -1;
            }
            emptySpot--;
          }
        }
        // Rellenar espacios superiores con nuevas gemas
        for (let r = emptySpot; r >= 0; r--) {
          activeBoard[r][c] = getRandomGem();
        }
      }

      comboMultiplier++;
    }

    if (totalScoreGained > 0) {
      scoreRef.current += totalScoreGained;
      coinsRef.current += totalCoinsGained;
      setScore(scoreRef.current);
      setCoinsEarned(coinsRef.current);
    }

    setBoard(activeBoard);
    isProcessingRef.current = false;

    // Verificar Fin de Partida
    if (movesRef.current <= 0) {
      setGameOver(true);
      if (coinsRef.current > 0) addCoins(coinsRef.current);
    }
  };

  const handleGemClick = async (r: number, c: number) => {
    if (isProcessingRef.current || gameOver) return;

    if (!selected) {
      setSelected({ r, c });
      return;
    }

    // Si toca la misma gema, deseleccionar
    if (selected.r === r && selected.c === c) {
      setSelected(null);
      return;
    }

    // Verificar si son adyacentes
    const isAdjacent =
      (Math.abs(selected.r - r) === 1 && selected.c === c) ||
      (Math.abs(selected.c - c) === 1 && selected.r === r);

    if (!isAdjacent) {
      setSelected({ r, c });
      return;
    }

    // Intercambiar Gemas
    isProcessingRef.current = true;
    const newBoard = board.map((row) => [...row]);
    const temp = newBoard[selected.r][selected.c];
    newBoard[selected.r][selected.c] = newBoard[r][c];
    newBoard[r][c] = temp;

    const matches = findMatches(newBoard);

    if (matches.length > 0) {
      // Movimiento Válido
      movesRef.current -= 1;
      setMoves(movesRef.current);
      setSelected(null);
      setBoard(newBoard);
      await processCascades(newBoard);
    } else {
      // Movimiento Inválido -> Regresar a su lugar
      setSelected(null);
      isProcessingRef.current = false;
    }
  };

  const handleRevive = () => {
    movesRef.current = 10;
    setMoves(10);
    setGameOver(false);
  };

  const handleDoubleCoins = () => {
    coinsRef.current *= 2;
    setCoinsEarned(coinsRef.current);
    if (coinsRef.current > 0) addCoins(coinsRef.current);
  };

  const handleClose = () => {
    setScreen('arcade');
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden select-none">
      <MuteButton />

      {/* Barra Superior */}
      <div className="pt-14 px-4 pb-2 flex items-center justify-between border-b border-[#00f3ff]/10 bg-gradient-to-b from-[#0a0e17] to-transparent">
        <button
          onClick={() => setScreen('arcade')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-[#00f3ff]/30 text-white text-xs font-bold active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#00f3ff]" /> Salir
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-black/60 border border-[#00f3ff]/30 rounded-full px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 text-[#00f3ff]" />
            <span className="text-[#00f3ff] text-xs font-bold">{moves} Movs</span>
          </span>
          <span className="flex items-center gap-1 bg-black/60 border border-amber-500/30 rounded-full px-3 py-1">
            <Trophy className="w-3.5 h-3.5 text-[#ffb700]" />
            <span className="text-[#ffb700] text-xs font-bold">{score.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1 bg-black/60 border border-amber-400/30 rounded-full px-3 py-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold">{coinsEarned}</span>
          </span>
        </div>
      </div>

      {/* Mensaje de Combos */}
      {comboMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-[#00f3ff]/20 border border-[#00f3ff]/60 animate-bounce">
          <span className="text-[#00f3ff] text-xs font-black tracking-wider">{comboMessage}</span>
        </div>
      )}

      {/* Tablero Neón Match-3 */}
      <div className="flex-1 flex flex-col items-center justify-center p-3">
        <div className="bg-black/40 border border-[#00f3ff]/20 rounded-2xl p-2 shadow-2xl shadow-[#00f3ff]/10 w-full max-w-[340px]">
          <div className="grid grid-cols-6 gap-1.5 aspect-[6/7]">
            {board.map((row, r) =>
              row.map((gemId, c) => {
                const isSelected = selected?.r === r && selected?.c === c;
                const gem = GEM_TYPES[gemId] || GEM_TYPES[0];

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleGemClick(r, c)}
                    className={`relative rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 ${
                      isSelected
                        ? 'border-2 border-white scale-105 z-10 shadow-lg shadow-white/50 bg-white/20'
                        : `border border-white/10 hover:border-white/30 bg-black/50`
                    }`}
                    style={{
                      boxShadow: isSelected ? `0 0 15px ${gem.glow}` : 'none',
                    }}
                  >
                    <span className="text-2xl filter drop-shadow-md select-none">{gem.icon}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <p className="text-white/40 text-[10px] font-bold mt-3 uppercase tracking-widest">
          Toca 2 gemas adyacentes para juntar 3 iguales
        </p>
      </div>

      <GameOverModal
        open={gameOver}
        onClose={handleClose}
        score={score}
        coinsEarned={coinsEarned}
        onRevive={handleRevive}
        onDoubleCoins={handleDoubleCoins}
        userRole={userRole}
        vip={vip}
      />
    </div>
  );
}
