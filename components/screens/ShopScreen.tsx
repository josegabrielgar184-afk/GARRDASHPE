'use client';

import { useState } from 'react';
import { useGame, UPGRADE_COSTS } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { SuggestionButton, SuggestionModal } from '@/components/game/SuggestionModal';
import { ArrowLeft, Coins, Star, Gem, Crown, CheckCircle2, AlertCircle, Zap, Swords, Magnet, Shield, X } from 'lucide-react';

export function ShopScreen() {
  const {
    coins, points, spendCoins, addPoints, vip, buyVIP, setScreen,
    upgrades, buyUpgrade, claimDiamonds,
  } = useGame();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [tab, setTab] = useState<'upgrades' | 'diamonds'>('upgrades');
  const [playerId, setPlayerId] = useState('');
  const [nick, setNick] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const upgradeCost = (key: keyof typeof UPGRADE_COSTS) =>
    UPGRADE_COSTS[key] * Math.pow(2, upgrades[key]);

  const handleBuyPoints = () => {
    setError(''); setSuccess('');
    if (coins < 15000) { setError('No tienes suficientes monedas. Necesitas 15000.'); return; }
    if (spendCoins(15000)) { addPoints(10); setSuccess('¡Has comprado 10 Puntos por 15000 Monedas!'); }
  };

  const handleClaimDiamonds = async () => {
    setError(''); setSuccess('');
    if (points < 10) { setError('No tienes suficientes puntos. Necesitas 10.'); return; }
    if (playerId.trim().length < 4) { setError('Debes ingresar tu Player ID (minimo 4 caracteres).'); return; }
    if (nick.trim().length < 2) { setError('Debes ingresar tu In-Game Nickname.'); return; }
    setClaiming(true);
    const result = await claimDiamonds(playerId.trim(), nick.trim());
    setClaiming(false);
    if (result.ok) {
      setShowClaimModal(true);
      setPlayerId(''); setNick('');
    } else {
      setError(result.error || 'Error al procesar la solicitud');
    }
  };

  const upgradeDefs: Array<{ key: keyof typeof UPGRADE_COSTS; icon: typeof Zap; name: string; desc: string; color: string }> = [
    { key: 'fireRate', icon: Zap, name: 'Cadencia', desc: 'Dispara mas rapido', color: '#f97316' },
    { key: 'damage', icon: Swords, name: 'Daño', desc: 'Balas mas potentes', color: '#ef4444' },
    { key: 'coinMagnet', icon: Magnet, name: 'Iman', desc: 'Atrae monedas y botiquines', color: '#22d3ee' },
    { key: 'superShield', icon: Shield, name: 'Escudo', desc: 'Escudo inicial cada partida', color: '#34d399' },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <MuteButton />
      <SuggestionButton onClick={() => setShowSuggestion(true)} />

      <div className="pt-16 px-4 pb-28 flex-1">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-xl" style={{ textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>RECLAIM YOUR DIAMONDS</h1>
        </div>

        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-card border border-amber-500/30 p-3 flex items-center gap-2 shadow-lg shadow-amber-500/10">
              <Coins className="w-5 h-5 text-amber-400" />
              <div><p className="text-white/40 text-[10px]">Monedas</p><p className="text-amber-400 font-bold">{coins.toLocaleString()}</p></div>
            </div>
            <div className="rounded-xl bg-card border border-cyan-500/30 p-3 flex items-center gap-2 shadow-lg shadow-cyan-500/10">
              <Star className="w-5 h-5 text-cyan-400" />
              <div><p className="text-white/40 text-[10px]">Puntos</p><p className="text-cyan-400 font-bold">{points.toLocaleString()}</p></div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-amber-900/40 via-amber-800/20 to-card border border-amber-500/30 p-3 mb-4 shadow-lg shadow-amber-500/10">
            {vip ? (
              <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>VIP Activo</span>
                <span className="text-white/40 text-xs font-normal ml-1">· 2x monedas · 3 ruletas gratis</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-sm">Pase VIP</h2>
                  <p className="text-white/40 text-[11px] leading-tight">Sin anuncios · 2x monedas en partida · 3 ruletas gratis diarias</p>
                </div>
                <button onClick={buyVIP} className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20 shrink-0">Comprar</button>
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={() => setTab('upgrades')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${tab === 'upgrades' ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-card border border-border text-white/60'}`}>Upgrades</button>
            <button onClick={() => setTab('diamonds')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${tab === 'diamonds' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20' : 'bg-card border border-border text-white/60'}`}>Diamantes</button>
          </div>

          {tab === 'upgrades' && (
            <div className="grid grid-cols-2 gap-3">
              {upgradeDefs.map((u) => {
                const Icon = u.icon;
                const cost = upgradeCost(u.key);
                return (
                  <div key={u.key} className="rounded-2xl bg-card border p-3 shadow-lg flex flex-col" style={{ borderColor: `${u.color}55` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${u.color}20` }}>
                        <Icon className="w-4 h-4" style={{ color: u.color }} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-bold text-xs truncate">{u.name}</h3>
                        <p className="text-white/40 text-[10px] truncate">{u.desc}</p>
                      </div>
                    </div>
                    <div className="text-center mb-2">
                      <span className="font-bold text-lg" style={{ color: u.color }}>Nv.{upgrades[u.key]}</span>
                    </div>
                    <button
                      onClick={() => {
                        setError(''); setSuccess('');
                        if (!buyUpgrade(u.key, cost)) setError('No tienes suficientes monedas.');
                        else setSuccess(`¡${u.name} mejorada!`);
                      }}
                      className="w-full py-2 rounded-lg text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-lg mt-auto"
                      style={{ backgroundColor: u.color, boxShadow: `0 0 12px ${u.color}40` }}
                    >
                      <Coins className="w-3 h-3" />{cost.toLocaleString()}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'diamonds' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-card border border-cyan-500/30 p-5 shadow-lg shadow-cyan-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-8 h-8 text-cyan-400" />
                  <div><h2 className="text-white font-bold">Comprar 10 Puntos</h2><p className="text-white/40 text-xs">Costo: 15000 Monedas</p></div>
                </div>
                <button onClick={handleBuyPoints} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20">Canjear 15000 Monedas por 10 Puntos</button>
              </div>

              <div className="rounded-2xl bg-card border border-green-500/30 p-5 shadow-lg shadow-green-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <Gem className="w-8 h-8 text-green-400" />
                  <div><h2 className="text-white font-bold">100 Diamantes</h2><p className="text-white/40 text-xs">Costo: 10 Puntos</p></div>
                </div>
                <div className="space-y-3 mb-3">
                  <div>
                    <label className="text-white/60 text-xs font-medium mb-1 block">Player ID *</label>
                    <input type="text" value={playerId} onChange={(e) => setPlayerId(e.target.value)} placeholder="Ej: 1234567890" className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-medium mb-1 block">In-Game Nickname *</label>
                    <input type="text" value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Ej: ProGamer123" className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                  </div>
                </div>
                <button onClick={handleClaimDiamonds} disabled={claiming} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50">
                  <Gem className="w-5 h-5" />{claiming ? 'Procesando...' : 'Reclamar 100 Diamantes'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>
          )}
          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-green-400 text-sm"><CheckCircle2 className="w-4 h-4 shrink-0" />{success}</div>
          )}
        </div>
      </div>

      <SuggestionModal open={showSuggestion} onClose={() => setShowSuggestion(false)} />

      {/* Claim success modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur animate-fade-in">
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-green-900/40 to-card border border-green-500/40 p-8 text-center animate-scale-in shadow-2xl shadow-green-500/20">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
            </div>
            <h2 className="text-white font-bold text-xl mb-2">¡Reclamado con exito!</h2>
            <p className="text-green-300 text-sm mb-6">Tus diamantes te llegaran en un plazo de 24 a 72 horas.</p>
            <button onClick={() => setShowClaimModal(false)} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:opacity-90 transition-opacity">
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
