import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  RotateCcw, 
  Check, 
  DollarSign, 
  Building, 
  Sliders, 
  MapPin, 
  HelpCircle,
  Sparkles,
  Camera,
  Upload,
  Database,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  ShieldCheck,
  Mail,
  Volume2,
  VolumeX
} from 'lucide-react';
import { PortalSettings } from '../types';
import { SQL_SCHEMA_INSTRUCTIONS } from '../supabaseSync';
import { playLoudReservationSound } from '../utils/audio';

interface SettingsViewProps {
  settings: PortalSettings;
  onUpdateSettings: (settings: PortalSettings) => void;
  onResetData: () => void;
  supabaseStatus: 'idle' | 'loading' | 'connected' | 'error' | 'not_configured';
  onSeedSupabase: () => Promise<{ success: boolean; error?: string }>;
  onLoadSupabase: () => Promise<void>;
  googleUser: any;
  onGoogleSignIn: () => Promise<void>;
  onGoogleSignOut: () => Promise<void>;
  isGoogleLoading: boolean;
}

export default function SettingsView({ 
  settings, 
  onUpdateSettings, 
  onResetData,
  supabaseStatus,
  onSeedSupabase,
  onLoadSupabase,
  googleUser,
  onGoogleSignIn,
  onGoogleSignOut,
  isGoogleLoading
}: SettingsViewProps) {
  const [adminName, setAdminName] = useState(settings.adminName);
  const [adminRole, setAdminRole] = useState(settings.adminRole);
  const [adminEmail, setAdminEmail] = useState(settings.adminEmail || 'daoudasamb290@gmail.com');
  const [commissionRate, setCommissionRate] = useState(settings.commissionRate);
  const [defaultCurrency, setDefaultCurrency] = useState(settings.defaultCurrency);
  const [adminAvatar, setAdminAvatar] = useState(settings.adminAvatar || '');
  const [autoSendEmail, setAutoSendEmail] = useState(settings.autoSendEmail ?? true);
  const [playReservationSound, setPlayReservationSound] = useState(settings.playReservationSound ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_INSTRUCTIONS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePushToSupabase = async () => {
    setSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);
    try {
      const res = await onSeedSupabase();
      if (res.success) {
        setSyncSuccess(true);
      } else {
        setSyncError(res.error || 'Erreur lors de la synchronisation.');
      }
    } catch (e: any) {
      setSyncError(e.message || 'Une erreur est survenue.');
    } finally {
      setSyncing(false);
    }
  };

  const handlePullFromSupabase = async () => {
    setSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);
    try {
      await onLoadSupabase();
      setSyncSuccess(true);
    } catch (e: any) {
      setSyncError(e.message || 'Une erreur est survenue lors du chargement.');
    } finally {
      setSyncing(false);
    }
  };

  // Sync with global settings when changed externally/restored
  useEffect(() => {
    setAdminName(settings.adminName);
    setAdminRole(settings.adminRole);
    setAdminEmail(settings.adminEmail || 'daoudasamb290@gmail.com');
    setCommissionRate(settings.commissionRate);
    setDefaultCurrency(settings.defaultCurrency);
    setAdminAvatar(settings.adminAvatar || '');
    setAutoSendEmail(settings.autoSendEmail ?? true);
    setPlayReservationSound(settings.playReservationSound ?? true);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      adminName,
      adminRole,
      adminEmail,
      commissionRate,
      defaultCurrency,
      adminAvatar,
      autoSendEmail,
      playReservationSound
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Le fichier est trop volumineux. La taille maximale autorisée est de 2 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAdminAvatar(base64String);
    };
    reader.readAsDataURL(file);
  };


  const triggerReset = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données de simulation ? Les modifications apportées (ajouts, paiements) seront perdues.')) {
      onResetData();
      alert('Toutes les données ont été réinitialisées aux valeurs initiales de démonstration.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-on-surface">Réglages du Portail</h1>
        <p className="text-xs text-on-surface-variant">Configurez les paramètres généraux de l&apos;application DEM Transport</p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-status-success-bg text-status-success-text rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <Check className="h-4 w-4" />
          <span>Paramètres enregistrés avec succès !</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Left Side: Category tabs list illustration */}
        <div className="md:col-span-1 space-y-2">
          <div className="bg-white rounded-xl border border-border-subtle p-3 shadow-sm space-y-1">
            <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-primary bg-secondary-container/50 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              <span>Général & Tarifs</span>
            </button>
            <button 
              type="button"
              onClick={triggerReset}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-status-danger-text hover:bg-status-danger-bg/20 flex items-center gap-2 transition-colors mt-2"
            >
              <RotateCcw className="h-4 w-4 text-status-danger-text" />
              <span>Réinitialiser les données</span>
            </button>
          </div>

          {/* Supabase Database Integration Hub */}
          <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-on-surface flex items-center gap-1.5">
              <Database className="h-4 w-4 text-primary" />
              <span>Base de données Supabase</span>
            </h4>

            {/* Status Badge */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Statut de la connexion</span>
              {supabaseStatus === 'connected' && (
                <div className="flex items-center gap-2 p-2 bg-status-success-bg/20 border border-status-success-bg/35 text-status-success-text rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-status-success-text animate-pulse" />
                  <span className="text-[11px] font-bold">Connecté & Actif</span>
                </div>
              )}
              {supabaseStatus === 'loading' && (
                <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 text-primary rounded-lg">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[11px] font-bold">Vérification de connexion...</span>
                </div>
              )}
              {supabaseStatus === 'error' && (
                <div className="flex flex-col gap-1 p-2 bg-status-danger-bg/20 border border-status-danger-bg/35 text-status-danger-text rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-status-danger-text shrink-0" />
                    <span className="text-[11px] font-bold">Tables manquantes / Erreur</span>
                  </div>
                  <p className="text-[9px] text-on-surface-variant mt-0.5 leading-normal">
                    Connecté, mais les tables sont absentes ou incorrectes. Exécutez le script SQL ci-dessous.
                  </p>
                </div>
              )}
              {supabaseStatus === 'not_configured' && (
                <div className="flex flex-col gap-1 p-2 bg-surface-container border border-border-subtle text-on-surface rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-on-surface-variant" />
                    <span className="text-[11px] font-bold text-on-surface-variant">Mode Démo (Local)</span>
                  </div>
                  <p className="text-[9px] text-on-surface-variant mt-0.5 leading-normal">
                    L&apos;application stocke ses données dans votre navigateur. Configurez Supabase pour sauvegarder vos données réelles.
                  </p>
                </div>
              )}
            </div>

            {/* Sync Feedbacks */}
            {syncing && (
              <div className="p-2 bg-primary/5 text-primary text-[10px] font-semibold rounded-lg flex items-center gap-1.5 animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Synchronisation en cours...</span>
              </div>
            )}
            {syncSuccess && (
              <div className="p-2 bg-status-success-bg/10 text-status-success-text text-[10px] font-bold rounded-lg flex items-center gap-1.5 animate-fade-in">
                <Check className="h-3.5 w-3.5" />
                <span>Synchronisé avec succès !</span>
              </div>
            )}
            {syncError && (
              <div className="p-2 bg-status-danger-bg/10 text-status-danger-text text-[10px] font-bold rounded-lg flex flex-col gap-1">
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Échec de synchronisation</span>
                </span>
                <span className="text-[9px] text-on-surface-variant leading-normal">{syncError}</span>
              </div>
            )}

            {/* Action Buttons */}
            {supabaseStatus !== 'not_configured' ? (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Outils de synchronisation</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handlePushToSupabase}
                    disabled={syncing}
                    title="Envoyer les données actuelles de l'application vers Supabase"
                    className="flex flex-col items-center justify-center p-2 text-center bg-primary hover:bg-primary-hover text-white rounded-lg transition-all active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    <Upload className="h-4 w-4 mb-1" />
                    <span className="text-[9px] font-bold leading-tight">Sauver sur DB</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePullFromSupabase}
                    disabled={syncing}
                    title="Charger les données enregistrées dans votre base de données Supabase"
                    className="flex flex-col items-center justify-center p-2 text-center bg-surface-container border border-border-subtle hover:bg-surface-container-high text-on-surface rounded-lg transition-all active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    <RefreshCw className="h-4 w-4 mb-1" />
                    <span className="text-[9px] font-bold leading-tight">Charger de DB</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-1">
                <a 
                  href="https://supabase.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-3 bg-surface-container border border-border-subtle hover:bg-surface-container-high text-on-surface text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Créer un projet Supabase</span>
                  <ExternalLink className="h-3 w-3 text-on-surface-variant" />
                </a>
              </div>
            )}

            {/* SQL Copy Instructions */}
            <div className="border-t border-border-subtle pt-3 space-y-2">
              <button
                type="button"
                onClick={() => setShowSqlGuide(!showSqlGuide)}
                className="w-full flex items-center justify-between text-[10px] font-bold text-primary hover:underline uppercase tracking-wide text-left"
              >
                <span>{showSqlGuide ? 'Masquer le script SQL' : 'Voir le script SQL Supabase'}</span>
                <span className="text-[9px] text-on-surface-variant lowercase">({showSqlGuide ? 'fermer' : 'déplier'})</span>
              </button>

              {showSqlGuide && (
                <div className="space-y-2 mt-2 animate-fade-in">
                  <p className="text-[9px] text-on-surface-variant leading-relaxed">
                    Exécutez ce script SQL dans l&apos;onglet <strong>SQL Editor</strong> de votre projet Supabase pour créer la structure de tables correspondante :
                  </p>
                  <div className="relative">
                    <pre className="p-2 bg-surface-container-low text-[8px] font-mono text-on-surface-variant border border-border-subtle rounded-lg max-h-48 overflow-y-auto leading-relaxed select-all">
                      {SQL_SCHEMA_INSTRUCTIONS}
                    </pre>
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="absolute top-2 right-2 p-1.5 bg-white border border-border-subtle hover:bg-surface-container text-on-surface rounded-lg shadow-sm transition-all active:scale-90 flex items-center gap-1 text-[9px] font-bold"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 text-status-success-text stroke-[3]" />
                          <span className="text-status-success-text">Copié!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2 bg-primary/5 rounded-lg text-[9px] text-on-surface-variant flex gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong>Sécurité (RLS) :</strong> Ce script active des politiques RLS permissives facilitant la lecture/écriture publique en mode bac à sable.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gmail / Google API Connection Hub */}
          <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-on-surface flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-primary" />
              <span>Intégration Gmail & Alertes</span>
            </h4>

            {/* Status Badge */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Statut de la connexion</span>
              {googleUser ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 p-2 bg-status-success-bg/20 border border-status-success-bg/35 text-status-success-text rounded-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-status-success-text" />
                    <span className="text-[11px] font-bold">Gmail Connecté</span>
                  </div>
                  <span className="text-[9px] text-on-surface-variant font-mono truncate block max-w-full" title={googleUser.email}>
                    {googleUser.email}
                  </span>
                </div>
              ) : isGoogleLoading ? (
                <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 text-primary rounded-lg">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[11px] font-bold">Vérification...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-[11px] font-bold">Gmail non configuré</span>
                </div>
              )}
            </div>

            {/* Google Authentication Button */}
            <div className="pt-1">
              {googleUser ? (
                <button
                  type="button"
                  onClick={onGoogleSignOut}
                  disabled={isGoogleLoading}
                  className="w-full py-2 px-3 bg-surface-container border border-border-subtle hover:bg-surface-container-high text-on-surface text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Déconnecter mon Gmail
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-border-subtle hover:bg-surface-container text-on-surface text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4 shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>Connecter mon Gmail</span>
                </button>
              )}
            </div>
            
            <p className="text-[9px] text-on-surface-variant leading-relaxed">
              Une fois connecté, l&apos;application utilisera votre compte Gmail pour envoyer les notifications de réservation automatiquement.
            </p>
          </div>
        </div>


        {/* Right Side: Settings fields */}
        <div className="md:col-span-2 bg-white rounded-xl border border-border-subtle shadow-sm p-5 space-y-6">
          <form onSubmit={handleSave} className="space-y-4">
            
            <h3 className="font-bold text-sm text-on-surface border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" />
              <span>Profil de l&apos;administrateur</span>
            </h3>

            {/* Profile Photo Editor */}
            <div id="admin-photo-editor" className="space-y-3 pb-4 border-b border-border-subtle">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Photo de profil</label>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Current Avatar Circle */}
                <div className="relative group shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-inner bg-surface-container">
                  <img 
                    src={adminAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                    alt="Admin Avatar" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <label htmlFor="avatar-file-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-4 w-4 text-white" />
                  </label>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* File Upload Button */}
                    <label 
                      htmlFor="avatar-file-upload" 
                      className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-border-subtle hover:bg-surface-container-high rounded-lg text-xs font-bold transition-all active:scale-95"
                    >
                      <Upload className="h-3.5 w-3.5 text-on-surface-variant" />
                      <span>Importer une photo</span>
                    </label>
                    <input 
                      id="avatar-file-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />

                    {/* Reset to default */}
                    {adminAvatar && (
                      <button
                        type="button"
                        onClick={() => setAdminAvatar('')}
                        className="px-2.5 py-1.5 text-status-danger-text hover:bg-status-danger-bg/20 rounded-lg text-xs font-semibold transition-all active:scale-95"
                      >
                        Retirer la photo
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-on-surface-variant leading-normal">
                    Format recommandé: JPG, PNG ou WebP. Taille max: 2 Mo. Vous pouvez aussi choisir une suggestion ci-dessous ou entrer un lien d&apos;image.
                  </p>
                </div>
              </div>

              {/* Suggestions Grid */}
              <div className="pt-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Suggestions rapides</p>
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", // Female 1
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", // Female 2
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", // Male 1
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", // Male 2
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80", // Male 3
                  ].map((url, i) => {
                    const isSelected = adminAvatar === url || (!adminAvatar && i === 0);
                    return (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setAdminAvatar(url)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all relative shrink-0 ${
                          isSelected ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-transparent hover:scale-105'
                        }`}
                      >
                        <img src={url} alt={`Preset ${i+1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white drop-shadow-md stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* URL Input */}
              <div className="pt-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Ou par lien d&apos;image</label>
                <input
                  type="text"
                  placeholder="https://example.com/ma-photo.jpg"
                  value={adminAvatar.startsWith('data:') ? '' : adminAvatar}
                  onChange={(e) => setAdminAvatar(e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Nom de l&apos;administrateur</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Rôle / Titre</label>
                <input
                  type="text"
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Adresse Email de Connexion</label>
              <input
                type="email"
                placeholder="nom@exemple.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
              />
            </div>

            <h3 className="font-bold text-sm text-on-surface border-b border-border-subtle pb-2 pt-4 flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-primary" />
              <span>Frais d&apos;agence & Commissions</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Taux de commission (%)</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">%</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full pl-3 pr-8 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Devise par défaut</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                >
                  <option value="FCFA">FCFA (Franc CFA)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="USD">USD ($ - Dollar)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Zones d&apos;activité principale</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Dakar', 'Saint-Louis', 'Thiès', 'Touba', 'Tivaouane', 'AIBD'].map((zone) => (
                  <span key={zone} className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] font-bold flex items-center gap-1 select-none">
                    <MapPin className="h-3 w-3" />
                    <span>{zone}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-border-subtle">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Notifications Automatiques</label>
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoSendEmail}
                  onChange={(e) => setAutoSendEmail(e.target.checked)}
                  className="mt-0.5 rounded border-border-subtle text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface leading-tight">
                    Envoyer automatiquement les confirmations par Email
                  </span>
                  <span className="text-[10px] text-on-surface-variant mt-0.5 leading-normal">
                    Lorsque cette option est activée et que votre Gmail est connecté, l&apos;application enverra automatiquement un e-mail de notification complet à votre adresse et aux clients pour chaque nouvelle réservation.
                  </span>
                </div>
              </label>

              <div className="pt-3 border-t border-dashed border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-start gap-2.5 cursor-pointer select-none flex-1">
                  <input
                    type="checkbox"
                    checked={playReservationSound}
                    onChange={(e) => setPlayReservationSound(e.target.checked)}
                    className="mt-0.5 rounded border-border-subtle text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-on-surface leading-tight flex items-center gap-1.5">
                      {playReservationSound ? (
                        <Volume2 className="h-4 w-4 text-primary" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-on-surface-variant" />
                      )}
                      <span>Alerte sonore pour les nouvelles réservations</span>
                    </span>
                    <span className="text-[10px] text-on-surface-variant mt-0.5 leading-normal">
                      Émet un signal sonore puissant à chaque nouvelle réservation de client en direct.
                    </span>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={playLoudReservationSound}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-surface-container-high border border-border-subtle rounded-lg text-[11px] font-bold text-on-surface transition-all active:scale-95 shrink-0"
                >
                  <Volume2 className="h-3.5 w-3.5 text-primary" />
                  <span>Tester le son d&apos;alerte</span>
                </button>
              </div>
            </div>

            {/* Submit settings */}
            <div className="flex justify-end pt-4 border-t border-border-subtle">
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                Enregistrer les modifications
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
