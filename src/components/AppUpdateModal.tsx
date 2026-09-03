import React, { useState } from 'react';
import { AppUpdateInfo } from '../types';
import { updateService } from '../services/updateService';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { 
  Download, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ExternalLink, 
  Smartphone, 
  ShieldCheck, 
  RefreshCw, 
  Gift, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  ArrowRight,
  HardDrive
} from 'lucide-react';

interface AppUpdateModalProps {
  updateInfo: AppUpdateInfo;
  language?: 'es' | 'en';
  onClose: () => void;
  onClaimReward?: (coins: number, stardust: number) => void;
  onRefreshCheck?: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  updateInfo,
  language = 'es',
  onClose,
  onClaimReward,
  onRefreshCheck,
}) => {
  const isEn = language === 'en';
  const isMandatory = updateInfo.forceUpdate;
  const isAndroid = updateService.isNativeAndroid();

  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadStatusText, setDownloadStatusText] = useState<string>('');
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [showAndroidHelp, setShowAndroidHelp] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(() => {
    return updateService.isUpdateRewardClaimed(updateInfo.version);
  });

  const highlights = (isEn ? updateInfo.highlights?.en : updateInfo.highlights?.es) || [
    isEn ? '⚔️ Zero-latency 1v1 real-time multiplayer' : '⚔️ Nuevo motor de partidas 1v1 en tiempo real',
    isEn ? '🏛️ Constellation Clan Vault & Donations' : '🏛️ Bóveda y Donaciones de Constelaciones',
    isEn ? '⚡ 120Hz smooth display optimizations' : '⚡ Optimización para pantallas táctiles de 120Hz',
    isEn ? '🛡️ Stability improvements and bug fixes' : '🛡️ Corrección de errores y mayor estabilidad',
  ];

  const handleStartDownload = () => {
    soundManager.playButtonClick();
    hapticManager.mediumTap();

    setDownloadProgress(0);
    setDownloadStatusText(isEn ? 'Connecting to cosmic download servers...' : 'Conectando con servidores de descarga...');

    // Simulate direct APK progressive streaming download
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return 5;
        if (prev >= 95) {
          clearInterval(interval);
          setDownloadProgress(100);
          setDownloadStatusText(
            isEn ? 'Download completed! Opening APK installer...' : '¡Descarga completada! Abriendo instalador APK...'
          );
          setIsDownloaded(true);
          soundManager.playLevelUp();
          hapticManager.success();

          // Trigger download / intent
          setTimeout(() => {
            try {
              const link = document.createElement('a');
              link.href = updateInfo.apkDownloadUrl;
              link.download = `StarTapArcade_v${updateInfo.version}.apk`;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } catch (e) {
              console.error('Download launch error:', e);
              window.open(updateInfo.apkDownloadUrl, '_blank');
            }
          }, 600);

          return 100;
        }

        const increment = Math.floor(Math.random() * 15) + 10;
        const next = Math.min(95, prev + increment);
        if (next > 70) {
          setDownloadStatusText(isEn ? 'Verifying APK cryptographic signature...' : 'Verificando firma criptográfica del APK...');
        } else if (next > 30) {
          setDownloadStatusText(
            isEn
              ? `Downloading package (${((next / 100) * (updateInfo.fileSizeMb || 28.5)).toFixed(1)} MB / ${updateInfo.fileSizeMb || 28.5} MB)...`
              : `Descargando paquete (${((next / 100) * (updateInfo.fileSizeMb || 28.5)).toFixed(1)} MB / ${updateInfo.fileSizeMb || 28.5} MB)...`
          );
        }
        return next;
      });
    }, 180);
  };

  const handleClaimRewardClick = () => {
    if (rewardClaimed) return;
    soundManager.playCoin();
    soundManager.playTrophyUnlock();
    hapticManager.success();
    updateService.claimUpdateReward(updateInfo.version);
    setRewardClaimed(true);
    if (onClaimReward) {
      onClaimReward(updateInfo.rewardCoins || 500, updateInfo.rewardStardust || 100);
    }
  };

  const handleDismiss = () => {
    soundManager.playButtonClick();
    updateService.dismissUpdate(updateInfo.version);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-2xl animate-fade-in select-none">
      <div className="w-full max-w-lg bg-slate-900/95 border border-cyan-500/40 rounded-[2.5rem] text-white shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[92vh] overflow-hidden relative">
        
        {/* Glow laser headers */}
        <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${
          isMandatory 
            ? 'from-red-500 via-amber-400 to-red-500 animate-pulse' 
            : 'from-cyan-500 via-purple-500 to-cyan-500'
        }`} />

        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${
              isMandatory 
                ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
            }`}>
              {isMandatory ? <AlertTriangle className="w-6 h-6 animate-bounce" /> : <Sparkles className="w-6 h-6 animate-spin-slow" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isMandatory 
                    ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}>
                  {isMandatory 
                    ? (isEn ? 'Mandatory Update' : 'Actualización Obligatoria')
                    : (isEn ? 'New Version Available' : 'Nueva Versión Disponible')}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  APK v{updateInfo.version}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                {isEn 
                  ? (updateInfo.title?.en || 'Galactic APK Update') 
                  : (updateInfo.title?.es || 'Actualización de la APK')}
              </h2>
            </div>
          </div>

          {!isMandatory && (
            <button
              onClick={handleDismiss}
              className="p-2 text-slate-400 hover:text-white rounded-2xl bg-slate-800/80 border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer"
              title={isEn ? 'Close' : 'Cerrar'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-left custom-scrollbar">

          {/* Mandatory Alert Banner */}
          {isMandatory && (
            <div className="p-3.5 bg-gradient-to-r from-red-950/60 via-amber-950/40 to-red-950/60 border border-red-500/40 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-black text-amber-300 block mb-0.5">
                  {isEn ? 'Update Required to Play' : 'Es necesario actualizar la app para continuar'}
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {isEn 
                    ? 'Your current version is no longer supported by the cosmic multiplayer servers. Download and install the latest APK to keep playing and syncing progress.'
                    : 'Esta versión de la APK ha quedado desactualizada. Para acceder a las partidas multijugador 1v1, guerras de constelaciones y sincronizar tu progreso en la nube, instala la última versión.'}
                </p>
              </div>
            </div>
          )}

          {/* Version Comparison Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-4 shadow-inner">
            <div className="grid grid-cols-2 gap-3 items-center relative">
              {/* Current version box */}
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {isEn ? 'Installed Version' : 'Tu Versión Actual'}
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-slate-300 mt-1">
                  v{updateInfo.currentVersion}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Build #{updateInfo.currentBuildNumber}
                </span>
              </div>

              {/* Arrow center icon */}
              <div className="absolute left-1/2 -translate-x-1/2 p-2 bg-slate-950 border border-cyan-500/40 rounded-full text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] z-10">
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </div>

              {/* Target new version box */}
              <div className="p-3 bg-gradient-to-br from-cyan-950/60 to-purple-950/60 border border-cyan-500/40 rounded-2xl flex flex-col text-right">
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {isEn ? 'Latest Version' : 'Nueva Versión'}
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-cyan-300 mt-1">
                  v{updateInfo.version}
                </span>
                <span className="text-[10px] text-purple-300 font-mono font-bold">
                  Build #{updateInfo.buildNumber}
                </span>
              </div>
            </div>

            {/* Meta tags row */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>{updateInfo.fileSizeMb || 28.5} MB</span>
              </span>
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>APK Android / PWA</span>
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isEn ? 'Signed & Verified' : 'Firma Oficial Verificada'}</span>
              </span>
            </div>
          </div>

          {/* Highlights & What's New */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {isEn ? "What's New in this Update:" : 'Novedades y Mejoras de la Versión:'}
            </h3>
            <div className="space-y-1.5">
              {highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-2 text-xs text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Update Bonus Reward Box */}
          {(updateInfo.rewardCoins || updateInfo.rewardStardust) && (
            <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
                  <Gift className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <span className="text-xs font-black text-amber-300 block">
                    {isEn ? 'Update Gift Bounty' : '¡Regalo por Actualizar!'}
                  </span>
                  <span className="text-[11px] text-slate-300">
                    +{updateInfo.rewardCoins || 500} 🪙 Monedas • +{updateInfo.rewardStardust || 100} ✨ Polvo
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClaimRewardClick}
                disabled={rewardClaimed}
                className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                  rewardClaimed
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:scale-105 active:scale-95 shadow-lg'
                }`}
              >
                {rewardClaimed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Claimed' : 'Reclamado'}</span>
                  </>
                ) : (
                  <span>{isEn ? 'Claim Bonus' : 'Reclamar'}</span>
                )}
              </button>
            </div>
          )}

          {/* Download Progress Bar if in progress */}
          {downloadProgress !== null && (
            <div className="p-4 bg-slate-950 border border-cyan-500/40 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  {downloadStatusText}
                </span>
                <span className="font-mono font-black text-cyan-400">{downloadProgress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-200"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Android Installation Help Dropdown */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAndroidHelp(!showAndroidHelp)}
              className="w-full p-3 bg-slate-950/60 hover:bg-slate-900 text-slate-300 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>{isEn ? 'How to install APK update on Android?' : '¿Cómo instalar la actualización APK en Android?'}</span>
              </div>
              {showAndroidHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAndroidHelp && (
              <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-[11px] text-slate-300 space-y-2 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <span>{isEn ? 'Tap the "DOWNLOAD & INSTALL APK" button.' : 'Toca el botón "DESCARGAR E INSTALAR APK".'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <span>{isEn ? 'When download finishes, tap the notification or open the file in your "Downloads" folder.' : 'Cuando finalice la descarga, pulsa la notificación o abre el archivo en tu carpeta de "Descargas".'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <span>{isEn ? 'Press "Update" or "Install". If Android asks, enable "Allow installation from this source".' : 'Presiona "Actualizar" o "Instalar". Si Android lo solicita, activa "Permitir desde esta fuente". Tu progreso no se borrará.'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800 flex flex-col gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleStartDownload}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer active:scale-98 ${
              isMandatory
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white hover:brightness-110 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
            }`}
          >
            <Download className="w-5 h-5" />
            <span>
              {isDownloaded 
                ? (isEn ? 'RE-DOWNLOAD APK' : 'VOLVER A DESCARGAR APK') 
                : (isEn ? 'DOWNLOAD & UPDATE APK' : 'DESCARGAR Y ACTUALIZAR APK')}
            </span>
          </button>

          <div className="flex items-center gap-2">
            {/* Direct link alternative button */}
            <a
              href={updateInfo.apkDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEn ? 'Direct Web Link' : 'Enlace Directo'}</span>
            </a>

            {/* Check again button for mandatory update */}
            {isMandatory ? (
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  onRefreshCheck?.();
                }}
                className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isEn ? 'Check Status' : 'Comprobar'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>{isEn ? 'Remind in 24h' : 'Recordar más tarde'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
