import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { PlayerState } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { signUpUser, signInUser, signOutUser, resetUserPassword } from '../firebase';
import { t } from '../i18n';
import { 
  User, 
  X, 
  Check, 
  Mail, 
  Lock, 
  UserPlus, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Loader2,
  Key
} from 'lucide-react';

interface AuthModalProps {
  currentUser: FirebaseUser | null;
  playerState: PlayerState;
  lang: 'es' | 'en';
  onClose: () => void;
  onAuthStateUpdated: (updatedState?: PlayerState) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  playerState,
  lang,
  onClose,
  onAuthStateUpdated
}) => {
  const isRegistered = currentUser && !currentUser.isAnonymous;
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(
    isRegistered ? 'login' : 'register'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pilotName, setPilotName] = useState(playerState.name || '');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'forgot') {
      if (!email || !email.includes('@')) {
        setErrorMessage(lang === 'es' ? 'Ingresa un correo electrónico válido' : 'Enter a valid email address');
        return;
      }
      setIsLoading(true);
      try {
        await resetUserPassword(email);
        soundManager.playPowerup();
        hapticManager.lightTap();
        setSuccessMessage(t('resetPasswordSent', lang));
      } catch (err: any) {
        let msg = err.message || (lang === 'es' ? 'Error al enviar correo' : 'Error sending email');
        if (err.code === 'auth/user-not-found') {
          msg = lang === 'es' ? 'No existe ninguna cuenta registrada con este correo' : 'No account found with this email address';
        } else if (err.code === 'auth/invalid-email') {
          msg = lang === 'es' ? 'El formato del correo es inválido' : 'Invalid email format';
        }
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!email || !password) {
      setErrorMessage(lang === 'es' ? 'Por favor completa todos los campos' : 'Please fill in all fields');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setErrorMessage(lang === 'es' ? 'La contraseña debe tener al menos 6 caracteres' : 'Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage(lang === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match');
        return;
      }

      setIsLoading(true);
      try {
        const { state: updatedState } = await signUpUser(email, password, pilotName, playerState);
        soundManager.playPowerup();
        hapticManager.heavyTap();
        setSuccessMessage(t('authSuccessRegister', lang));
        if (updatedState) {
          onAuthStateUpdated(updatedState);
        } else {
          onAuthStateUpdated();
        }
        setTimeout(() => onClose(), 1200);
      } catch (err: any) {
        let msg = err.message || 'Error al registrar';
        if (err.code === 'auth/email-already-in-use') {
          msg = lang === 'es' ? 'Este correo ya está registrado. Inicia sesión.' : 'This email is already registered. Please log in.';
        } else if (err.code === 'auth/invalid-email') {
          msg = lang === 'es' ? 'Formato de correo no válido' : 'Invalid email format';
        } else if (err.code === 'auth/weak-password') {
          msg = lang === 'es' ? 'Contraseña demasiado débil (mín. 6 caracteres)' : 'Password too weak (min. 6 chars)';
        } else if (err.code === 'auth/operation-not-allowed') {
          msg = lang === 'es'
            ? 'El inicio de sesión con Correo/Contraseña está desactivado en la consola de Firebase. Debes habilitar el proveedor "Email/Password" en Firebase Console -> Authentication -> Sign-in method.'
            : 'Email/Password sign-in is disabled in Firebase Console. Enable "Email/Password" under Authentication -> Sign-in method.';
        }
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    } else if (mode === 'login') {
      setIsLoading(true);
      try {
        const { state: cloudState } = await signInUser(email, password);
        soundManager.playPowerup();
        hapticManager.mediumTap();
        setSuccessMessage(t('authSuccessLogin', lang));
        if (cloudState) {
          onAuthStateUpdated(cloudState);
        } else {
          onAuthStateUpdated();
        }
        setTimeout(() => onClose(), 1200);
      } catch (err: any) {
        let msg = err.message || 'Error al iniciar sesión';
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          msg = lang === 'es' ? 'Correo o contraseña incorrectos' : 'Incorrect email or password';
        } else if (err.code === 'auth/operation-not-allowed') {
          msg = lang === 'es'
            ? 'El inicio de sesión con Correo/Contraseña está desactivado en la consola de Firebase. Debes habilitarlo en Firebase Console -> Authentication -> Sign-in method.'
            : 'Email/Password sign-in is disabled in Firebase Console. Enable "Email/Password" under Authentication -> Sign-in method.';
        }
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    soundManager.playButtonClick();
    hapticManager.lightTap();
    setIsLoading(true);
    try {
      await signOutUser();
      onAuthStateUpdated();
      onClose();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 rounded-2xl font-black shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-white tracking-tight">
                {t('accountTitle', lang)}
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {t('accountSubtitle', lang)}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If Already Registered & Logged In */}
        {isRegistered ? (
          <div className="space-y-4 py-2">
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  {t('registeredAccount', lang)}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {lang === 'es' ? 'VERIFICADA' : 'VERIFIED'}
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <div className="text-xs text-slate-400">{t('nameLabel', lang)}:</div>
                <div className="text-sm font-extrabold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  {currentUser?.displayName || playerState.name}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400">{t('emailLabel', lang)}:</div>
                <div className="text-sm font-extrabold text-amber-200 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  {currentUser?.email}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-300" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>{t('logoutBtn', lang)}</span>
            </button>
          </div>
        ) : (
          /* Form for Guest to Register / Log In */
          <div className="space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setMode('register');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md scale-102'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('registerBtn', lang)}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setMode('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md scale-102'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('loginBtn', lang)}</span>
              </button>
            </div>

            {/* Error or Success Alert */}
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3 text-amber-400" />
                    {t('nameLabel', lang)}
                  </label>
                  <input
                    type="text"
                    required
                    value={pilotName}
                    onChange={(e) => setPilotName(e.target.value)}
                    placeholder={t('placeholderName', lang)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Mail className="w-3 h-3 text-cyan-400" />
                  {t('emailLabel', lang)}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="piloto@ejemplo.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3 text-rose-400" />
                    {t('passwordLabel', lang)}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-rose-400 transition-colors"
                  />
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    {t('confirmPasswordLabel', lang)}
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
                  >
                    {t('forgotPassword', lang)}
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:brightness-110 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-yellow-200/50 uppercase tracking-wider"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : mode === 'register' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{t('registerBtn', lang)}</span>
                  </>
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{t('loginBtn', lang)}</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>{lang === 'es' ? 'RECUPERAR CONTRASEÑA' : 'RESET PASSWORD'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  if (mode === 'forgot') {
                    setMode('login');
                  } else {
                    setMode(mode === 'register' ? 'login' : 'register');
                  }
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                {mode === 'forgot'
                  ? (lang === 'es' ? '← Volver al inicio de sesión' : '← Back to log in')
                  : mode === 'register'
                  ? t('alreadyHaveAccount', lang)
                  : t('needAccount', lang)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
