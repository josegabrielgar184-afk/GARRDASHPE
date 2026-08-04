'use client';

import { useState } from 'react';
import { useGame, UPGRADE_COSTS } from '@/hooks/use-game';
import { ZOMBIE_CHARACTERS } from '@/lib/characters';
import { MuteButton } from '@/components/game/MuteButton';
import { SuggestionButton, SuggestionModal } from '@/components/game/SuggestionModal';
import { ArrowLeft, Coins, Crown, CheckCircle2, AlertCircle, Zap, Swords, Shield, Lock, Key } from 'lucide-react';
import { VIP_DISPONIBLE_PLAYSTORE, getCampaignKeyPrice } from '@/lib/config';

export function ShopScreen() {
  const {
    coins, spendCoins, vip, vipExpiry, buyVIP, setScreen,
    upgrades, buyUpgrade, selectedZombie, selectZombie,
    towerLevels, buyTower, getTowerLevel, campaignProgress,
    buyCampaignKey, getCampaignKeyPrice: getGameCampaignKeyPrice,
  } = useGame();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [tab, setTab] = useState<'companions' | 'keys' | 'heroes'>('companions');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const upgradeCost = (key: keyof typeof UPGRADE_COSTS) =>
    UPGRADE_COSTS[key] * Math.pow(2, upgrades[key]);

  const companionDefs: Array<{ key: 'turret' | 'drone' | 'medic'; icon: typeof Zap; name: string; desc: string; color: string; baseCost: number }> = [
    { key: 'turret', icon: Zap, name: 'Francotirador', desc: 'Dispara junto a ti', color: '#f97316', baseCost: 200 },
    { key: 'drone', icon: Swords, name: 'Dron', desc: 'Vuela y dispara a múltiples enemigos', color: '#ef4444', baseCost: 500 },
    { key: 'medic', icon: Shield, name: 'Médico', desc: 'Repara la barricada automáticamente', color: '#34d399', baseCost: 800 },
  ];
  const companionCost = (key: 'turret' | 'drone' | 'medic') => companionDefs.find((t) => t.key === key)!.baseCost * Math.pow(2, getTowerLevel(key));

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <MuteButton />
      <SuggestionButton onClick={() => setShowSuggestion(true)} />

      <div className="pt-16 px-4 pb-28 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-xl" style={{ textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>TIENDA</h1>
        </div>

        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <div className="rounded-xl bg-card border border-amber-500/30 p-3 flex items-center gap-2 shadow-lg shadow-amber-500/10">
              <Coins className="w-5 h-5 text-amber-400" />
              <div><p className="text-white/40 text-[10px]">Monedas</p><p className="text-amber-400 font-bold">{coins.toLocaleString()}</p></div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-amber-900/40 via-amber-800/20 to-card border border-amber-500/30 p-3 mb-4 shadow-lg shadow-amber-500/10">
            {vip ? (
              <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>VIP Activo</span>
                {vipExpiry && (
                  <span className="text-white/40 text-xs font-normal ml-1">
                    · {Math.max(0, Math.ceil((new Date(vipExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} días restantes
                  </span>
                )}
              </div>
            ) : VIP_DISPONIBLE_PLAYSTORE ? (
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-sm">Pase VIP (60 días)</h2>
                  <p className="text-white/40 text-[11px] leading-tight">Sin anuncios · 2x monedas en partida · 3 ruletas gratis diarias</p>
                </div>
                <button onClick={buyVIP} className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20 shrink-0">Comprar</button>
              </div>
            ) : (
              <div className="flex items-center gap-3 opacity-60">
                <Lock className="w-6 h-6 text-white/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-white/50 font-bold text-sm">Pase VIP Próximamente</h2>
                  <p className="text-white/30 text-[11px] leading-tight">El pase VIP estará disponible muy pronto en la Play Store</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={() => setTab('companions')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${tab === 'companions' ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-card border border-border text-white/60'}`}>Compañeros</button>
            <button onClick={() => setTab('keys')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${tab === 'keys' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20' : 'bg-card border border-border text-white/60'}`}>Llaves</button>
            <button onClick={() => setTab('heroes')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${tab === 'heroes' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-card border border-border text-white/60'}`}>Héroes</button>
          </div>

          {tab === 'companions' && (
            <div className="grid grid-cols-1 gap-3">
              {companionDefs.map((t) => {
                const Icon = t.icon;
                const cost = companionCost(t.key);
                const level = getTowerLevel(t.key);
                return (
                  <div key={t.key} className="rounded-2xl bg-card border p-4 shadow-lg flex items-center gap-4" style={{ borderColor: `${t.color}55` }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${t.color}20`, boxShadow: `0 0 12px ${t.color}33` }}>
                      <Icon className="w-6 h-6" style={{ color: t.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-sm">{t.name}</h3>
                      <p className="text-white/40 text-xs">{t.desc}</p>
                      <span className="font-black text-lg" style={{ color: t.color }}>Nv.{level}</span>
                    </div>
                    <button
                      onClick={() => {
                        setError(''); setSuccess('');
                        if (!buyTower(t.key, cost)) setError('No tienes suficientes monedas.');
                        else setSuccess(`¡${t.name} subido a Nv.${level + 1}!`);
                      }}
                      className="px-4 py-3 rounded-xl text-white font-bold text-sm transition-colors flex items-center justify-center gap-1 shadow-lg shrink-0"
                      style={{ backgroundColor: t.color, boxShadow: `0 0 12px ${t.color}40` }}
                    >
                      <Coins className="w-4 h-4" />{cost.toLocaleString()}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'heroes' && (
            <div className="grid grid-cols-2 gap-3">
              {ZOMBIE_CHARACTERS.map((hero) => {
                const isOwned = hero.price === 0 || (typeof window !== 'undefined' && localStorage.getItem(`hero_${hero.id}`) === '1');
                const isEquipped = selectedZombie === hero.id;
                const canAfford = coins >= hero.price;
                return (
                  <div key={hero.id} className="rounded-2xl bg-card border p-3 shadow-lg flex flex-col" style={{ borderColor: isEquipped ? hero.color : `${hero.color}33` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${hero.color}20`, boxShadow: `0 0 10px ${hero.glow}` }}>
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: hero.color, boxShadow: `0 0 8px ${hero.glow}` }} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-bold text-xs truncate" style={{ color: isEquipped ? hero.color : undefined }}>{hero.name}</h3>
                        <p className="text-white/40 text-[9px] truncate">{hero.skill}</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-white/50 mb-2 leading-tight">{hero.skillDesc}</div>
                    {isEquipped ? (
                      <div className="w-full py-2 rounded-lg text-white font-bold text-xs text-center" style={{ backgroundColor: hero.color, boxShadow: `0 0 12px ${hero.glow}` }}>EQUIPADO</div>
                    ) : isOwned ? (
                      <button onClick={() => selectZombie(hero.id)} className="w-full py-2 rounded-lg text-white font-bold text-xs transition-colors" style={{ backgroundColor: `${hero.color}88` }}>Equipar</button>
                    ) : (
                      <button
                        onClick={() => {
                          if (canAfford && spendCoins(hero.price)) {
                            if (typeof window !== 'undefined') localStorage.setItem(`hero_${hero.id}`, '1');
                            selectZombie(hero.id);
                            setSuccess(`¡${hero.name} equipado!`);
                          } else { setError('No tienes suficientes monedas.'); }
                        }}
                        disabled={!canAfford}
                        className="w-full py-2 rounded-lg text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 disabled:opacity-40"
                        style={{ backgroundColor: hero.color, boxShadow: `0 0 12px ${hero.glow}` }}
                      >
                        <Coins className="w-3 h-3" />{hero.price.toLocaleString()}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'keys' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-amber-900/40 via-card to-card border border-amber-500/30 p-5 shadow-lg shadow-amber-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#f59e0b20', boxShadow: '0 0 12px #f59e0b33' }}>
                    <Key className="w-7 h-7 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-white font-bold">Llaves de Campaña</h2>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white/40 text-[10px]">Tienes</p>
                    <p className="text-amber-400 font-bold text-lg flex items-center gap-1 justify-end"><Key className="w-4 h-4" />{campaignProgress.keys}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setError(''); setSuccess('');
                    const result = buyCampaignKey();
                    if (result.ok) setSuccess(`¡Llave comprada! Tienes ${campaignProgress.keys + 1} llaves.`);
                    else setError(result.error || 'No se pudo completar la compra.');
                  }}
                  disabled={coins < getGameCampaignKeyPrice()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  <Key className="w-5 h-5" />Comprar 1 Llave
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
    </div>
  );
}
