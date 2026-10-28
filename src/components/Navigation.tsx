import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Users, 
  Clapperboard, 
  FolderGit2, 
  Sliders, 
  BookOpen,
  Plus,
  Wand2,
  Download,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { StoryForgeLogo } from './StoryForgeLogo';

export type NavTab = 'home' | 'create' | 'characters' | 'enhancer' | 'prompts' | 'library' | 'projects' | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  projectCount: number;
  characterCount: number;
  isGeminiOnline: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isInstallable?: boolean;
  isInstalled?: boolean;
  onInstallApp?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  projectCount,
  characterCount,
  isGeminiOnline,
  isInstallable = false,
  isInstalled = false,
  onInstallApp,
}) => {
  const navItems = [
    { id: 'home' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create' as NavTab, label: 'Create Story', icon: Sparkles, badge: 'AI' },
    { id: 'characters' as NavTab, label: 'Characters', icon: Users, count: characterCount },
    { id: 'enhancer' as NavTab, label: 'Photo Enhancer', icon: Wand2, badge: 'Canvas' },
    { id: 'prompts' as NavTab, label: 'Flow Prompts', icon: Clapperboard },
    { id: 'library' as NavTab, label: 'Prompt Library', icon: BookOpen },
    { id: 'projects' as NavTab, label: 'My Projects', icon: FolderGit2, count: projectCount },
    { id: 'settings' as NavTab, label: 'Settings', icon: Sliders },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0E1018]/90 border-r border-[#23273D] p-5 sticky top-0 h-screen z-30 select-none">
        <StoryForgeLogo size="default" className="mb-6" />

        <div className="mb-4">
          <button
            onClick={() => onSelectTab('create')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Story Arc</span>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white border border-violet-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#141724]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#23273D] text-slate-300 font-mono">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* AI Engine Status Badge */}
        <div className="pt-4 border-t border-[#23273D] space-y-2">
          <div className="glass-card rounded-xl p-3 text-xs flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isGeminiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <div className="overflow-hidden">
              <p className="font-semibold text-slate-200 truncate">
                {isGeminiOnline ? 'Gemini 3.8 Flash Online' : 'Creative Narrative Engine'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {isGeminiOnline ? 'Server-side AI Active' : 'Offline Mode • Zero Cost'}
              </p>
            </div>
          </div>

          {/* PWA Install Trigger */}
          {isInstallable && onInstallApp && (
            <button
              onClick={onInstallApp}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 hover:from-emerald-600/30 hover:to-cyan-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Install StoryForge PWA</span>
            </button>
          )}

          {isInstalled && (
            <div className="w-full py-1.5 px-3 rounded-xl bg-[#141724]/60 text-slate-400 border border-[#23273D] text-[11px] font-medium flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>StoryForge App Installed</span>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#0E1018]/95 backdrop-blur-md border-b border-[#23273D] sticky top-0 z-40">
        <StoryForgeLogo size="small" showTagline={false} />
        <div className="flex items-center gap-2">
          {isInstallable && onInstallApp && (
            <button
              onClick={onInstallApp}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Install StoryForge PWA"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Install</span>
            </button>
          )}
          <button
            onClick={() => onSelectTab('create')}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Story</span>
          </button>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0E1018]/95 backdrop-blur-lg border-t border-[#23273D] px-2 py-1.5 flex justify-around items-center z-40">
        {[
          { id: 'home' as NavTab, label: 'Home', icon: LayoutDashboard },
          { id: 'create' as NavTab, label: 'Create', icon: Sparkles, highlight: true },
          { id: 'characters' as NavTab, label: 'Characters', icon: Users },
          { id: 'enhancer' as NavTab, label: 'Enhance', icon: Wand2 },
          { id: 'prompts' as NavTab, label: 'Prompts', icon: Clapperboard },
          { id: 'projects' as NavTab, label: 'Projects', icon: FolderGit2 },
          { id: 'settings' as NavTab, label: 'Settings', icon: Sliders },
        ].map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-all ${
                active ? 'text-violet-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg mb-0.5 ${item.highlight && !active ? 'text-cyan-400' : ''}`}>
                <Icon className={`w-5 h-5 ${active ? 'text-violet-400' : ''}`} />
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
