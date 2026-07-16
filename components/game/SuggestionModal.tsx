'use client';

import React, { useState } from 'react';
import { BookOpen, X, Send, CheckCircle2 } from 'lucide-react';
import { useGame } from '@/hooks/use-game';

interface SuggestionModalProps {
  open: boolean;
  onClose: () => void;
}

export function SuggestionModal({ open, onClose }: SuggestionModalProps) {
  const { sendSuggestion } = useGame();
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (text.trim().length < 5 || sending) return;
    setSending(true);
    const result = await sendSuggestion(text.trim());
    setSending(false);
    if (result.ok) {
      setText('');
      setSent(true);
      setTimeout(() => {
        setSent(false);
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-sm mx-4 rounded-2xl bg-card border border-primary/30 p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-white font-bold text-lg">¿Qué mejoras quieres en el juego?</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-white font-bold">¡Sugerencia enviada!</p>
            <p className="text-white/50 text-sm">Muchas gracias por ayudarnos a mejorar el juego.</p>
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe tu sugerencia aquí..."
              className="w-full h-32 rounded-xl bg-background/60 border border-border p-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={500}
            />
            <p className="text-right text-xs text-white/30 mt-1">{text.length}/500</p>
            <button
              onClick={handleSubmit}
              disabled={text.trim().length < 5 || sending}
              className="w-full mt-3 py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Enviando...' : 'Enviar sugerencia'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function SuggestionButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-3 right-3 z-50 w-10 h-10 rounded-full bg-card/80 backdrop-blur border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
      aria-label="Sugerencias"
    >
      <BookOpen className="w-5 h-5" />
    </button>
  );
}
