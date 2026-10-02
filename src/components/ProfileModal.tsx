import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { PlayerState } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { getAvatarById } from '../data/avatars';
import { updateService, CURRENT_APP_VERSION, CURRENT_BUILD_NUMBER } from '../services/updateService';
import { showPrivacyOptionsForm } from '../services/admob';
import { AnimatedAvatar } from './AnimatedAvatar';
import { 
  User, 
  X, 
  Check, 
  Award, 
  Sparkles, 
  Shield, 
  Star, 
  Coins, 
  Cloud, 
  Globe, 
  Settings, 
  Vibrate, 
  Smartphone, 
  ShieldCheck, 
  UserPlus, 
  LogIn, 
  UserCheck, 
  Compass, 
  Bell, 
  BellRing, 
  Copy, 
  Users,
  ExternalLink,
  CheckCircle2,
  Download,
  Image as ImageIcon,
  Maximize2
} from 'lucide-react';
import { getMyPlayerCode } from '../services/friends';
import { t, Language } from '../i18n';
import googlePlayFeatureImg from '../assets/images/google_play_feature_1789761929266.jpg';
import googlePlayHomeImg from '../assets/images/google_play_home_1789761943195.jpg';

interface ProfileModalProps {
  playerState: PlayerState;
  currentUser?: FirebaseUser | null;
  onClose: () => void;
  onUpdateName: (newName: string) => void;
  onUpdateLanguage: (lang: Language) => void;
  onToggleHaptics: (enabled: boolean) => void;
  onToggleQuestReminders?: (enabled: boolean) => void;
  onOpenAuth?: () => void;
  onOpenEuConsent?: () => void;
  onOpenAvatarSelector?: () => void;
  onOpenFriends?: () => void;
  onOpenConstellations?: () => void;
  onReplayTutorial?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  playerState,
  currentUser,
  onClose,
  onUpdateName,
  onUpdateLanguage,
  onToggleHaptics,
  onToggleQuestReminders,
  onOpenAuth,
  onOpenEuConsent,
  onOpenAvatarSelector,
  onOpenFriends,
  onOpenConstellations,
  onReplayTutorial,
}) => {
  const [nameInput, setNameInput] = useState(playerState.name);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string; desc: string; filename: string } | null>(null);
  const lang = playerState.language || 'es';
  const hapticsEnabled = playerState.hapticsEnabled ?? true;
  const questRemindersEnabled = playerState.questRemindersEnabled ?? true;
  const isRegistered = currentUser && !currentUser.isAnonymous;
  const currentAvatar = getAvatarById(playerState.avatar);
  const myPlayerCode = getMyPlayerCode(currentUser?.uid);

  const getTitleByLevel = (lvl: number) => {
    if (lvl >= 15) return t('levelTitleCosmicLegend', lang);
    if (lvl >= 10) return t('levelTitleStarCommander', lang);
    if (lvl >= 5) return t('levelTitleStarHunter', lang);
    if (lvl >= 3) return t('levelTitleSpacePilot', lang);
    return t('levelTitleStarApprentice', lang);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== playerState.name) {
      soundManager.playButtonClick();
      onUpdateName(trimmed);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900/95 border border-amber-500/40 ring-1 ring-amber-400/20 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden relative">
        {/* Holographic Top Laser Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 animate-shimmer z-30" />

        {/* AAA Corner Telemetry Brackets */}
        <div className="aaa-hud-corner-tl text-amber-400/80 pointer-events-none" />
        <div className="aaa-hud-corner-tr text-amber-400/80 pointer-events-none" />
        <div className="aaa-hud-corner-bl text-cyan-400/80 pointer-events-none" />
        <div className="aaa-hud-corner-br text-cyan-400/80 pointer-events-none" />

        {/* Header Bento Tile */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500/20 to-yellow-400/20 text-amber-400 rounded-2xl border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                {t('profileTitle', lang)}
              </h3>
              <span className="text-xs text-slate-400 font-medium">{t('profileSubtitle', lang)}</span>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-2 bg-slate-800/90 hover:bg-slate-700/90 rounded-2xl text-slate-400 hover:text-white border border-slate-700/80 transition-all active:scale-95 cursor-pointer shadow"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-left">
          {/* Main Hero Profile Card */}
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between gap-3 relative overflow-hidden shadow-md">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                onClick={() => {
                  if (onOpenAvatarSelector) {
                    soundManager.playButtonClick();
                    onOpenAvatarSelector();
                  }
                }}
                className="relative flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-105 transition-transform group"
                title={t('changeAvatarBtn', lang)}
              >
                <AnimatedAvatar avatarItem={currentAvatar} size="lg" showBadge={false} />
                <span className="absolute -bottom-1 -right-1 bg-slate-950 text-amber-300 font-black text-[10px] px-1.5 py-0.2 rounded-full border border-amber-400 shadow z-20">
                  L{playerState.level}
                </span>
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-white tracking-wide truncate">{playerState.name}</span>
                  {currentAvatar.isAnimated && (
                    <span className="text-[9px] bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-black px-1.5 py-0.2 rounded-md uppercase">
                      ✨
                    </span>
                  )}
                </div>
                <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 w-fit mt-0.5">
                  {currentAvatar.name[lang]} • {getTitleByLevel(playerState.level)}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 font-medium">
                  {t('dailyStreak', lang)}: 🔥 {playerState.dailyStreak} {t('days', lang)}
                </span>
              </div>
            </div>

            {onOpenAvatarSelector && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  onOpenAvatarSelector();
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl font-black text-xs transition-all active:scale-95 flex flex-col items-center gap-0.5 shrink-0 shadow cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span className="text-[10px] uppercase font-mono">{t('changeAvatarBtn', lang)}</span>
              </button>
            )}
          </div>

          {/* Cosmic Clan / Constellation Card */}
          {onOpenConstellations && (
            <div className="bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-slate-950 p-3.5 rounded-2xl border border-purple-500/30 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-cyan-300 border border-purple-400/30">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                    {lang === 'es' ? 'Gremio Cósmico' : 'Cosmic Clan'}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30 font-bold">
                      {playerState.constellationId ? '⚔️ MIEMBRO' : 'LIBRE'}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {playerState.constellationId 
                      ? (lang === 'es' ? 'Aporta puntos en batallas y guerras estelares' : 'Contribute points in clan wars & weekly chests') 
                      : (lang === 'es' ? 'Únete a una constelación para ganar recompensas' : 'Join a constellation to earn weekly team perks')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  onClose();
                  onOpenConstellations();
                }}
                className="px-3 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-white font-black text-xs rounded-xl shadow border border-cyan-300/40 flex items-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{playerState.constellationId ? (lang === 'es' ? 'VER CLAN' : 'MY CLAN') : (lang === 'es' ? 'UNIRSE' : 'JOIN')}</span>
              </button>
            </div>
          )}
          {onOpenAuth && (
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/30 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${
                  isRegistered 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white">
                    {isRegistered ? t('registeredAccount', lang) : t('guestMode', lang)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {isRegistered ? currentUser.email : (lang === 'es' ? 'Crea tu cuenta para no perder progreso' : 'Register account to save progress')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  onOpenAuth();
                }}
                className="px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow border border-yellow-200/50 flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
              >
                {isRegistered ? (
                  <>
                    <User className="w-3.5 h-3.5" />
                    <span>{lang === 'es' ? 'CUENTA' : 'ACCOUNT'}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t('registerBtn', lang)}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Pilot Code & Friends Shortcut Card */}
          <div className="bg-gradient-to-r from-purple-950/40 via-slate-950 to-slate-900 p-3.5 rounded-2xl border border-purple-500/30 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {lang === 'es' ? 'Mi ID de Piloto' : 'My Pilot ID'}
                </span>
                <span className="text-xs font-mono font-black text-amber-300 tracking-wide select-all truncate">
                  {myPlayerCode}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  hapticManager.lightTap();
                  navigator.clipboard?.writeText(myPlayerCode);
                  setCopiedId(true);
                  setTimeout(() => setCopiedId(false), 2000);
                }}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{copiedId ? (lang === 'es' ? '¡Copiado!' : 'Copied!') : (lang === 'es' ? 'Copiar' : 'Copy')}</span>
              </button>

              {onOpenFriends && (
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onClose();
                    onOpenFriends();
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow border border-pink-400/40 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <Users className="w-3.5 h-3.5 text-pink-200" />
                  <span className="text-[10px]">{lang === 'es' ? 'AMIGOS' : 'FRIENDS'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Settings Section Header with Gear Icon (Engranaje) */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 shadow-md relative overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
              <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Settings className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                {t('settingsTitle', lang)}
              </h4>
            </div>

            {/* Language Selector Sub-Tile */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  {t('languageLabel', lang)}
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onUpdateLanguage('es');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                    lang === 'es'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-yellow-200/60 shadow-lg scale-102'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{t('spanish', lang)}</span>
                  {lang === 'es' && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onUpdateLanguage('en');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                    lang === 'en'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-yellow-200/60 shadow-lg scale-102'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{t('english', lang)}</span>
                  {lang === 'en' && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* In-Game Vibration Toggle Sub-Tile */}
            <div className="space-y-2 pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Vibrate className="w-3.5 h-3.5 text-emerald-400" />
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                    {t('vibrationLabel', lang)}
                  </label>
                </div>

                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  hapticsEnabled 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}>
                  {hapticsEnabled ? t('vibrationOn', lang) : t('vibrationOff', lang)}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 font-medium">
                {t('vibrationDesc', lang)}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onToggleHaptics(true);
                    hapticManager.lightTap();
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                    hapticsEnabled
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 border-emerald-300/60 shadow-lg scale-102'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{t('vibrationOn', lang)}</span>
                  {hapticsEnabled && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onToggleHaptics(false);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                    !hapticsEnabled
                      ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-slate-200 border-slate-600 shadow-md scale-102'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{t('vibrationOff', lang)}</span>
                  {!hapticsEnabled && <Check className="w-3.5 h-3.5 text-slate-300 stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* Daily Quests Push Reminders Sub-Tile */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BellRing className="w-3.5 h-3.5 text-amber-400" />
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                    {t('questRemindersLabel', lang)}
                  </label>
                </div>

                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    questRemindersEnabled
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {questRemindersEnabled ? t('questRemindersOn', lang) : t('questRemindersOff', lang)}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 font-medium">
                {t('questRemindersDesc', lang)}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onToggleQuestReminders?.(true);
                    if (hapticsEnabled) hapticManager.lightTap();
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                    questRemindersEnabled
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-yellow-200/60 shadow-lg scale-102'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{t('questRemindersOn', lang)}</span>
                  {questRemindersEnabled && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onToggleQuestReminders?.(false);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                    !questRemindersEnabled
                      ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-slate-200 border-slate-600 shadow-md scale-102'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{t('questRemindersOff', lang)}</span>
                  {!questRemindersEnabled && <Check className="w-3.5 h-3.5 text-slate-300 stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* EU Privacy Regulations Button */}
            {onOpenEuConsent && (
              <div className="pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={async () => {
                    soundManager.playButtonClick();
                    const res = await showPrivacyOptionsForm();
                    if (!res.success) {
                      onOpenEuConsent();
                    }
                  }}
                  className="w-full py-2.5 px-3 bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/30 rounded-xl text-xs font-black text-blue-300 flex items-center justify-between transition-all active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>{lang === 'es' ? 'Privacidad y RGPD (Normativa UE)' : 'EU Privacy & GDPR Settings'}</span>
                  </div>
                  <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30 font-bold">
                    {lang === 'es' ? 'Configurar' : 'Manage'}
                  </span>
                </button>
              </div>
            )}

            {/* Replay Tutorial Button */}
            {onReplayTutorial && (
              <div className="pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    onClose();
                    onReplayTutorial();
                  }}
                  className="w-full py-2.5 px-3 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/30 rounded-xl text-xs font-black text-amber-300 flex items-center justify-between transition-all active:scale-98 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>{t('tutorialReplayBtn', lang)}</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold">
                    🚀 {lang === 'es' ? 'Iniciar' : 'Start'}
                  </span>
                </button>
              </div>
            )}

            {/* App Version & Google Play Store Official Distribution */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                    {t('appUpdatesTitle', lang)}
                  </label>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-950 px-2.5 py-0.5 rounded-full border border-emerald-500/40 text-emerald-300">
                  v{CURRENT_APP_VERSION} (b{CURRENT_BUILD_NUMBER})
                </span>
              </div>

              {/* Status Info Box */}
              <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    {t('distributionChannelLabel', lang)}
                  </span>
                  <span className="text-emerald-300 font-black flex items-center gap-1.5 text-[11px] bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/40 shadow-sm">
                    <span>▶️ {t('distributionChannelValue', lang)}</span>
                  </span>
                </div>

                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-left space-y-0.5">
                    <span className="text-xs font-black text-emerald-300 block">
                      {t('playStoreAutoUpdates', lang)}
                    </span>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed">
                      {t('playStoreAutoUpdatesDesc', lang)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    hapticManager.lightTap();
                    updateService.openGooglePlayStore();
                  }}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:brightness-110 border border-emerald-400/40 rounded-xl text-xs font-black text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t('viewOnPlayStoreBtn', lang)}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Official Google Play Store Graphic Assets */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-sm shadow">
                  🖼️
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>{lang === 'en' ? 'Google Play Store Assets' : 'Recursos para Google Play'}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      PRO 4K
                    </span>
                  </h3>
                  <p className="text-[10.5px] text-slate-400 font-medium">
                    {lang === 'en' 
                      ? 'HD graphics ready to upload to Google Play Console'
                      : 'Imágenes profesionales listas para subir a Google Play Console'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {/* Asset 1: Gráfico de Funciones (Feature Graphic) 16:9 */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <span>⭐</span>
                    <span>{lang === 'en' ? 'Feature Graphic (Header Banner)' : 'Gráfico de Funciones (Portada)'}</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-amber-950/70 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full">
                    1024 × 500 px • 16:9
                  </span>
                </div>

                {/* Banner Thumbnail with specular glow */}
                <div 
                  onClick={() => setPreviewImage({
                    src: googlePlayFeatureImg,
                    title: lang === 'en' ? 'Google Play Feature Graphic (1024x500)' : 'Gráfico de Funciones Google Play (1024x500)',
                    desc: lang === 'en' ? 'Official 16:9 header banner for Google Play Store listing with 3D logo & cosmic stars.' : 'Portada destacada obligatoria de Google Play Store con logo 3D y estrellas cósmicas.',
                    filename: 'star_tap_arcade_google_play_feature_graphic.jpg'
                  })}
                  className="group relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-slate-700 cursor-pointer shadow-md hover:border-amber-400/80 transition-all"
                >
                  <img 
                    src={googlePlayFeatureImg} 
                    alt="Star Tap Arcade Google Play Feature Graphic" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 flex items-center justify-center transition-colors">
                    <span className="opacity-0 group-hover:opacity-100 bg-slate-950/90 border border-white/30 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>{lang === 'en' ? 'Expand View' : 'Ver en Grande'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewImage({
                      src: googlePlayFeatureImg,
                      title: lang === 'en' ? 'Google Play Feature Graphic (1024x500)' : 'Gráfico de Funciones Google Play (1024x500)',
                      desc: lang === 'en' ? 'Official 16:9 header banner for Google Play Store listing with 3D logo & cosmic stars.' : 'Portada destacada obligatoria de Google Play Store con logo 3D y estrellas cósmicas.',
                      filename: 'star_tap_arcade_google_play_feature_graphic.jpg'
                    })}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[11px] font-black text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>{lang === 'en' ? 'View Fullscreen' : 'Ver Pantalla Completa'}</span>
                  </button>

                  <a
                    href={googlePlayFeatureImg}
                    download="star_tap_arcade_google_play_feature_graphic.jpg"
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 text-center"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Download (16:9)' : 'Descargar (16:9)'}</span>
                  </a>
                </div>
              </div>

              {/* Asset 2: Captura Vertical de la Home (9:16) */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                    <span>📱</span>
                    <span>{lang === 'en' ? 'Home Interface Screenshot' : 'Captura Vertical de la Home'}</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-full">
                    1080 × 1920 px • 9:16
                  </span>
                </div>

                <div 
                  onClick={() => setPreviewImage({
                    src: googlePlayHomeImg,
                    title: lang === 'en' ? 'Google Play Home Screenshot (9:16)' : 'Captura de Home para Google Play (9:16)',
                    desc: lang === 'en' ? 'Vertical mobile gameplay & menu showcase for Google Play phone screenshots.' : 'Captura vertical de alta fidelidad para el carrusel de capturas de móvil en Google Play.',
                    filename: 'star_tap_arcade_home_screenshot_9x16.jpg'
                  })}
                  className="group relative w-full h-48 rounded-xl overflow-hidden border border-slate-700 cursor-pointer shadow-md hover:border-cyan-400/80 transition-all flex items-center justify-center bg-slate-950"
                >
                  <img 
                    src={googlePlayHomeImg} 
                    alt="Star Tap Arcade Google Play Home Screenshot" 
                    referrerPolicy="no-referrer"
                    className="h-full w-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 flex items-center justify-center transition-colors">
                    <span className="opacity-0 group-hover:opacity-100 bg-slate-950/90 border border-white/30 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />
                      <span>{lang === 'en' ? 'Expand View' : 'Ver en Grande'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewImage({
                      src: googlePlayHomeImg,
                      title: lang === 'en' ? 'Google Play Home Screenshot (9:16)' : 'Captura de Home para Google Play (9:16)',
                      desc: lang === 'en' ? 'Vertical mobile gameplay & menu showcase for Google Play phone screenshots.' : 'Captura vertical de alta fidelidad para el carrusel de capturas de móvil en Google Play.',
                      filename: 'star_tap_arcade_home_screenshot_9x16.jpg'
                    })}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[11px] font-black text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />
                    <span>{lang === 'en' ? 'View Fullscreen' : 'Ver Pantalla Completa'}</span>
                  </button>

                  <a
                    href={googlePlayHomeImg}
                    download="star_tap_arcade_home_screenshot_9x16.jpg"
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-slate-950 font-black text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 text-center"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Download (9:16)' : 'Descargar (9:16)'}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Firebase Cloud Sync Status */}
          <div className="flex items-center justify-between bg-sky-950/40 border border-sky-500/30 px-3.5 py-2 rounded-xl text-xs text-sky-300 font-semibold">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-sky-400 animate-pulse" />
              <span>{t('cloudSync', lang)}</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
              {t('cloudActive', lang)}
            </span>
          </div>

          {/* Form: Change Username */}
          <form onSubmit={handleSave} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              {t('playerNameLabel', lang)}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={18}
                placeholder={t('placeholderName', lang)}
                className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all"
              />
              <button
                type="submit"
                disabled={!nameInput.trim() || nameInput.trim() === playerState.name}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
                  nameInput.trim() && nameInput.trim() !== playerState.name
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:scale-105 active:scale-95 shadow-md'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                }`}
              >
                {isSaved ? <Check className="w-4 h-4 text-emerald-950" /> : t('save', lang)}
              </button>
            </div>
            {isSaved && (
              <p className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
                <Check className="w-3.5 h-3.5" /> {t('savedNameSuccess', lang)}
              </p>
            )}
          </form>

          {/* Player Summary Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> {t('coins', lang)}
              </span>
              <span className="text-xl font-black text-amber-400 mt-1">
                {playerState.coins.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-300" /> {t('starsTapped', lang)}
              </span>
              <span className="text-xl font-black text-yellow-300 mt-1">
                {playerState.stats.totalStarsTapped.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-cyan-400" /> {t('maxRecord', lang)}
              </span>
              <span className="text-xl font-black text-cyan-400 mt-1">
                {playerState.stats.highestScore.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> {t('gamesPlayed', lang)}
              </span>
              <span className="text-xl font-black text-emerald-400 mt-1">
                {playerState.stats.gamesPlayed}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Image Preview Modal for Google Play Assets */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-2xl animate-fade-in select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center bg-slate-900 border-2 border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="text-left">
                <h4 className="text-sm sm:text-base font-black text-white">{previewImage.title}</h4>
                <p className="text-xs text-slate-400 font-medium">{previewImage.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-Res Image Display */}
            <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 p-2">
              <img 
                src={previewImage.src} 
                alt={previewImage.title} 
                referrerPolicy="no-referrer"
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Actions */}
            <div className="w-full flex items-center justify-between gap-3 pt-4 mt-2">
              <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                {previewImage.filename}
              </span>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  {lang === 'en' ? 'Close' : 'Cerrar'}
                </button>
                <a
                  href={previewImage.src}
                  download={previewImage.filename}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Download Image' : 'Descargar Imagen'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

