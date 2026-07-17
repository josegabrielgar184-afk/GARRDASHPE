'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import {
  ArrowLeft, DollarSign, Users, Wallet, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, Crown, Shield, Ban, Zap, Activity, UserCheck, UserX, RotateCw, Siren,
  Filter, Settings2, BarChart3, Coins, ScrollText, ChevronDown, Eye, EyeOff,
} from 'lucide-react';

type Tab = 'finance' | 'requests' | 'near' | 'users' | 'su' | 'control' | 'observer';

export function AdminScreen() {
  const {
    setScreen, userRole, pendingRequests, refreshPendingRequests, confirmPendingRequest, rejectPendingRequest,
    adminUserStats, refreshAdminStats, isOnline, delegateWork, setDelegateWork,
    adminManualIncome, adminSetExchangeLimit, adminBanUser, adminPanicButton, transactionLight,
    observerMode, toggleObserverMode,
  } = useGame();
  const [tab, setTab] = useState<Tab>('finance');
  const [processing, setProcessing] = useState<string | null>(null);
  const [manualIncome, setManualIncome] = useState('');
  const [exchangeLimit, setExchangeLimit] = useState('');
  const [banUid, setBanUid] = useState('');
  const [showSimulator, setShowSimulator] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [simResult, setSimResult] = useState<string | null>(null);

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

  const handleReject = async (id: string) => {
    setProcessing(id);
    await rejectPendingRequest(id);
    setProcessing(null);
  };

  const handleManualIncome = async () => {
    const amount = parseFloat(manualIncome);
    if (isNaN(amount) || amount <= 0) return;
    await adminManualIncome(amount);
    setManualIncome('');
  };

  const handleSetLimit = async () => {
    const limit = parseInt(exchangeLimit, 10);
    if (isNaN(limit) || limit < 0) return;
    await adminSetExchangeLimit(limit);
    setExchangeLimit('');
  };

  const handleBanUser = async () => {
    if (!banUid.trim()) return;
    await adminBanUser(banUid.trim());
    setBanUid('');
  };

  const handlePanic = async () => {
    if (confirm('¿Activar Boton de Panico? Esto bloqueara todos los canjes globalmente.')) {
      await adminPanicButton();
    }
  };

  const handleSimulate = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setSimResult('Ingresa un monto valido en USD');
      return;
    }
    const coins = amount * 15000;
    const soles = amount * 3.80;
    const reserveNeeded = coins / 15000 * 3.80;
    const available = adminUserStats.availableAmount;
    const canCover = available >= reserveNeeded;
    setSimResult(
      `Retiro: $${amount.toFixed(2)} USD (S/. ${soles.toFixed(2)})\n` +
      `Monedas equivalentes: ${coins.toLocaleString()}\n` +
      `Reserva requerida: S/. ${reserveNeeded.toFixed(2)}\n` +
      `Fondo disponible: S/. ${available.toFixed(2)}\n` +
      `Estado: ${canCover ? 'Cubre con fondo liberado' : 'Requiere reserva activa'}`
    );
  };

  const isAdmin = userRole === 'admin';

  if (!isAdmin) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background">
        <Shield className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-white/60 font-bold">Acceso denegado</p>
        <p className="text-white/30 text-sm">No tienes permisos para ver esta seccion.</p>
        <button onClick={() => setScreen('menu')} className="mt-6 px-6 py-2 rounded-xl bg-card border border-border text-white/60 text-sm hover:text-white">Volver al menu</button>
      </div>
    );
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof Wallet; adminOnly?: boolean }> = [
    { id: 'finance', label: 'Finanzas', icon: Wallet },
    { id: 'requests', label: 'Solicitudes', icon: CheckCircle2 },
    { id: 'near', label: 'Casi Listos', icon: TrendingUp },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'su', label: 'SU', icon: Shield },
    { id: 'control', label: 'Control', icon: Settings2 },
    { id: 'observer', label: 'Observador', icon: Eye },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <MuteButton />

      <div className="pt-16 px-4 pb-28 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            Panel de Administracion
          </h1>
        </div>

        <div className="max-w-md mx-auto">
          {/* Delegation Switch */}
          <div className="rounded-2xl bg-card border border-amber-500/30 p-4 mb-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-white font-bold text-sm">Delegar Trabajo</p>
                  <p className="text-white/40 text-xs">{delegateWork ? 'Operador activo - Admin supervisa' : 'Admin asume todo el trabajo'}</p>
                </div>
              </div>
              <button
                onClick={() => setDelegateWork(!delegateWork)}
                className={`w-14 h-7 rounded-full transition-colors ${delegateWork ? 'bg-green-500' : 'bg-white/10'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${delegateWork ? 'translate-x-7' : 'translate-x-0.5'} mt-0.5`} />
              </button>
            </div>
          </div>

          {/* Transactional Semaphore */}
          <div className="rounded-xl bg-card border border-border p-3 mb-4 flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${transactionLight === 'green' ? 'bg-green-400' : transactionLight === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'} animate-pulse`} />
            <div className="flex-1">
              <p className="text-white font-bold text-xs">Semaforo Transaccional</p>
              <p className="text-white/40 text-[10px]">
                {transactionLight === 'green' ? 'Sistema saludable - Reserva activa > 80%' : transactionLight === 'yellow' ? 'Precaucion - Reserva activa 50-80%' : 'Critico - Reserva activa < 50%'}
              </p>
            </div>
            <span className={`text-xs font-bold ${transactionLight === 'green' ? 'text-green-400' : transactionLight === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>
              {transactionLight === 'green' ? 'VERDE' : transactionLight === 'yellow' ? 'AMARILLO' : 'ROJO'}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 px-3 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${tab === t.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-card border border-border text-white/50'}`}
                >
                  <Icon className="w-3.5 h-3.5" />{t.label}
                </button>
              );
            })}
          </div>

          {/* Finance Tab */}
          {tab === 'finance' && (
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
                  <div className="flex justify-between"><span className="text-white/50 text-sm">Monedas en circulacion activa:</span><span className="text-white font-bold">{adminUserStats.activeCoins.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-white/50 text-sm">Total usuarios activos:</span><span className="text-green-400 font-bold">{adminUserStats.activeUsers}</span></div>
                  <div className="flex justify-between"><span className="text-white/50 text-sm">Total usuarios inactivos:</span><span className="text-red-400 font-bold">{adminUserStats.inactiveUsers}</span></div>
                  <div className="flex justify-between"><span className="text-white/50 text-sm">Total monedas:</span><span className="text-white font-bold">{adminUserStats.totalCoins.toLocaleString()}</span></div>
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
                <p className="text-white/30 text-xs mt-2">Monedas inactivas: {adminUserStats.inactiveCoins.toLocaleString()}</p>
              </div>

              {/* Manual income */}
              <div className="rounded-2xl bg-card border border-border p-4">
                <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-400" />Registrar Ingreso Manual (USD)</p>
                <div className="flex gap-2">
                  <input type="number" value={manualIncome} onChange={(e) => setManualIncome(e.target.value)} placeholder="0.00" className="flex-1 px-3 py-2 rounded-xl bg-background/60 border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  <button onClick={handleManualIncome} className="px-4 py-2 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-400">Registrar</button>
                </div>
              </div>
            </div>
          )}

          {/* Requests Tab */}
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
                    <div className="text-xs text-white/30 mb-3">
                      <span className="font-bold">UserID:</span> {req.userId.substring(0, 16)}...
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleConfirm(req.id)} disabled={processing === req.id} className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {processing === req.id ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        {processing === req.id ? 'Procesando...' : 'Confirmar'}
                      </button>
                      <button onClick={() => handleReject(req.id)} disabled={processing === req.id} className="px-3 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 font-bold text-sm hover:bg-red-500/30 disabled:opacity-50 flex items-center justify-center">
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Near Claim Tab */}
          {tab === 'near' && (
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
                      <p className="text-white/30 text-[10px]">Runs: {u.totalRuns ?? 0} · Best: {(u.bestScore ?? 0).toLocaleString()}</p>
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

          {/* Users Tab */}
          {tab === 'users' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-center">
                  <UserCheck className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <p className="text-green-400 font-bold text-lg">{adminUserStats.activeUsers}</p>
                  <p className="text-white/40 text-xs">Activos</p>
                </div>
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-center">
                  <UserX className="w-6 h-6 text-red-400 mx-auto mb-1" />
                  <p className="text-red-400 font-bold text-lg">{adminUserStats.inactiveUsers}</p>
                  <p className="text-white/40 text-xs">Inactivos (7+ dias)</p>
                </div>
              </div>

              <div className="rounded-xl bg-card border border-border p-3 mb-4">
                <p className="text-white font-bold text-xs mb-2 flex items-center gap-2"><Filter className="w-4 h-4 text-cyan-400" />Usuario Retornado (5 partidas tras 15 dias inactivo)</p>
                {adminUserStats.returnedUsers.length === 0 ? (
                  <p className="text-white/30 text-xs">No hay usuarios retornados pendientes de verificacion</p>
                ) : (
                  <div className="space-y-2">
                    {adminUserStats.returnedUsers.slice(0, 10).map((u) => (
                      <div key={u.uid} className="flex items-center justify-between text-xs">
                        <span className="text-white/60 truncate">{u.nombre}</span>
                        <span className="text-red-400 shrink-0 ml-2">Pendiente: {Math.max(0, 5 - (u.totalRuns ?? 0))} partidas</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-card border border-border p-3">
                <p className="text-white font-bold text-xs mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-cyan-400" />Usuarios Cercanos al Canje</p>
                {adminUserStats.nearClaimUsers.slice(0, 5).map((u) => (
                  <div key={u.uid} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-white/60 truncate">{u.nombre}</span>
                    <span className="text-amber-400 font-bold shrink-0 ml-2">{u.coins.toLocaleString()}</span>
                  </div>
                ))}
                {adminUserStats.nearClaimUsers.length === 0 && <p className="text-white/30 text-xs">No hay usuarios cercanos</p>}
              </div>
            </div>
          )}

          {/* SU Tab */}
          {tab === 'su' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-purple-900/30 to-card border border-purple-500/30 p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <h2 className="text-white font-bold text-sm">Modulo Super-Usuario (SU)</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-white/50 text-xs mb-1">Gestion de cuentas intermediarias</p>
                    <p className="text-white/30 text-xs">Configuracion de operadores y cuentas de pago</p>
                  </div>
                  <button className="w-full py-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 font-bold text-xs hover:bg-purple-500/30">Configurar Cuentas</button>
                </div>
              </div>

              {/* Dispersion Simulator */}
              <div className="rounded-2xl bg-card border border-border p-4">
                <button onClick={() => setShowSimulator(!showSimulator)} className="w-full flex items-center justify-between text-white font-bold text-sm mb-3">
                  <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" />Simulador de Dispersión de Retiro</span>
                  <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showSimulator ? 'rotate-180' : ''}`} />
                </button>
                {showSimulator && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Monto USD" className="flex-1 px-3 py-2 rounded-xl bg-background/60 border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                      <button onClick={handleSimulate} className="px-4 py-2 rounded-xl bg-cyan-500 text-white font-bold text-sm hover:bg-cyan-400">Simular</button>
                    </div>
                    {simResult && (
                      <pre className="text-xs text-white/60 whitespace-pre-wrap bg-background/40 rounded-xl p-3 border border-border">{simResult}</pre>
                    )}
                  </div>
                )}
              </div>

              {/* Operator Cash Audit */}
              <div className="rounded-2xl bg-card border border-border p-4">
                <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><ScrollText className="w-4 h-4 text-amber-400" />Auditoria de Caja Chica del Operador</p>
                <p className="text-white/40 text-xs mb-2">Cruce automatico: Saldo inicial vs Premios aprobados</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-white/40">Saldo inicial registrado:</span><span className="text-white font-mono">S/. --</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Premios aprobados:</span><span className="text-red-400 font-mono">S/. --</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Saldo esperado:</span><span className="text-green-400 font-mono">S/. --</span></div>
                </div>
                <p className="text-white/30 text-[10px] mt-2">Los datos del operador se cargan cuando un turno esta activo.</p>
              </div>
            </div>
          )}

          {/* Control Tab */}
          {tab === 'control' && (
            <div className="space-y-4">
              {/* Exchange limit */}
              <div className="rounded-2xl bg-card border border-border p-4">
                <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Settings2 className="w-4 h-4 text-cyan-400" />Limite de Canjes Diarios</p>
                <div className="flex gap-2">
                  <input type="number" value={exchangeLimit} onChange={(e) => setExchangeLimit(e.target.value)} placeholder="Ej: 10" className="flex-1 px-3 py-2 rounded-xl bg-background/60 border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                  <button onClick={handleSetLimit} className="px-4 py-2 rounded-xl bg-cyan-500 text-white font-bold text-sm hover:bg-cyan-400">Guardar</button>
                </div>
              </div>

              {/* Creator management */}
              <div className="rounded-2xl bg-card border border-border p-4">
                <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Crown className="w-4 h-4 text-amber-400" />Gestion de Creadores</p>
                <p className="text-white/40 text-xs mb-2">Asignar rangos Bronce/Plata/Oro y banear creadores</p>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={banUid} onChange={(e) => setBanUid(e.target.value)} placeholder="UID del usuario" className="flex-1 px-3 py-2 rounded-xl bg-background/60 border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                  <button onClick={handleBanUser} className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-400 flex items-center gap-1"><Ban className="w-4 h-4" />Banear</button>
                </div>
              </div>

              {/* Payroll */}
              <div className="rounded-2xl bg-card border border-border p-4">
                <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Wallet className="w-4 h-4 text-green-400" />Nomina de Ayudantes</p>
                <p className="text-white/40 text-xs">Configura los pagos a operadores y moderadores</p>
                <button className="w-full mt-2 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/40 font-bold text-xs hover:bg-green-500/30">Configurar Nomina</button>
              </div>

              {/* Blacklist */}
              <div className="rounded-2xl bg-card border border-border p-4">
                <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Ban className="w-4 h-4 text-red-400" />Blacklist de Dispositivos</p>
                <p className="text-white/40 text-xs mb-2">Dispositivos baneados permanentemente por fraude</p>
                <button className="w-full py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 font-bold text-xs hover:bg-red-500/30">Ver Blacklist</button>
              </div>

              {/* Panic Button */}
              <button onClick={handlePanic} className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:opacity-90">
                <Siren className="w-6 h-6" />BOTON DE PANICO
              </button>
              <p className="text-white/30 text-xs text-center">Bloquea todos los canjes globalmente hasta desactivarlo manualmente</p>
            </div>
          )}

          {/* Observer Tab */}
          {tab === 'observer' && (
            <div className="space-y-4">
              <div className={`rounded-2xl p-4 border shadow-lg ${observerMode ? 'bg-gradient-to-br from-cyan-900/30 to-card border-cyan-500/40' : 'bg-card border-border'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${observerMode ? 'bg-cyan-500/20' : 'bg-white/5'}`}>
                      {observerMode ? <Eye className="w-6 h-6 text-cyan-400" /> : <EyeOff className="w-6 h-6 text-white/40" />}
                    </div>
                    <div>
                      <h2 className="text-white font-bold">Modo Observador / Ver Todo</h2>
                      <p className="text-white/40 text-xs">{observerMode ? 'Navegacion libre activa - sin permisos de edicion' : 'Activa para navegar por todos los datos del flujo del juego'}</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleObserverMode}
                    className={`w-14 h-7 rounded-full transition-colors ${observerMode ? 'bg-cyan-500' : 'bg-white/10'}`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-white transition-transform ${observerMode ? 'translate-x-7' : 'translate-x-0.5'} mt-0.5`} />
                  </button>
                </div>
              </div>

              {observerMode ? (
                <div className="space-y-3">
                  <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 p-3">
                    <p className="text-cyan-400 text-xs font-bold mb-2 flex items-center gap-2"><Eye className="w-4 h-4" />Vista Activa - Solo Lectura</p>
                    <p className="text-white/40 text-xs">Puedes navegar libremente por todas las pantallas del juego sin afectar el estado. Las acciones de edicion estan deshabilitadas.</p>
                  </div>

                  <div className="rounded-2xl bg-card border border-border p-4">
                    <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" />Estado del Sistema en Tiempo Real</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-white/40">Usuarios totales:</span><span className="text-white font-bold">{adminUserStats.totalUsers}</span></div>
                      <div className="flex justify-between"><span className="text-white/40">Usuarios activos:</span><span className="text-green-400 font-bold">{adminUserStats.activeUsers}</span></div>
                      <div className="flex justify-between"><span className="text-white/40">Usuarios inactivos:</span><span className="text-red-400 font-bold">{adminUserStats.inactiveUsers}</span></div>
                      <div className="flex justify-between"><span className="text-white/40">Monedas totales:</span><span className="text-amber-400 font-bold">{adminUserStats.totalCoins.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-white/40">Solicitudes pendientes:</span><span className="text-cyan-400 font-bold">{pendingRequests.length}</span></div>
                      <div className="flex justify-between"><span className="text-white/40">Semaforo:</span><span className={`font-bold ${transactionLight === 'green' ? 'text-green-400' : transactionLight === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>{transactionLight === 'green' ? 'VERDE' : transactionLight === 'yellow' ? 'AMARILLO' : 'ROJO'}</span></div>
                      <div className="flex justify-between"><span className="text-white/40">Delegacion:</span><span className={`font-bold ${delegateWork ? 'text-green-400' : 'text-white/40'}`}>{delegateWork ? 'ON (Operador)' : 'OFF (Admin)'}</span></div>
                      <div className="flex justify-between"><span className="text-white/40">Reserva obligatoria:</span><span className="text-amber-400 font-bold">S/. {adminUserStats.reservedAmount.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-white/40">Fondo liberado:</span><span className="text-green-400 font-bold">S/. {adminUserStats.availableAmount.toFixed(2)}</span></div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-card border border-border p-4">
                    <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-cyan-400" />Usuarios Cercanos al Canje (Vista)</p>
                    {adminUserStats.nearClaimUsers.length === 0 ? (
                      <p className="text-white/30 text-xs">No hay usuarios cercanos</p>
                    ) : (
                      <div className="space-y-2">
                        {adminUserStats.nearClaimUsers.map((u) => (
                          <div key={u.uid} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
                            <div className="min-w-0">
                              <p className="text-white/60 truncate">{u.nombre}</p>
                              <p className="text-white/30 text-[10px]">{u.email}</p>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p className="text-amber-400 font-bold">{u.coins.toLocaleString()}</p>
                              <p className={`text-[10px] ${u.inactive ? 'text-red-400' : 'text-green-400'}`}>{u.inactive ? 'Inactivo' : 'Activo'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl bg-card border border-border p-4">
                    <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><ScrollText className="w-4 h-4 text-cyan-400" />Flujo de Solicitudes Recientes</p>
                    {pendingRequests.length === 0 ? (
                      <p className="text-white/30 text-xs">No hay solicitudes activas</p>
                    ) : (
                      <div className="space-y-2">
                        {pendingRequests.slice(0, 5).map((req) => (
                          <div key={req.id} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
                            <div className="min-w-0">
                              <p className="text-white/60 truncate">{req.nickname}</p>
                              <p className="text-white/30 text-[10px] font-mono">{req.playerID}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold shrink-0 ml-2">{req.estado.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-card border border-border p-6 text-center">
                  <EyeOff className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">Activa el Modo Observador para navegar libremente por los datos del flujo del juego.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
