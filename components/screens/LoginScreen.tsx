'use client';

import { useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { Mail, Lock, Eye, EyeOff, Shield, FileText, X, Info, Zap, User, Calendar, Globe, CheckCircle2, UserPlus, LogIn } from 'lucide-react';

const COUNTRIES = ['Argentina', 'Bolivia', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador', 'Espana', 'Guatemala', 'Honduras', 'Mexico', 'Nicaragua', 'Panama', 'Paraguay', 'Peru', 'Puerto Rico', 'Republica Dominicana', 'Uruguay', 'Venezuela', 'Estados Unidos', 'Otro'];

export function LoginScreen() {
  const { setScreen, signIn, signUp } = useGame();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<'privacy' | 'terms' | 'forgot' | null>(null);

  // Sign-up fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptPolicy, setAcceptPolicy] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.includes('@') || email.length < 5) { setError('Ingresa un correo electronico valido.'); return; }
    if (password.length < 4) { setError('La contrasena debe tener al menos 4 caracteres.'); return; }
    setLoading(true);
    const result = await signIn(email, password);
    if (!result.ok) {
      setError(result.error || 'Error al iniciar sesion');
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError('');
    if (fullName.trim().length < 3) { setError('Ingresa tu nombre completo (minimo 3 caracteres).'); return; }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) { setError('Ingresa una edad valida.'); return; }
    if (!country) { setError('Selecciona tu pais.'); return; }
    if (!email.includes('@') || email.length < 5) { setError('Ingresa un correo electronico valido.'); return; }
    if (password.length < 6) { setError('La contrasena debe tener al menos 6 caracteres.'); return; }
    if (password !== confirmPassword) { setError('Las contrasenas no coinciden.'); return; }
    if (!acceptPolicy) { setError('Debes aceptar las Politicas de Privacidad y los Terminos de Servicio.'); return; }
    setLoading(true);
    const result = await signUp({ fullName: fullName.trim(), age: ageNum, country, email, password });
    if (!result.ok) {
      setError(result.error || 'Error al registrar');
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-8 bg-gradient-to-b from-background via-background to-secondary/20 overflow-y-auto no-scrollbar">
      <div className="w-full max-w-sm py-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 mb-3 shadow-lg shadow-cyan-500/20">
            <Zap className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{
            background: 'linear-gradient(90deg, #22d3ee, #34d399, #ef4444)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.5))',
          }}>GARRDASHPE</h1>
          <p className="text-white/40 text-sm mt-1">{mode === 'login' ? 'Inicia sesion para jugar' : 'Crea tu cuenta'}</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-5 p-1 rounded-xl bg-card border border-border">
          <button onClick={() => { setMode('login'); setError(''); }} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition-colors ${mode === 'login' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/40'}`}>
            <LogIn className="w-4 h-4" />Ingresar
          </button>
          <button onClick={() => { setMode('signup'); setError(''); }} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition-colors ${mode === 'signup' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40'}`}>
            <UserPlus className="w-4 h-4" />Registrarse
          </button>
        </div>

        {mode === 'login' ? (
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-xs font-medium mb-1 block">Correo electronico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-lg" autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs font-medium mb-1 block">Contrasena</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-3 rounded-xl bg-card border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-lg" autoComplete="current-password" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button onClick={handleLogin} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-cyan-500/20">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
            <button onClick={() => setModal('forgot')} className="w-full text-center text-cyan-400/70 text-xs hover:text-cyan-400">¿Olvidaste tu contrasena?</button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-white/60 text-xs font-medium mb-1 block">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-xs font-medium mb-1 block">Edad</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="18" min="1" max="120" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg" />
                </div>
              </div>
              <div>
                <label className="text-white/60 text-xs font-medium mb-1 block">Pais</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg appearance-none">
                    <option value="" className="bg-card">Seleccionar</option>
                    {COUNTRIES.map((c) => <option key={c} value={c} className="bg-card">{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs font-medium mb-1 block">Correo electronico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg" autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs font-medium mb-1 block">Contrasena (minimo 6 caracteres)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-card border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg" autoComplete="new-password" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs font-medium mb-1 block">Confirmar contrasena</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg" autoComplete="new-password" />
              </div>
            </div>
            <button onClick={() => setAcceptPolicy(!acceptPolicy)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border hover:bg-secondary/30 transition-colors">
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${acceptPolicy ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'}`}>
                {acceptPolicy && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <span className="text-white/60 text-xs leading-tight">Acepto las <button onClick={(e) => { e.stopPropagation(); setModal('privacy'); }} className="text-cyan-400 hover:underline">Politicas de Privacidad</button> y los <button onClick={(e) => { e.stopPropagation(); setModal('terms'); }} className="text-cyan-400 hover:underline">Terminos de Servicio</button></span>
            </button>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button onClick={handleSignUp} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-emerald-500/20">
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-center gap-4 text-xs">
            <button onClick={() => setModal('privacy')} className="flex items-center gap-1 text-white/40 hover:text-cyan-400"><FileText className="w-3 h-3" />Politicas de Privacidad</button>
            <span className="text-white/20">|</span>
            <button onClick={() => setModal('terms')} className="flex items-center gap-1 text-white/40 hover:text-cyan-400"><FileText className="w-3 h-3" />Terminos de Servicio</button>
          </div>
        </div>
      </div>

      {modal && <InfoModal type={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

function InfoModal({ type, onClose }: { type: 'privacy' | 'terms' | 'forgot'; onClose: () => void }) {
  const content = {
    privacy: { title: 'Politicas de Privacidad', icon: <Shield className="w-6 h-6 text-cyan-400" />, body: 'GARRDASHPE recopila los siguientes datos:\n\n• Correo electronico y contrasena para la autenticacion (Firebase Auth).\n• Nombre completo, edad y pais (perfil de usuario en Firestore).\n• Nickname y puntuaciones para el Ranking Global.\n• Progreso del juego (monedas, puntos, personajes) almacenado localmente.\n\nTus datos se almacenan de forma segura en Firebase (Google Cloud) y no se comparten con terceros. Puedes solicitar la eliminacion de tu cuenta en cualquier momento escribiendo a privacidad@garrdashpe.app.\n\nCumplimos con el RGPD y la LOPDGDD.' },
    terms: { title: 'Terminos de Servicio', icon: <FileText className="w-6 h-6 text-cyan-400" />, body: 'Al usar GARRDASHPE aceptas los siguientes terminos:\n\n1. El juego es gratuito pero contiene anuncios opcionales.\n2. Las compras VIP son permanentes y no reembolsables.\n3. El canje de diamantes es un servicio externo y los premios llegan en menos de 24 horas.\n4. Esta prohibido el uso de hacks, trampas o herramientas de automatizacion.\n5. El contenido generado por usuarios (sugerencias) puede ser utilizado para mejorar el juego.\n6. Nos reservamos el derecho de suspender cuentas que violen estos terminos.\n\nPara soporte: soporte@garrdashpe.com' },
    forgot: { title: 'Recuperar Contrasena', icon: <Info className="w-6 h-6 text-cyan-400" />, body: 'Para recuperar tu contrasena:\n\n1. Escribe tu correo electronico registrado.\n2. Te enviaremos un enlace de recuperacion.\n3. Sigue el enlace para crear una nueva contrasena.\n\nSi no recibes el correo en 5 minutos, revisa tu carpeta de spam o contacta a soporte@garrdashpe.com' },
  }[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-sm mx-4 max-h-[80vh] overflow-y-auto rounded-2xl bg-card border border-cyan-500/30 p-6 animate-scale-in no-scrollbar shadow-2xl shadow-cyan-500/20" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">{content.icon}<h2 className="text-white font-bold text-lg">{content.title}</h2></div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-white/70 text-sm whitespace-pre-line leading-relaxed">{content.body}</p>
        <button onClick={onClose} className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold text-sm hover:opacity-90 shadow-lg shadow-cyan-500/20">Entendido</button>
      </div>
    </div>
  );
}
