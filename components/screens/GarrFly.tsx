'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Coins, Trophy, Flame, Zap, Gem, Star, Skull, Clock } from 'lucide-react';
import { GameOverModal } from '@/components/game/GameOverModal';

const ROWS = 7;
const COLS = 6;
const INITIAL_TIME = 60; // 60 segundos de partida rápida

type GemKind = 'cyan' | 'amber' | 'red' | 'emerald' | 'purple';

interface GemType {
  kind: GemKind;
  color: string;
  glow: string;
  bg: string;
  border: string;
  icon: any;
}

const GEM_MAP: Record<GemKind, GemType> = {
  cyan: { kind: 'cyan', color: '#00f3ff', glow: 'rgba(0,243,255,0.6)', bg: 'bg-[#00f3ff]/15', border: 'border-[#00f3ff]/50', icon: Gem },
  amber: { kind: 'amber', color: '#ffb700', glow: 'rgba(255,183,0,0.6)', bg: 'bg-[#ffb700]/15', border: 'border-[#ffb700]/50', icon: Star },
  red: { kind: 'red', color: '#ef4444', glow: 'rgba(239,68,68,0.6)', bg: 'bg-red-500/15', border: 'border-red-500/50', icon: Flame },
  emerald: { kind: 'emerald', color: '#34d399', glow: 'rgba(52,211,153,0.6)', bg: 'bg-emerald-500/15', border: 'border-emerald-500/50', icon: Zap },
  purple: { kind: 'purple', color: '#a855f7', glow: 'rgba(168,85,247,0.6)', bg: 'bg-purple-500/15', border: 'border-purple-500/50', icon: Skull },
};

const BASE_KINDS: GemKind[] = ['cyan', 'amber', 'red', 'emerald', 'purple'];

function getRandomKind(): GemKind {
  return BASE_KINDS[Math.floor(Math.random() * BASE_KINDS.length)];
}

function createInitialBoard(): GemKind[][] {
  let board: GemKind[][] = [];
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      let kind: GemKind;
      do {
        kind = getRandomKind();
      } while (
        (c >= 2 && board[r][c - 1] === kind && board[r][c - 2] === kind) ||
        (r >= 2 && board[r - 1][c] === kind && board[r - 2][c] === kind)
      );
      board[r][c] = kind;
    }
  }
  return board;
}

export function GarrFly() {
  const { setScreen, addCoins, userRole, vip } = useGame();

  const [board, setBoard] = useState<GemKind[][]>(createInitialBoard);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [comboText, setComboText] = useState<string | null>(null);

  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const timeRef = useRef(INITIAL_TIME);
  const isProcessingRef = useRef(false);
  const gameOverRef = useRef(false);

  const initGame = useCallback(() => {
    const newBoard = createInitialBoard();
    setBoard(newBoard);
    setSelected(null);
    setScore(0);
    setCoinsEarned(0);
    setTimeLeft(INITIAL_TIME);
    setGameOver(false);
    setComboText(null);
    scoreRef.current = 0;
    coinsRef.current = 0;
    timeRef.current = INITIAL_TIME;
    isProcessingRef.current = false;
    gameOverRef.current = false;
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Temporizador regresivo de 60 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameOverRef.current) return;

      if (timeRef.current > 0) {
        timeRef.current -= 1;
        setTimeLeft(timeRef.current);
      } else {
        gameOverRef.current = true;
        setGameOver(true);
        if (coinsRef.current > 0) addCoins(coinsRef.current);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [addCoins]);

  const findMatches = (grid: GemKind[][]): { r: number; c: number }[] => {
    const matched = new Set<string>();

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 2; c++) {
        const k = grid[r][c];
        if (k && k === grid[r][c + 1] && k === grid[r][c + 2]) {
          matched.add(`${r},${c}`);
          matched.add(`${r},${c + 1}`);
          matched.add(`${r},${c + 2}`);
        }
      }
    }

    for (let r = 0; r < ROWS - 2; r++) {
      for (let c = 0; c < COLS; c++) {
        const k = grid[r][c];
        if (k && k === grid[r + 1][c] && k === grid[r + 2][c]) {
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

  const processCascades = async (currentBoard: GemKind[][]) => {
    let activeBoard = currentBoard.map((row) => [...row]);
    let comboMultiplier = 1;
    let gainedScore = 0;

    while (true) {
      const matches = findMatches(activeBoard);
      if (matches.length === 0) break;

      if (comboMultiplier > 1) {
        setComboText(`¡COMBO X${comboMultiplier}! +2s 🔥`);
        timeRef.current += 2; // Bonificación de tiempo por combos
        setTimeLeft(timeRef.current);
        setTimeout(() => setComboText(null), 1000);
      }

      gainedScore += matches.length * 50 * comboMultiplier;

      for (const m of matches) {
        activeBoard[m.r][m.c] = null as any;
      }

      for (let c = 0; c < COLS; c++) {
        let emptySpot = ROWS - 1;
        for (let r = ROWS - 1; r >= 0; r--) {
          if (activeBoard[r][c] !== null) {
            activeBoard[emptySpot][c] = activeBoard[r][c];
            if (emptySpot !== r) {
              activeBoard[r][c] = null as any;
            }
            emptySpot--;
          }
        }
        for (let r = emptySpot; r >= 0; r--) {
          activeBoard[r][c] = getRandomKind();
        }
      }

      comboMultiplier++;
    }

    if (gainedScore > 0) {
      scoreRef.current += gainedScore;
      // Monedas equilibradas (1 moneda cada 120 puntos)
      coinsRef.current = Math.floor(scoreRef.current / 120);
      setScore(scoreRef.current);
      setCoinsEarned(coinsRef.current);
    }

    setBoard(activeBoard);
    isProcessingRef.current = false;
  };

  const handleGemClick = async (r: number, c: number) => {
    if (isProcessingRef.current || gameOverRef.current) return;

    if (!selected) {
      setSelected({ r, c });
      return;
    }

    if (selected.r === r && selected.c === c) {
      setSelected(null);
      return;
    }

    const isAdjacent =
      (Math.abs(selected.r - r) === 1 && selected.c === c) ||
      (Math.abs(selected.c - c) === 1 && selected.r === r);

    if (!isAdjacent) {
      setSelected({ r, c });
      return;
    }

    isProcessingRef.current = true;
    const newBoard = board.map((row) => [...row]);
    const temp = newBoard[selected.r][selected.c];
    newBoard[selected.r][selected.c] = newBoard[r][c];
    newBoard[r][c] = temp;

    const matches = findMatches(newBoard);

    if (matches.length > 0) {
      setSelected(null);
      setBoard(newBoard);
      await processCascades(newBoard);
    } else {
      setSelected(null);
      isProcessingRef.current = false;
    }
  };

  const handleRevive = () => {
    timeRef.current = 15; // +15 segundos extra por ver anuncio
    setTimeLeft(15);
    gameOverRef.current = false;
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

      {/* Header */}
      <div className="pt-14 px-4 pb-2 flex items-center justify-between border-b border-[#00f3ff]/10 bg-gradient-to-b from-[#0a0e17] to-transparent">
        <button
          onClick={() => setScreen('arcade')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-[#00f3ff]/30 text-white text-xs font-bold active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#00f3ff]" /> Salir
        </button>

        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 bg-black/60 border rounded-full px-3 py-1 ${
            timeLeft <= 10 ? 'border-red-500 text-red-400 animate-pulse' : 'border-[#00f3ff]/30 text-[#00f3ff]'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{timeLeft}s</span>
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

      {/* Combos Overlay */}
      {comboText && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-[#00f3ff]/20 border border-[#00f3ff]/60 animate-bounce shadow-lg shadow-[#00f3ff]/20">
          <span className="text-[#00f3ff] text-xs font-black tracking-wider">{comboText}</span>
        </div>
      )}

      {/* Tablero Neón Cyberpunk */}
      <div className="flex-1 flex flex-col items-center justify-center p-3">
        <div className="bg-black/60 border border-[#00f3ff]/30 rounded-2xl p-2.5 shadow-2xl shadow-[#00f3ff]/10 w-full max-w-[340px] backdrop-blur-md">
          <div className="grid grid-cols-6 gap-2 aspect-[6/7]">
            {board.map((row, r) =>
              row.map((kind, c) => {
                const isSelected = selected?.r === r && selected?.c === c;
                const gem = GEM_MAP[kind] || GEM_MAP.cyan;
                const IconComponent = gem.icon;

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleGemClick(r, c)}
                    className={`relative rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                      gem.bg
                    } ${gem.border} border ${
                      isSelected
                        ? 'scale-105 z-10 border-white shadow-lg bg-white/20'
                        : 'hover:scale-95'
                    }`}
                    style={{
                      boxShadow: isSelected
                        ? `0 0 20px ${gem.color}`
                        : `0 0 8px ${gem.glow}`,
                    }}
                  >
                    <IconComponent
                      className="w-6 h-6 transition-transform"
                      style={{ color: gem.color }}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>

        <p className="text-white/40 text-[10px] font-bold mt-3 uppercase tracking-widest text-center">
          Junta 3 o más iguales antes de que acabe el tiempo
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
