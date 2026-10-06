'use client';

import { ChevronUp, ChevronLeft, ChevronRight, ChevronDown, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Move } from 'lucide-react';
import type { ControlLayout } from '@/lib/control-layout';

interface ArcadeControlBtnProps {
  layout: ControlLayout;
  icon: 'up' | 'down' | 'left' | 'right' | 'jump';
  onClick: () => void;
  onPress?: () => void;
  onRelease?: () => void;
  color?: string;
  borderColor?: string;
  label?: string;
}

export function ArcadeControlBtn({
  layout,
  icon,
  onClick,
  onPress,
  onRelease,
  color = '#00f3ff',
  borderColor = 'rgba(0,243,255,0.4)',
  label,
}: ArcadeControlBtnProps) {
  const Icon = icon === 'up' ? ArrowUp
    : icon === 'down' ? ArrowDown
    : icon === 'left' ? ArrowLeft
    : icon === 'right' ? ArrowRight
    : icon === 'jump' ? ChevronUp
    : Move;

  const w = layout.size * 0.85;
  const h = layout.size * 0.7;

  const handlePress = (e: React.PointerEvent) => {
    e.preventDefault();
    if (onPress) onPress();
  };
  const handleRelease = (e: React.PointerEvent) => {
    e.preventDefault();
    if (onRelease) onRelease();
    if (!onPress) onClick();
  };

  return (
    <button
      onPointerDown={handlePress}
      onPointerUp={handleRelease}
      onPointerLeave={onRelease ? (e) => { e.preventDefault(); onRelease(); } : undefined}
      className="absolute rounded-xl flex items-center justify-center active:scale-90 transition-all shadow-md z-20 touch-none select-none"
      style={{
        width: w,
        height: h,
        left: `${layout.x * 100}%`,
        top: `${layout.y * 100}%`,
        transform: 'translate(-50%, -50%)',
        opacity: layout.opacity,
        background: 'rgba(0,0,0,0.8)',
        border: `1px solid ${borderColor}`,
        color,
      }}
    >
      <div className="flex flex-col items-center justify-center gap-0.5">
        <Icon style={{ width: w * 0.4, height: w * 0.4 }} />
        {label && <span className="text-[8px] font-bold leading-none">{label}</span>}
      </div>
    </button>
  );
}

export function ControlSettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-24 z-40 w-10 h-10 rounded-lg bg-black/50 backdrop-blur flex items-center justify-center transition-colors"
      style={{ color: '#00f3ff' }}
    >
      <Move className="w-5 h-5" />
    </button>
  );
}
