import React, { useState } from 'react';
import { ShieldCheck, Globe, Check, X, Lock, Sliders, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { soundManager } from '../services/sound';
import { Language, t } from '../i18n';

interface EuConsentModalProps {
  lang?: Language;
  onClose: () => void;
  onSaveConsent?: (consent: { essential: boolean; ads: boolean; analytics: boolean }) => void;
}

export const EuConsentModal: React.FC<EuConsentModalProps> = ({
  lang = 'es',
  onClose,
  onSaveConsent,
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [adsConsent, setAdsConsent] = useState<boolean>(true);
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(true);

  const handleAcceptAll = () => {
    soundManager.playButtonClick();
    const consent = { essential: true, ads: true, analytics: true, date: new Date().toISOString() };
    localStorage.setItem('eu_gdpr_consent', JSON.stringify(consent));
    localStorage.setItem('eu_gdpr_consent_accepted', 'true');
    if (onSaveConsent) onSaveConsent(consent);
    onClose();
  };

  const handleRejectOptional = () => {
    soundManager.playButtonClick();
    const consent = { essential: true, ads: false, analytics: false, date: new Date().toISOString() };
    localStorage.setItem('eu_gdpr_consent', JSON.stringify(consent));
    localStorage.setItem('eu_gdpr_consent_accepted', 'true');
    if (onSaveConsent) onSaveConsent(consent);
    onClose();
  };

  const handleSavePreferences = () => {
    soundManager.playButtonClick();
    const consent = { essential: true, ads: adsConsent, analytics: analyticsConsent, date: new Date().toISOString() };
    localStorage.setItem('eu_gdpr_consent', JSON.stringify(consent));
    localStorage.setItem('eu_gdpr_consent_accepted', 'true');
    if (onSaveConsent) onSaveConsent(consent);
    onClose();
  };

  const isEs = lang === 'es';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-2xl animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900 border border-blue-500/40 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col relative text-white">
        
        {/* Top EU Regulations Header */}
        <div className="w-full px-5 py-3.5 bg-gradient-to-r from-blue-950 via-slate-950 to-indigo-950 border-b border-blue-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/40 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                {isEs ? 'Aviso de Privacidad (Unión Europea)' : 'EU Data Privacy Compliance'}
              </span>
              <h3 className="text-base font-black text-white tracking-tight">
                {isEs ? 'Reglamento Europeo (RGPD)' : 'EU Regulations (GDPR)'}
              </h3>
            </div>
          </div>

          <span className="text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full">
            UE 2016/679
          </span>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-left">
          
          {/* Main Notice Banner */}
          <div className="bg-gradient-to-br from-blue-950/60 to-slate-950 border border-blue-500/30 p-4 rounded-2xl space-y-2 relative overflow-hidden shadow-inner">
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {isEs
                ? 'Conforme al Reglamento General de Protección de Datos (RGPD) y la directiva europea ePrivacy, solicitamos tu consentimiento para gestionar el almacenamiento local de tu progreso y configurar servicios de anuncios y métricas.'
                : 'In accordance with the General Data Protection Regulation (GDPR) and the EU ePrivacy Directive, we request your consent to manage local storage of your progress and configure ad and analytics services.'}
            </p>
          </div>

          {/* Toggle Details View Accordion */}
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              setShowDetails(!showDetails);
            }}
            className="w-full py-2.5 px-3.5 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs font-black text-blue-300 transition-all"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>{isEs ? 'Personalizar Preferencias de Privacidad' : 'Customize Privacy Preferences'}</span>
            </div>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Detailed Preferences Panel */}
          {showDetails && (
            <div className="space-y-3 pt-1 animate-fade-in">
              
              {/* Option 1: Essential / Technical Storage */}
              <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black text-white">
                      {isEs ? 'Almacenamiento Técnico Necesario' : 'Necessary Technical Storage'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    {isEs ? 'Siempre Activo' : 'Always Active'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {isEs
                    ? 'Indispensable para guardar tu puntuación, monedas, logros y progreso de juego de forma local.'
                    : 'Essential to save your high scores, coins, achievements, and game progress locally.'}
                </p>
              </div>

              {/* Option 2: Personalized Advertising */}
              <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black text-white">
                      {isEs ? 'Anuncios Personalizados (AdMob / Google)' : 'Personalized Ads (AdMob / Google)'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={adsConsent}
                    onChange={(e) => setAdsConsent(e.target.checked)}
                    className="w-4 h-4 accent-blue-500 cursor-pointer rounded"
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {isEs
                    ? 'Permite mostrar anuncios adaptados a tus intereses según los socios publicitarios autorizados de la UE.'
                    : 'Allows showing ads relevant to your interests through authorized EU advertising partners.'}
                </p>
              </div>

              {/* Option 3: Analytics & Gameplay Performance */}
              <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black text-white">
                      {isEs ? 'Métricas de Rendimiento y Errores' : 'Performance & Error Analytics'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={analyticsConsent}
                    onChange={(e) => setAnalyticsConsent(e.target.checked)}
                    className="w-4 h-4 accent-blue-500 cursor-pointer rounded"
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {isEs
                    ? 'Recopila estadísticas anónimas de juego para optimizar la velocidad y corregir fallos.'
                    : 'Collects anonymous game statistics to optimize speed and fix crashes.'}
                </p>
              </div>

            </div>
          )}

          <div className="text-[10px] text-slate-500 font-medium text-center pt-1">
            {isEs
              ? 'Puedes modificar tu configuración en cualquier momento desde los Ajustes del Perfil.'
              : 'You can modify your settings anytime from Profile Settings.'}
          </div>

        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 space-y-2">
          {showDetails ? (
            <button
              type="button"
              onClick={handleSavePreferences}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs rounded-xl shadow-lg border border-blue-300/40 transition-all active:scale-95 uppercase tracking-wide"
            >
              {isEs ? 'Guardar Selección' : 'Save Preferences'}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-600 hover:brightness-110 text-white font-black text-xs rounded-xl shadow-lg border border-blue-300/50 transition-all active:scale-95 flex items-center justify-center gap-1.5 uppercase tracking-wide"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isEs ? 'Aceptar Todo' : 'Accept All'}</span>
              </button>

              <button
                type="button"
                onClick={handleRejectOptional}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs rounded-xl border border-slate-700 transition-all active:scale-95 uppercase"
              >
                {isEs ? 'Rechazar Opcionales' : 'Reject Optional'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
