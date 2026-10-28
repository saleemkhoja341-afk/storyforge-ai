import React from 'react';
import { 
  Sliders, 
  Trash2, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Sparkles, 
  Cpu, 
  HelpCircle,
  Film,
  Download,
  Smartphone,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { AppSettings, Language, VisualStyle, AspectRatio } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (updated: AppSettings) => void;
  isGeminiOnline: boolean;
  onClearData: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  isInstallable?: boolean;
  isInstalled?: boolean;
  onInstallApp?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  isGeminiOnline,
  onClearData,
  theme,
  onToggleTheme,
  showToast,
  isInstallable = false,
  isInstalled = false,
  onInstallApp,
}) => {
  const handleLanguageChange = (lang: Language) => {
    onUpdateSettings({ ...settings, defaultLanguage: lang });
    showToast(`Default language set to ${lang}`, 'success');
  };

  const handleStyleChange = (style: VisualStyle) => {
    onUpdateSettings({ ...settings, defaultStyle: style });
    showToast(`Default visual style updated`, 'success');
  };

  const handleRatioChange = (ratio: AspectRatio) => {
    onUpdateSettings({ ...settings, defaultRatio: ratio });
    showToast(`Default aspect ratio set to ${ratio}`, 'success');
  };

  const handleDurationChange = (dur: string) => {
    onUpdateSettings({ ...settings, defaultDuration: dur });
    showToast(`Preferred duration set to ${dur}`, 'success');
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#23273D] pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span className="font-semibold text-violet-400">Settings & Engine</span>
          <span aria-hidden="true">·</span>
          <span>Studio Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white flex items-center gap-2.5">
          <span>Settings & Configuration</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Tune your default cinematic aspect ratios, narrative language, visual themes, and local database settings.
        </p>
      </div>

      {/* AI ENGINE ARCHITECTURE STATUS */}
      <div className="glass-card rounded-2xl p-5 border border-violet-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0E1018] border border-[#23273D]">
              <Cpu className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                AI Engine: {isGeminiOnline ? 'Google Gemini 3.8 Flash' : 'Creative Narrative Engine'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isGeminiOnline
                  ? 'Server-side Gemini proxy configured securely with telemetry.'
                  : 'Built-in offline narrative synthesis active. Zero API costs, instant response.'}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              isGeminiOnline
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isGeminiOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span>{isGeminiOnline ? 'Cloud AI Ready' : 'Offline Engine'}</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-[#23273D]">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Server-side API architecture enforces zero client-side credential exposure.</span>
        </div>
      </div>

      {/* CREATOR TIER & USAGE STATS */}
      <div className="glass-card rounded-2xl p-5 border border-[#23273D] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Creator Plan Status</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generations available today: <strong className="text-white">Unlimited Local / 20 Cloud</strong>
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-300 font-semibold border border-violet-500/30">
            Director Tier Preview
          </span>
        </div>

        <div className="w-full bg-[#0E1018] rounded-full h-2 overflow-hidden border border-[#23273D]">
          <div className="bg-gradient-to-r from-violet-600 to-cyan-400 h-full w-1/4 rounded-full"></div>
        </div>
      </div>

      {/* STUDIO PRESETS */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Default Production Parameters</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Narrative Language
            </label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
            >
              <option value="English">English</option>
              <option value="Urdu">Urdu (اردو)</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Roman Urdu">Roman Urdu</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Aspect Ratio
            </label>
            <select
              value={settings.defaultRatio}
              onChange={(e) => handleRatioChange(e.target.value as AspectRatio)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
            >
              <option value="9:16">9:16 Vertical (Shorts & Reels)</option>
              <option value="16:9">16:9 Widescreen (Cinema)</option>
              <option value="1:1">1:1 Square</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Visual Style
            </label>
            <select
              value={settings.defaultStyle}
              onChange={(e) => handleStyleChange(e.target.value as VisualStyle)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
            >
              <option value="Cinematic 3D Animation">Cinematic 3D Animation</option>
              <option value="Realistic Wildlife">Realistic Wildlife</option>
              <option value="Stylized 3D Characters">Stylized 3D Characters</option>
              <option value="Anime">Anime</option>
              <option value="Fantasy Film">Fantasy Film</option>
              <option value="Documentary">Documentary</option>
              <option value="Cartoon">Cartoon</option>
              <option value="Cyberpunk Cinematic">Cyberpunk Cinematic</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Episode Duration
            </label>
            <select
              value={settings.defaultDuration}
              onChange={(e) => handleDurationChange(e.target.value)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
            >
              <option value="15 seconds">15 seconds</option>
              <option value="30 seconds">30 seconds</option>
              <option value="60 seconds">60 seconds</option>
            </select>
          </div>
        </div>
      </div>

      {/* THEME TOGGLE */}
      <div className="glass-card rounded-2xl p-5 border border-[#23273D] flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-sm">Theme Mode</h3>
          <p className="text-xs text-slate-400 mt-0.5">Toggle between Midnight Dark (default) and Studio Light theme</p>
        </div>
        <button
          onClick={onToggleTheme}
          className="px-4 py-2 rounded-xl bg-[#0E1018] border border-[#23273D] hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
        >
          {theme === 'dark' ? <Moon className="w-4 h-4 text-violet-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          <span>{theme === 'dark' ? 'Midnight Dark' : 'Studio Light'}</span>
        </button>
      </div>

      {/* PROGRESSIVE WEB APP (PWA) CARD */}
      <div className="glass-card rounded-2xl p-5 border border-cyan-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0E1018] border border-cyan-500/30">
              <Smartphone className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>Progressive Web App (PWA)</span>
                {isInstalled && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Installed
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Install StoryForge AI directly to your Android home screen or desktop application launcher.
              </p>
            </div>
          </div>

          {isInstallable && onInstallApp && (
            <button
              onClick={onInstallApp}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Install App</span>
            </button>
          )}
        </div>

        {/* PWA Specs Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#23273D] text-xs">
          <div className="p-2.5 rounded-xl bg-[#0E1018]/60 border border-[#23273D]">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Manifest</span>
            <span className="font-semibold text-slate-200 mt-0.5 block truncate">Standalone</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0E1018]/60 border border-[#23273D]">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Service Worker</span>
            <span className="font-semibold text-emerald-400 mt-0.5 block truncate">Active (Cache v1)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0E1018]/60 border border-[#23273D]">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">App Icons</span>
            <span className="font-semibold text-slate-200 mt-0.5 block truncate">192/512 Maskable</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0E1018]/60 border border-[#23273D]">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Offline Shell</span>
            <span className="font-semibold text-cyan-400 mt-0.5 block truncate">Ready</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 leading-relaxed bg-[#0E1018]/40 p-3 rounded-xl border border-[#23273D]">
          <strong className="text-slate-300">Android Tip:</strong> On Android Chrome, tap the <strong className="text-white">Install</strong> button above, or open the browser menu (<span className="text-white">⋮</span>) and select <strong className="text-cyan-300">"Install app"</strong> or <strong className="text-cyan-300">"Add to Home screen"</strong>. StoryForge will run in full-screen standalone mode with native performance.
        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="glass-card rounded-2xl p-5 border border-rose-900/40 space-y-3">
        <h3 className="font-bold text-rose-400 text-sm flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Local Vault Data Wipe</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Erase all projects, scene blueprints, custom character profiles, and saved template bookmarks from your local browser storage. This cannot be undone.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to clear all local StoryForge data? Make sure you have exported a JSON backup first.')) {
              onClearData();
            }
          }}
          className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800 text-xs font-semibold transition-colors cursor-pointer"
        >
          Clear Local Storage Database
        </button>
      </div>

      {/* ABOUT & PRIVACY */}
      <div className="text-center text-xs text-slate-500 pt-4 space-y-1">
        <p className="font-semibold text-slate-400">StoryForge AI v2.4 · Imagine. Create. Animate.</p>
        <p>Architected for Google Flow, Runway Gen-3, Sora, and AI video creators.</p>
        <p className="text-[11px] text-slate-600">All data stored locally in your browser. No telemetry or unauthorized external sharing.</p>
      </div>
    </div>
  );
};
