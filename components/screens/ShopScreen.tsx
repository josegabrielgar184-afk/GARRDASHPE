'use client';

import { useState, useEffect, useRef } from 'react';
import { useGame, UPGRADE_COSTS } from '@/hooks/use-game';
import { ZOMBIE_CHARACTERS } from '@/lib/characters';
import { MuteButton } from '@/components/game/MuteButton';
import { SuggestionButton, SuggestionModal } from '@/components/game/SuggestionModal';
import { ArrowLeft, Coins, Crown, CheckCircle2, AlertCircle, Zap, Swords, Shield, Lock, Key, Video } from 'lucide-react';
import { VIP_DISPONIBLE_PLAYSTORE } from '@/lib/config';
import { getCoinAdStatus, recordCoinAd, getCoinAdReward, getMaxCoinAdsPerDay, getKeyAdProgress, recordKeyAd, getAdsPerKey } from '@/lib/ad-rewards';
import { getPerformanceTier, type PerformanceTier } from '@/lib/performance';

export function ShopScreen() {
  const {
    coins, spendCoins, addCoins, vip, vipExpiry, buyVIP, setScreen,
    upgrades, selectedZombie, selectZombie,
    getTowerLevel, campaignProgress,
    buyCampaignKey, getCampaignKeyPrice: getGameCampaignKeyPrice,
    addCampaignKeyFromAd,
  } = useGame();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [tab, setTab] = useState<'companions' | 'keys' | 'heroes'>('companions');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [coinAdStatus, setCoinAdStatus] = useState(getCoinAdStatus());
  const [keyProgress, setKeyProgress] = useState(getKeyAdProgress());
  const [perfTier] = useState<PerformanceTier>(getPerformanceTier());
  const adDebounceRef = useRef<number>(0);

  const adDebounced = (): boolean => {
    const now = Date.now();
    if (now - adDebounceRef.current < 4000) return false;
    adDebounceRef.current = now;
    return true;
  };

  useEffect(() => {
    setCoinAdStatus(getCoinAdStatus());
    setKeyProgress(getKeyAdProgress());
  }, []);

  const companionDefs: Array<{ key: 'turret' | 'drone' | 'medic'; icon: typeof Zap; name: string; desc: string; color: string; baseCost: number }> = [
    { key: 'turret', icon: Zap, name: 'Francotirador', desc: 'Dispara junto a ti', color: '#f97316', baseCost: 200 },
    { key: 'drone', icon: Swords, name: 'Dron', desc: 'Vuela y dispara a múltiples enemigos', color: '#ef4444', baseCost: 500 },
    { key: 'medic', icon: Shield, name: 'Médico', desc: 'Repara la barricada automáticamente', color: '#34d399', baseCost: 800 },
  ];
  const companionCost = (key: 'turret' | 'drone' | 'medic') => companionDefs.find((t) => t.key === key)!.baseCost * Math.pow(2, getTowerLevel(key));

  const handleCoinAdReward = () => {
    const ok = recordCoinAd();
    if (ok) {
      const reward = getCoinAdReward();
      addCoins(reward);
      setSuccess(`¡+${reward} monedas ganadas!`);
      setCoinAdStatus(getCoinAdStatus());
    } else {
      setError('Has alcanzado el límite diario de anuncios.');
    }
  };

  const handleKeyAdReward = () => {
    const result = recordKeyAd();
    if (result.earnedKey) {
      addCampaignKeyFromAd();
      setSuccess('¡Llave de Campaña ganada!');
    } else {
      setSuccess(`Progreso: ${result.newProgress}/${result.adsNeeded} anuncios vistos`);
    }
    setKeyProgress(getKeyAdProgress());
  };

  const renderGlow = perfTier === 'high';

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0a0e14] via-[#0f1520] to-[#1a1a28]">
      <MuteButton />
      <SuggestionButton onClick={() => setShowSuggestion(true)} />

      <div className="pt-16 px-4 pb-16 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-black text-xl tracking-widest uppercase" style={{ fontFamily: 'Inter, sans-serif', textShadow: renderGlow ? '0 0 10px rgba(34,211,238,0.5)' : 'none', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>TIENDA</h1>
        </div>

        <div className="max-w-md mx-auto">
          {/* Balance card */}
          <div className="mb-4">
            <div className="rounded-none bg-gradient-to-r from-[#1a1a28] to-[#0f1520] border-l-4 border-amber-500 p-3 flex items-center gap-2" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}>
              <div className="w-9 h-9 rounded-none bg-amber-500/20 flex items-center justify-center" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}><Coins className="w-4 h-4 text-amber-400" /></div>
              <div><p className="text-white/40 text-[10px] uppercase tracking-wider">Monedas</p><p className="text-amber-400 font-bold">{coins.toLocaleString()}</p></div>
            </div>
          </div>

          {/* VIP card hidden */}
          {false && (
          <div className="rounded-none bg-gradient-to-r from-amber-900/30 via-[#1a1a28] to-[#0f1520] border-l-4 border-amber-500/60 p-3 mb-4" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}>
            {vip ? (
              <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>VIP Activo</span>
                {vipExpiry && (
                  <span className="text-white/40 text-xs font-normal ml-1">
                    · {Math.max(0, Math.ceil((new Date(vipExpiry as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} días restantes
                  </span>
                )}
              </div>
            ) : VIP_DISPONIBLE_PLAYSTORE ? (
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-sm uppercase tracking-wide">Pase VIP (60 días)</h2>
                  <p className="text-white/40 text-[11px] leading-tight">Sin anuncios · 2x monedas · 3 ruletas gratis</p>
                </div>
                <button onClick={buyVIP} className="px-4 py-2 rounded-none bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-sm hover:opacity-90 transition-opacity shrink-0" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}>Comprar</button>
              </div>
            ) : (
              <div className="flex items-center gap-3 opacity-60">
                <Lock className="w-6 h-6 text-white/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-white/50 font-bold text-sm uppercase tracking-wide">Pase VIP Próximamente</h2>
                  <p className="text-white/30 text-[11px] leading-tight">Disponible muy pronto en la Play Store</p>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => setTab('companions')} className={`flex-1 py-2.5 rounded-none font-bold text-sm transition-colors uppercase tracking-wide ${tab === 'companions' ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white' : 'bg-[#1a1a28] border border-white/10 text-white/60'}`} style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}>Compañeros</button>
            <button onClick={() => setTab('keys')} className={`flex-1 py-2.5 rounded-none font-bold text-sm transition-colors uppercase tracking-wide ${tab === 'keys' ? 'bg-gradient-to-r from-amber-600 to-orange-700 text-white' : 'bg-[#1a1a28] border border-white/10 text-white/60'}`} style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}>Llaves</button>
            <button onClick={() => setTab('heroes')} className={`flex-1 py-2.5 rounded-none font-bold text-sm transition-colors uppercase tracking-wide ${tab === 'heroes' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' : 'bg-[#1a1a28] border border-white/10 text-white/60'}`} style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}>Héroes</button>
          </div>

          {tab === 'companions' && (
            <div className="grid grid-cols-1 gap-3">
              {companionDefs.map((t) => {
                const Icon = t.icon;
                const cost = companionCost(t.key);
                const level = getTowerLevel(t.key);
                return (
                  <div key={t.key} className="rounded-none bg-[#1a1a28] border-l-4 p-4 flex items-center gap-4" style={{ borderColor: t.color, clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}>
                    <div className="w-12 h-12 rounded-none flex items-center justify-center shrink-0" style={{ backgroundColor: `${t.color}20` }}>
                      <Icon className="w-6 h-6" style={{ color: t.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-sm uppercase tracking-wide">{t.name}</h3>
                      <p className="text-white/40 text-xs">{t.desc}</p>
                      <span className="font-black text-lg" style={{ color: t.color }}>Nv.{level}</span>
                    </div>
                    <button
                      onClick={() => {
                        setError(''); setSuccess('');
                        // useGame buyTower logic assumed available
                      }}
                      className="px-4 py-3 rounded-none text-white font-bold text-sm transition-colors flex items-center justify-center gap-1 shrink-0"
                      style={{ backgroundColor: t.color, clipPath: 'polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}
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
                  <div key={hero.id} className="rounded-none bg-[#1a1a28] border-l-4 p-3 flex flex-col" style={{ borderColor: isEquipped ? hero.color : `${hero.color}44`, clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-none flex items-center justify-center shrink-0" style={{ backgroundColor: `${hero.color}20` }}>
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: hero.color }} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-bold text-xs truncate uppercase tracking-wide" style={{ color: isEquipped ? hero.color : undefined }}>{hero.name}</h3>
                        <p className="text-white/40 text-[9px] truncate">{hero.skill}</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-white/50 mb-2 leading-tight">{hero.skillDesc}</div>
                    {isEquipped ? (
                      <div className="w-full py-2 rounded-none text-white font-bold text-xs text-center" style={{ backgroundColor: hero.color, clipPath: 'polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}>EQUIPADO</div>
                    ) : isOwned ? (
                      <button onClick={() => selectZombie(hero.id)} className="w-full py-2 rounded-none text-white font-bold text-xs transition-colors" style={{ backgroundColor: `${hero.color}88`, clipPath: 'polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}>Equipar</button>
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
                        className="w-full py-2 rounded-none text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 disabled:opacity-40"
                        style={{ backgroundColor: hero.color, clipPath: 'polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}
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
              {/* Buy key with coins */}
              <div className="rounded-none bg-gradient-to-br from-amber-900/30 via-[#1a1a28] to-[#0f1520] border-l-4 border-amber-500/60 p-5" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-none flex items-center justify-center shrink-0" style={{ backgroundColor: '#f59e0b20' }}>
                    <Key className="w-7 h-7 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-white font-bold uppercase tracking-wide">Llaves de Campaña</h2>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white/40 text-[10px] uppercase">Tienes</p>
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
                  className="w-full py-3 rounded-none bg-gradient-to-r from-amber-600 to-orange-700 text-white font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
                >
                  <Key className="w-5 h-5" />Comprar 1 Llave ({getGameCampaignKeyPrice().toLocaleString()})
                </button>
              </div>

              {/* Earn key by watching ads */}
              <div className="rounded-none bg-gradient-to-br from-cyan-900/30 via-[#1a1a28] to-[#0f1520] border-l-4 border-cyan-500/60 p-5" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-none flex items-center justify-center shrink-0" style={{ backgroundColor: '#22d3ee20' }}>
                    <Video className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-white font-bold uppercase tracking-wide">Llave por Anuncios</h2>
                    <p className="text-white/40 text-xs">Ve {getAdsPerKey()} anuncios para ganar 1 llave</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-cyan-400 text-xs font-bold uppercase">Progreso</span>
                    <span className="text-white/60 text-xs">{keyProgress.adsWatched}/{keyProgress.adsNeeded}</span>
                  </div>
                  <div className="h-3 bg-[#0f1520] border border-cyan-500/30 overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}>
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all" style={{ width: `${(keyProgress.adsWatched / keyProgress.adsNeeded) * 100}%` }} />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!adDebounced()) return;
                    handleKeyAdReward();
                  }}
                  className="w-full py-3 rounded-none bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                  style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
                >
                  <Video className="w-5 h-5" />Ver Anuncio ({keyProgress.adsWatched}/{keyProgress.adsNeeded})
                </button>
              </div>

              {/* Coins by watching ads */}
              <div className="rounded-none bg-gradient-to-br from-green-900/30 via-[#1a1a28] to-[#0f1520] border-l-4 border-green-500/60 p-5" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-none flex items-center justify-center shrink-0" style={{ backgroundColor: '#10b98120' }}>
                    <Coins className="w-7 h-7 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-white font-bold uppercase tracking-wide">Monedas por Anuncio</h2>
                    <p className="text-white/40 text-xs">+{getCoinAdReward()} monedas por anuncio · Máx {getMaxCoinAdsPerDay()}/día</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-green-400 text-xs font-bold uppercase">Hoy</span>
                    <span className="text-white/60 text-xs">{coinAdStatus.count}/{getMaxCoinAdsPerDay()}</span>
                  </div>
                  <div className="h-3 bg-[#0f1520] border border-green-500/30 overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}>
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all" style={{ width: `${(coinAdStatus.count / getMaxCoinAdsPerDay()) * 100}%` }} />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!adDebounced()) return;
                    setError(''); setSuccess(''); handleCoinAdReward();
                  }}
                  disabled={coinAdStatus.remaining <= 0}
                  className="w-full py-3 rounded-none bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
                >
                  <Video className="w-5 h-5" />{coinAdStatus.remaining > 0 ? `Ver Anuncio (${coinAdStatus.remaining} restantes)` : 'Límite diario alcanzado'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-none bg-red-500/10 border-l-4 border-red-500 p-3 text-red-400 text-sm" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>
          )}
          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-none bg-green-500/10 border-l-4 border-green-500 p-3 text-green-400 text-sm" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}><CheckCircle2 className="w-4 h-4 shrink-0" />{success}</div>
          )}
        </div>
      </div>

      <SuggestionModal open={showSuggestion} onClose={() => setShowSuggestion(false)} />
    </div>
  );
}
