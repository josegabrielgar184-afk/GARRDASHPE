'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, DollarSign, Users, Wallet, TrendingUp, AlertTriangle, CheckCircle2, Clock, Crown, Shield } from 'lucide-react';

export function AdminScreen() {
  const {
    setScreen, userRole, pendingRequests, refreshPendingRequests, confirmPendingRequest,
    adminUserStats, refreshAdminStats, isOnline,
  } = useGame();
  const [tab, setTab] = useState<'finance' | 'requests' | 'near'>('finance');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    refreshPendingRequests();
    refreshAdminStats();
    const interval = setInterval(() => {
      refreshPendingRequests();
      refreshAdminStats();
    }, 15000);
    return () => clearInterval(interval);
  }, [refreshPendingRequests, refreshAdminStats]);

  const handleConfirm = async (id: string) => {
    setProcessing(id);
    await confirmPendingRequest(id);
    setProcessing(null);
  };

  const isAdmin = userRole === 'admin';
  const isOperator = userRole === 'operador';

  if (!isAdmin && !isOperator) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background">
        <Shield className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-white/60 font-bold">Acceso denegado</p>
        <p className="text-white/30 text-sm">No tienes permisos para ver esta seccion.</p>
        <button onClick={() => setScreen('menu')} className="mt-6 px-6 py-2 rounded-xl bg-card border border-border text-white/60 text-sm hover:text-white">Volver al menu</button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <MuteButton />

      <div className="pt-16 px-4 pb-28 flex-1">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            {isAdmin ? 'Panel de Administracion' : 'Panel de Operador'}
          </h1>
        </div>

        <div className="max-w-md mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {isAdmin && (
              <button onClick={() => setTab('finance')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5 ${tab === 'finance' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-card border border-border text-white/50'}`}>
                <Wallet className="w-4 h-4" />Finanzas
              </button>
            )}
            <button onClick={() => setTab('requests')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5 ${tab === 'requests' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-card border border-border text-white/50'}`}>
              <CheckCircle2 className="w-4 h-4" />Solicitudes
              {pendingRequests.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">{pendingRequests.length}</span>}
            </button>
            {isAdmin && (
              <button onClick={() => setTab('near')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5 ${tab === 'near' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-card border border-border text-white/50'}`}>
                <TrendingUp className="w-4 h-4" />Casi Listos
              </button>
            )}
          </div>

          {/* Finance tab - admin only */}
          {tab === 'finance' && isAdmin && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-amber-900/30 to-card border border-amber-500/30 p-5 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold">Reserva Obligatoria</h2>
                    <p className="text-white/40 text-xs">Dinero que debes mantener en caja</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/50 text-sm">Monedas en circulacion activa:</span>
                    <span className="text-white font-bold">{adminUserStats.totalCoins.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50 text-sm">Total de usuarios:</span>
                    <span className="text-white font-bold">{adminUserStats.totalUsers}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-400 text-sm font-bold">Reserva requerida:</span>
                      <span className="text-amber-400 font-bold text-lg">S/. {adminUserStats.reservedAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-white/30 text-xs mt-1">Calculo: 15,000 monedas = S/. 3.80 soles / $1.00 USD</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-green-900/30 to-card border border-green-500/30 p-5 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold">Fondo Disponible / Liberado</h2>
                    <p className="text-white/40 text-xs">Dinero de usuarios inactivos (7+ dias)</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-400 text-sm font-bold">Fondo liberado:</span>
                  <span className="text-green-400 font-bold text-lg">S/. {adminUserStats.availableAmount.toFixed(2)}</span>
                </div>
                <p className="text-white/30 text-xs mt-2">Este dinero puede retirarse de tus ganancias sin afectar el fondo de canjes inmediatos.</p>
              </div>
            </div>
          )}

          {/* Pending requests tab - both admin and operator */}
          {tab === 'requests' && (
            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-20">
                  <CheckCircle2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No hay solicitudes pendientes</p>
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <div key={req.id} className="rounded-2xl bg-card border border-green-500/30 p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-400" />
                        <span className="text-white font-bold text-sm">{req.nickname}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">PENDIENTE</span>
                    </div>
                    <div className="space-y-1 text-xs mb-3">
                      <div className="flex justify-between"><span className="text-white/40">Player ID:</span><span className="text-white font-mono">{req.playerID}</span></div>
                      <div className="flex justify-between"><span className="text-white/40">Puntos gastados:</span><span className="text-cyan-400 font-bold">{req.puntosGastados}</span></div>
                    </div>
                    {isAdmin && (
                      <div className="text-xs text-white/30 mb-3">
                        <span className="font-bold">UserID:</span> {req.userId.substring(0, 16)}...
                      </div>
                    )}
                    <button
                      onClick={() => handleConfirm(req.id)}
                      disabled={processing === req.id}
                      className="w-full py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processing === req.id ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {processing === req.id ? 'Procesando...' : 'Confirmar Pago'}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Near claim tab - admin only */}
          {tab === 'near' && isAdmin && (
            <div className="space-y-3">
              <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 p-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-cyan-400" />
                  <p className="text-cyan-400 text-xs font-bold">Usuarios con 12,000+ monedas (80% del canje)</p>
                </div>
              </div>
              {adminUserStats.nearClaimUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No hay usuarios cercanos al canje</p>
                </div>
              ) : (
                adminUserStats.nearClaimUsers.map((u) => (
                  <div key={u.uid} className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                      <span className="text-amber-400 font-bold text-sm">{u.nombre[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{u.nombre}</p>
                      <p className="text-white/30 text-xs truncate">{u.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-amber-400 font-bold text-sm">{u.coins.toLocaleString()}</p>
                      <p className={`text-[10px] ${u.inactive ? 'text-white/30' : 'text-green-400'}`}>{u.inactive ? 'Inactivo' : 'Activo'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
