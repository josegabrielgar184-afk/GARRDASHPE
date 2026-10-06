'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Users, Star, Gift, TrendingUp, Youtube, Check, X, Loader2, Sparkles, Award } from 'lucide-react';
import { normalizeCode, isValidCode, isValidUrl, CODE_MIN_LENGTH, CODE_MAX_LENGTH, type Platform } from '@/lib/creators';

type Section = 'main' | 'support' | 'creator' | 'ranking';

export function CreatorsScreen() {
  const {
    setScreen, coins, userRole,
    creatorApplication, refreshCreatorApplication,
    creatorReferralCode, refreshCreatorReferralCode,
    submitCreatorApplication,
    applyReferralCode,
    creatorStats, refreshCreatorStats,
    creatorRanking, refreshCreatorRanking,
    user,
  } = useGame();

  const [section, setSection] = useState<Section>('main');
  const [codeInput, setCodeInput] = useState('');
  const [applyMsg, setApplyMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [form, setForm] = useState({
    channelName: '',
    platform: 'tiktok' as Platform,
    profileUrl: '',
    videoUrl: '',
    requestedCode: '',
  });
  const [formMsg, setFormMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    refreshCreatorApplication();
    refreshCreatorReferralCode();
    refreshCreatorStats();
    refreshCreatorRanking();
  }, [refreshCreatorApplication, refreshCreatorReferralCode, refreshCreatorStats, refreshCreatorRanking]);

  const handleApplyCode = async () => {
    if (!codeInput.trim()) return;
    setApplyLoading(true);
    setApplyMsg(null);
    const res = await applyReferralCode(codeInput);
    setApplyMsg({ ok: res.ok, text: res.ok ? `¡Codigo aplicado! Recibiste 50 monedas por apoyar a un creador.` : (res.error ?? 'Error') });
    if (res.ok) setCodeInput('');
    setApplyLoading(false);
  };

  const handleSubmitApplication = async () => {
    if (!form.channelName.trim() || !form.profileUrl.trim() || !form.videoUrl.trim() || !form.requestedCode.trim()) {
      setFormMsg({ ok: false, text: 'Completa todos los campos' });
      return;
    }
    setFormLoading(true);
    setFormMsg(null);
    const res = await submitCreatorApplication(
      form.channelName.trim(),
      form.platform,
      form.profileUrl.trim(),
      form.videoUrl.trim(),
      form.requestedCode.trim()
    );
    setFormMsg({ ok: res.ok, text: res.ok ? 'Solicitud enviada. Te notificaremos cuando sea revisada.' : (res.error ?? 'Error') });
    if (res.ok) {
      setForm({ channelName: '', platform: 'tiktok', profileUrl: '', videoUrl: '', requestedCode: '' });
      await refreshCreatorApplication();
      setSection('main');
    }
    setFormLoading(false);
  };

  const isApprovedCreator = creatorApplication?.status === 'approved';

  return (
    <div className="fixed inset-0 overflow-y-auto bg-background text-foreground">
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-card/95 backdrop-blur border-b border-border">
        <button onClick={() => setScreen('menu')} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Menu
        </button>
        <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Creadores
        </h1>
        <MuteButton />
      </div>

      <div className="max-w-md mx-auto px-4 py-5 space-y-5 pb-24">
        {/* Section tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <TabBtn active={section === 'main'} onClick={() => setSection('main')} label="Inicio" />
          <TabBtn active={section === 'support'} onClick={() => setSection('support')} label="Apoyar" />
          <TabBtn active={section === 'creator'} onClick={() => setSection('creator')} label="Ser Creador" />
          <TabBtn active={section === 'ranking'} onClick={() => setSection('ranking')} label="Ranking" />
        </div>

        {/* MAIN section */}
        {section === 'main' && (
          <div className="space-y-4">
            {/* Apoya un creador card */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-card border border-primary/20 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-black text-base">Apoya a un creador</h2>
                  <p className="text-xs text-muted-foreground">Usa el codigo de tu creador favorito</p>
                </div>
              </div>
              {creatorReferralCode ? (
                <div className="rounded-xl bg-primary/10 border border-primary/30 px-4 py-3">
                  <p className="text-sm text-muted-foreground">Apoyas a:</p>
                  <p className="text-2xl font-black text-primary tracking-wider">{creatorReferralCode}</p>
                </div>
              ) : (
                <button onClick={() => setSection('support')} className="w-full rounded-xl bg-primary text-primary-foreground font-bold py-3 text-sm hover:opacity-90 transition-opacity">
                  Ingresar codigo
                </button>
              )}
            </div>

            {/* Programa de creadores card */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h2 className="font-black text-base">Programa de Creadores</h2>
                  <p className="text-xs text-muted-foreground">Promociona GarrDash y gana monedas</p>
                </div>
              </div>
              {creatorApplication ? (
                <div className="space-y-2">
                  <div className="rounded-xl bg-muted/30 border border-border px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-1">Estado de tu solicitud</p>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={creatorApplication.status} />
                      <span className="text-sm font-bold">{creatorApplication.requestedCode}</span>
                    </div>
                  </div>
                  {creatorApplication.status === 'rejected' && (
                    <p className="text-xs text-red-400">Tu solicitud fue rechazada. Puedes volver a solicitar con otro codigo.</p>
                  )}
                  {creatorApplication.status === 'approved' && (
                    <button onClick={() => setSection('creator')} className="w-full rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-500 font-bold py-2.5 text-sm hover:bg-yellow-500/30 transition-colors">
                      Ver mi panel
                    </button>
                  )}
                </div>
              ) : (
                <button onClick={() => setSection('creator')} className="w-full rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-500 font-bold py-3 text-sm hover:bg-yellow-500/30 transition-colors">
                  Solicitar ser creador
                </button>
              )}
            </div>
          </div>
        )}

        {/* SUPPORT section — enter a creator code */}
        {section === 'support' && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-card border border-border p-5">
              <h2 className="font-black text-base mb-1">Apoya a un creador</h2>
              <p className="text-xs text-muted-foreground mb-4">Solo puedes elegir uno. No puedes cambiarlo despues.</p>
              {creatorReferralCode ? (
                <div className="rounded-xl bg-primary/10 border border-primary/30 px-4 py-4 text-center">
                  <p className="text-sm text-muted-foreground">Ya apoyas a</p>
                  <p className="text-3xl font-black text-primary tracking-wider">{creatorReferralCode}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_MAX_LENGTH))}
                    placeholder="CODIGO"
                    maxLength={CODE_MAX_LENGTH}
                    className="w-full rounded-xl bg-muted/30 border border-border px-4 py-3 text-center text-2xl font-black tracking-widest focus:outline-none focus:border-primary"
                  />
                  {applyMsg && (
                    <p className={`text-sm text-center ${applyMsg.ok ? 'text-green-400' : 'text-red-400'}`}>{applyMsg.text}</p>
                  )}
                  <button
                    onClick={handleApplyCode}
                    disabled={applyLoading || !codeInput.trim()}
                    className="w-full rounded-xl bg-primary text-primary-foreground font-bold py-3 text-sm disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    {applyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                    Apoyar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CREATOR section — apply to become a creator + creator panel */}
        {section === 'creator' && (
          <div className="space-y-5">
            {isApprovedCreator && (
              <>
                {/* Creator dashboard */}
                <div className="rounded-2xl bg-gradient-to-br from-yellow-500/10 to-card border border-yellow-500/20 p-5 text-center">
                  <p className="text-xs text-muted-foreground mb-1">MI CODIGO</p>
                  <p className="text-4xl font-black text-yellow-500 tracking-wider">{creatorApplication?.requestedCode}</p>
                </div>

                {creatorStats && (
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Referidos" value={creatorStats.total} icon={<Users className="w-4 h-4" />} />
                    <StatCard label="Pendientes" value={creatorStats.pending} icon={<Loader2 className="w-4 h-4" />} />
                    <StatCard label="Calificados" value={creatorStats.qualified} icon={<Check className="w-4 h-4" />} />
                    <StatCard label="Ganado" value={creatorStats.coinsEarned.toLocaleString()} icon={<Gift className="w-4 h-4" />} />
                  </div>
                )}

                <div className="rounded-xl bg-muted/30 border border-border p-4">
                  <p className="text-xs text-muted-foreground">
                    Comparte tu codigo para que tus seguidores lo usen. Recibes 50 monedas por cada jugador que juegue 10+ minutos en 2 dias diferentes.
                  </p>
                </div>
              </>
            )}

            {!isApprovedCreator && (!creatorApplication || creatorApplication.status === 'rejected') && (
              /* Creator application form */
              <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
                <div>
                  <h2 className="font-black text-base flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Solicitar ser creador
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Completa el formulario. Admin revisara tu solicitud.</p>
                </div>

                <FormField label="Nombre del canal">
                  <input
                    value={form.channelName}
                    onChange={(e) => setForm({ ...form, channelName: e.target.value })}
                    placeholder="PepitoFF"
                    maxLength={50}
                    className="w-full rounded-xl bg-muted/30 border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </FormField>

                <FormField label="Plataforma">
                  <div className="flex gap-2">
                    {(['tiktok', 'youtube', 'both'] as Platform[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setForm({ ...form, platform: p })}
                        className={`flex-1 rounded-lg py-2 text-xs font-bold capitalize transition-colors ${
                          form.platform === p ? 'bg-primary text-primary-foreground' : 'bg-muted/30 border border-border'
                        }`}
                      >
                        {p === 'both' ? 'Ambas' : p}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Enlace del perfil/canal">
                  <input
                    value={form.profileUrl}
                    onChange={(e) => setForm({ ...form, profileUrl: e.target.value })}
                    placeholder="https://tiktok.com/@pepitoff"
                    className="w-full rounded-xl bg-muted/30 border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </FormField>

                <FormField label="Enlace del video promocionando GarrDash">
                  <input
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl bg-muted/30 border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </FormField>

                <FormField label={`Codigo deseado (${CODE_MIN_LENGTH}-${CODE_MAX_LENGTH} letras/numeros)`}>
                  <input
                    value={form.requestedCode}
                    onChange={(e) => setForm({ ...form, requestedCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_MAX_LENGTH) })}
                    placeholder="PEPITOFF"
                    maxLength={CODE_MAX_LENGTH}
                    className="w-full rounded-xl bg-muted/30 border border-border px-4 py-2.5 text-sm outline-none focus:border-primary font-black tracking-widest"
                  />
                </FormField>

                {formMsg && (
                  <p className={`text-sm ${formMsg.ok ? 'text-green-400' : 'text-red-400'}`}>{formMsg.text}</p>
                )}

                <button
                  onClick={handleSubmitApplication}
                  disabled={formLoading}
                  className="w-full rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-500 font-bold py-3 text-sm disabled:opacity-50 hover:bg-yellow-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Enviar solicitud
                </button>
              </div>
            )}

            {!isApprovedCreator && creatorApplication && creatorApplication.status !== 'rejected' && (
              <div className="rounded-2xl bg-card border border-border p-5 text-center">
                <p className="text-sm text-muted-foreground">Tu solicitud esta siendo revisada.</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <StatusBadge status={creatorApplication.status} />
                  <span className="font-black">{creatorApplication.requestedCode}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RANKING section */}
        {section === 'ranking' && (
          <div className="space-y-3">
            <h2 className="font-black text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Top Creadores del Mes
            </h2>
            {creatorRanking.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aun no hay creadores calificados este mes.</p>
            ) : (
              <div className="space-y-2">
                {creatorRanking.map((c, i) => (
                  <div key={c.code} className={`flex items-center gap-3 rounded-xl border p-3 ${
                    i === 0 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-card border-border'
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                      i === 0 ? 'bg-yellow-500/30 text-yellow-500' :
                      i === 1 ? 'bg-gray-400/20 text-gray-300' :
                      i === 2 ? 'bg-orange-700/30 text-orange-400' :
                      'bg-muted/30 text-muted-foreground'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{c.channelName}</p>
                      <p className="text-xs text-muted-foreground">{c.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm">{c.qualified}</p>
                      <p className="text-xs text-muted-foreground">calificados</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'bg-muted/30 border border-border text-muted-foreground'
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    approved: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
    suspended: 'bg-orange-700/20 text-orange-400',
  };
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    suspended: 'Suspendido',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${styles[status] ?? styles.pending}`}>
      {labels[status] ?? status}
    </span>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card border border-border p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <p className="text-xs">{label}</p>
      </div>
      <p className="text-xl font-black">{value}</p>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-muted-foreground mb-1 block">{label}</label>
      {children}
    </div>
  );
}
