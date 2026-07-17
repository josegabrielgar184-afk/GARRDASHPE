'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import {
  ArrowLeft, CheckCircle2, Clock, Ban, Wallet, LogIn, LogOut, AlertTriangle,
  Users, DollarSign, Receipt, Camera, Coffee, Lock,
} from 'lucide-react';

export function OperatorScreen() {
  const {
    setScreen, userRole, pendingRequests, refreshPendingRequests, confirmPendingRequest, rejectPendingRequest,
    delegateWork, operatorTurn, startOperatorTurn, endOperatorTurn, operatorOnLunch,
  } = useGame();
  const [processing, setProcessing] = useState<string | null>(null);
  const [initialBalance, setInitialBalance] = useState('');
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [checkoutPreview, setCheckoutPreview] = useState<string | null>(null);

  useEffect(() => {
    refreshPendingRequests();
    const interval = setInterval(refreshPendingRequests, 10000);
    return () => clearInterval(interval);
  }, [refreshPendingRequests]);

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

  const handleStartTurn = async () => {
    const balance = parseFloat(initialBalance);
    if (isNaN(balance) || balance < 0) return;
    setStarting(true);
    await startOperatorTurn(balance);
    setStarting(false);
    setInitialBalance('');
  };

  const handleEndTurn = async () => {
    setEnding(true);
    await endOperatorTurn();
    setEnding(false);
    setCheckoutPreview(null);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleCheckoutUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCheckoutPreview(URL.createObjectURL(file));
    }
  };

  if (userRole !== 'operador' && userRole !== 'admin') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background">
        <Lock className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-white/60 font-bold">Acceso denegado</p>
        <button onClick={() => setScreen('menu')} className="mt-6 px-6 py-2 rounded-xl bg-card border border-border text-white/60 text-sm hover:text-white">Volver al menu</button>
      </div>
    );
  }

  if (!delegateWork && userRole === 'operador') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background px-6 text-center">
        <Lock className="w-12 h-12 text-amber-400 mb-3" />
        <p className="text-white font-bold text-lg mb-2">Panel Bloqueado</p>
        <p className="text-white/40 text-sm mb-6">El Admin no ha activado "Delegar Trabajo". Espera a que el Admin habilite el acceso.</p>
        <button onClick={() => setScreen('menu')} className="px-6 py-2 rounded-xl bg-card border border-border text-white/60 text-sm hover:text-white">Volver al menu</button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <MuteButton />

      <div className="pt-16 px-4 pb-28 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-400" />
            Panel de Operador
          </h1>
        </div>

        <div className="max-w-md mx-auto">
          {/* Lunch break warning */}
          {operatorOnLunch && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 mb-4 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-amber-400 font-bold text-xs">Bloqueo de Almuerzo</p>
                <p className="text-white/40 text-xs">Tu turno ha excedido 4 horas. Toma un descanso.</p>
              </div>
            </div>
          )}

          {/* Turn status */}
          {!operatorTurn ? (
            <div className="rounded-2xl bg-card border border-green-500/30 p-5 shadow-lg mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <LogIn className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold">Iniciar Turno</h2>
                  <p className="text-white/40 text-xs">Registra tu saldo inicial de caja</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1 block">Saldo Inicial (S/.)</label>
                  <input type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} placeholder="0.00" className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1 block">Captura de Saldo Inicial (Opcional)</label>
                  <label className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-background/60 border border-dashed border-border text-white/40 text-sm cursor-pointer hover:bg-secondary/30">
                    <Camera className="w-4 h-4" />
                    {receiptPreview ? 'Captura cargada' : 'Subir captura'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} />
                  </label>
                  {receiptPreview && <img src={receiptPreview} alt="Receipt" className="mt-2 w-full rounded-xl max-h-32 object-cover" />}
                </div>
                <button onClick={handleStartTurn} disabled={starting || !initialBalance} className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-400 disabled:opacity-50 flex items-center justify-center gap-2">
                  {starting ? <Clock className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  {starting ? 'Iniciando...' : 'Abrir Turno'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Active turn info */}
              <div className="rounded-2xl bg-gradient-to-br from-green-900/30 to-card border border-green-500/30 p-5 shadow-lg mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 font-bold text-sm">TURNO ACTIVO</span>
                  </div>
                  <span className="text-white/30 text-xs font-mono">#{operatorTurn.id.slice(0, 8)}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-white/50">Saldo inicial:</span><span className="text-white font-bold">S/. {operatorTurn.initialBalance.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Premios pagados:</span><span className="text-red-400 font-bold">S/. {operatorTurn.prizesPaid.toFixed(2)}</span></div>
                  <div className="flex justify-between border-t border-border pt-2"><span className="text-green-400 font-bold">Saldo actual:</span><span className="text-green-400 font-bold text-lg">S/. {operatorTurn.currentBalance.toFixed(2)}</span></div>
                </div>
              </div>

              {/* Pending requests */}
              <div className="mb-4">
                <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />Solicitudes Pendientes
                  {pendingRequests.length > 0 && <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">{pendingRequests.length}</span>}
                </h3>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-10 h-10 text-white/20 mx-auto mb-2" />
                    <p className="text-white/40 text-sm">No hay solicitudes pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((req) => (
                      <div key={req.id} className="rounded-2xl bg-card border border-green-500/30 p-4 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-bold text-sm">{req.nickname}</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">PENDIENTE</span>
                        </div>
                        <div className="space-y-1 text-xs mb-3">
                          <div className="flex justify-between"><span className="text-white/40">Player ID:</span><span className="text-white font-mono">{req.playerID}</span></div>
                          <div className="flex justify-between"><span className="text-white/40">Puntos:</span><span className="text-cyan-400 font-bold">{req.puntosGastados}</span></div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleConfirm(req.id)} disabled={processing === req.id} className="flex-1 py-2 rounded-xl bg-green-500 text-white font-bold text-xs hover:bg-green-400 disabled:opacity-50 flex items-center justify-center gap-1">
                            {processing === req.id ? <Clock className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            Confirmar
                          </button>
                          <button onClick={() => handleReject(req.id)} disabled={processing === req.id} className="px-3 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 font-bold text-xs disabled:opacity-50 flex items-center justify-center">
                            <Ban className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Check-out section */}
              <div className="rounded-2xl bg-card border border-amber-500/30 p-4 mb-4">
                <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Receipt className="w-4 h-4 text-amber-400" />Check-Out / Cierre de Turno</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-white/60 text-xs font-medium mb-1 block">Comprobante de Saldo Real Bancario</label>
                    <label className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-background/60 border border-dashed border-border text-white/40 text-sm cursor-pointer hover:bg-secondary/30">
                      <Camera className="w-4 h-4" />
                      {checkoutPreview ? 'Comprobante cargado' : 'Subir comprobante'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleCheckoutUpload} />
                    </label>
                    {checkoutPreview && <img src={checkoutPreview} alt="Checkout" className="mt-2 w-full rounded-xl max-h-32 object-cover" />}
                  </div>
                  <button onClick={handleEndTurn} disabled={ending} className="w-full py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-400 disabled:opacity-50 flex items-center justify-center gap-2">
                    {ending ? <Clock className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    {ending ? 'Cerrando...' : 'Cerrar Turno'}
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-background/40 border border-border p-3 text-center">
                <p className="text-white/30 text-xs">Sin acceso a saldos del Admin. Privacidad total.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
