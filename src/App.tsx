import React, { useState, useEffect, useMemo } from 'react';
import { 
  Project, 
  Character, 
  AppSettings, 
  PromptTemplate 
} from './types';
import { DEFAULT_CHARACTERS } from './data/sampleCharacters';
import { PROMPT_LIBRARY_TEMPLATES } from './data/templates';
import { checkServerStatus } from './services/geminiService';

import { Navigation, NavTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { StoryGeneratorView } from './components/StoryGeneratorView';
import { CharacterStudioView } from './components/CharacterStudioView';
import { FlowPromptStudioView } from './components/FlowPromptStudioView';
import { PromptLibraryView } from './components/PromptLibraryView';
import { MyProjectsView } from './components/MyProjectsView';
import { SettingsView } from './components/SettingsView';
import { PhotoEnhancerStudio } from './components/PhotoEnhancerStudio';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Download, X } from 'lucide-react';

const STORAGE_KEYS = {
  PROJECTS: 'storyforge_projects_v2',
  CHARACTERS: 'storyforge_characters_v2',
  SETTINGS: 'storyforge_settings_v2',
  ACTIVE_ID: 'storyforge_active_id_v2',
  THEME: 'storyforge_theme_v2'
};

function loadStored<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Persistent Project & Character Storage
  const [projects, setProjects] = useState<Project[]>(() => loadStored<Project[]>(STORAGE_KEYS.PROJECTS, []));
  const [characters, setCharacters] = useState<Character[]>(() => loadStored<Character[]>(STORAGE_KEYS.CHARACTERS, DEFAULT_CHARACTERS));
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => loadStored<string | null>(STORAGE_KEYS.ACTIVE_ID, null));
  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadStored<'dark' | 'light'>(STORAGE_KEYS.THEME, 'dark'));

  const [settings, setSettings] = useState<AppSettings>(() => loadStored<AppSettings>(STORAGE_KEYS.SETTINGS, {
    defaultLanguage: 'English',
    defaultStyle: 'Cinematic 3D Animation',
    defaultRatio: '9:16',
    defaultDuration: '30 seconds',
    theme: 'dark',
    dailyLimit: 20,
    generationsCount: 1,
  }));

  const [isGeminiOnline, setIsGeminiOnline] = useState(false);
  const [prefilledCategory, setPrefilledCategory] = useState<string | null>(null);
  const [dismissedInstallBanner, setDismissedInstallBanner] = useState(false);

  // Progressive Web App Install hook
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  const handleInstallClick = async () => {
    const res = await installApp();
    if (res.outcome === 'accepted') {
      showToast('Thank you for installing StoryForge AI!', 'success');
    }
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
  }, [characters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, JSON.stringify(activeProjectId));
    }
  }, [activeProjectId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Check server status on launch
  useEffect(() => {
    checkServerStatus().then((res) => {
      setIsGeminiOnline(res.online && res.geminiConfigured);
    });
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0] || null;
  }, [projects, activeProjectId]);

  // Quick category selection from Dashboard
  const handleSelectCategory = (cat: string) => {
    setPrefilledCategory(cat);
    setCurrentTab('create');
  };

  // Open a project in Flow Studio
  const handleOpenProject = (id: string) => {
    setActiveProjectId(id);
    setCurrentTab('prompts');
  };

  // Story Generated Callback
  const handleStoryGenerated = (newProj: Project, source: 'gemini' | 'offline_engine') => {
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setSettings((prev) => ({
      ...prev,
      generationsCount: (prev.generationsCount || 0) + 1,
    }));
    setCurrentTab('prompts');
  };

  // Character Studio Actions
  const handleSaveCharacter = (char: Character) => {
    setCharacters((prev) => {
      const exists = prev.some((c) => c.id === char.id);
      if (exists) {
        return prev.map((c) => (c.id === char.id ? char : c));
      }
      return [char, ...prev];
    });
  };

  const handleDeleteCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDuplicateCharacter = (char: Character) => {
    const dup: Character = {
      ...char,
      id: `char_${Date.now()}_dup`,
      name: `${char.name} (Copy)`,
      canonicalPrompt: char.canonicalPrompt.replace(char.name, `${char.name} (Copy)`),
    };
    setCharacters((prev) => [dup, ...prev]);
    showToast(`Duplicated ${char.name}!`, 'success');
  };

  const handleSelectCharacterForStory = (char: Character) => {
    setCurrentTab('create');
    showToast(`Bound "${char.name}" for new story generation!`, 'info');
  };

  // Project Vault Actions
  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
    }
  };

  const handleDuplicateProject = (project: Project) => {
    const dup: Project = {
      ...project,
      id: `proj_${Date.now()}_dup`,
      title: `${project.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [dup, ...prev]);
    showToast(`Duplicated "${project.title}"!`, 'success');
  };

  const handleRenameProject = (id: string, newTitle: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: newTitle, updatedAt: new Date().toISOString() } : p))
    );
  };

  const handleImportProjects = (imported: Project[]) => {
    setProjects((prev) => [...imported, ...prev]);
    if (imported[0]?.id) {
      setActiveProjectId(imported[0].id);
    }
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setProjects([]);
    setCharacters(DEFAULT_CHARACTERS);
    setActiveProjectId(null);
    showToast('All local project & character data cleared', 'info');
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#08090E] text-slate-100 font-sans pb-20 md:pb-0">
      
      {/* Navigation Sidebar & Mobile Top/Bottom Bars */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        projectCount={projects.length}
        characterCount={characters.length}
        isGeminiOnline={isGeminiOnline}
        theme={theme}
        onToggleTheme={toggleTheme}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstallApp={handleInstallClick}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-y-auto">
        {/* Optional PWA Install Quick Banner */}
        {isInstallable && !dismissedInstallBanner && (
          <div className="bg-gradient-to-r from-violet-900/60 via-indigo-900/60 to-cyan-900/60 border-b border-cyan-500/30 px-4 py-2.5 flex items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 flex-shrink-0">
                <Download className="w-3.5 h-3.5" />
              </span>
              <p className="text-slate-200 truncate">
                <strong className="text-white">Install StoryForge AI</strong> on Android or desktop for offline story generation & full-screen studio!
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Install
              </button>
              <button
                onClick={() => setDismissedInstallBanner(true)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
        {currentTab === 'home' && (
          <DashboardView
            projects={projects}
            characters={characters}
            onSelectCategory={handleSelectCategory}
            onOpenProject={handleOpenProject}
            onCreateNew={() => setCurrentTab('create')}
            onOpenCharacters={() => setCurrentTab('characters')}
            onOpenLibrary={() => setCurrentTab('library')}
            onOpenEnhancer={() => setCurrentTab('enhancer')}
          />
        )}

        {currentTab === 'create' && (
          <StoryGeneratorView
            prefilledCategory={prefilledCategory}
            characters={characters}
            defaultLanguage={settings.defaultLanguage}
            defaultStyle={settings.defaultStyle}
            defaultRatio={settings.defaultRatio}
            defaultDuration={settings.defaultDuration}
            onStoryGenerated={handleStoryGenerated}
            showToast={showToast}
            onOpenCharacterStudio={() => setCurrentTab('characters')}
          />
        )}

        {currentTab === 'characters' && (
          <CharacterStudioView
            characters={characters}
            onSaveCharacter={handleSaveCharacter}
            onDeleteCharacter={handleDeleteCharacter}
            onDuplicateCharacter={handleDuplicateCharacter}
            onSelectCharacterForStory={handleSelectCharacterForStory}
            onEnhanceCharacterImage={() => {
              setCurrentTab('enhancer');
              showToast('Select character in Enhancer Studio to begin tuning!', 'info');
            }}
            showToast={showToast}
          />
        )}

        {currentTab === 'enhancer' && (
          <PhotoEnhancerStudio
            characters={characters}
            onExportToCharacter={(dataUrl, characterId) => {
              if (characterId) {
                setCharacters((prev) =>
                  prev.map((c) => (c.id === characterId ? { ...c, referenceImage: dataUrl } : c))
                );
              } else if (characters.length > 0) {
                setCharacters((prev) => [
                  { ...prev[0], referenceImage: dataUrl },
                  ...prev.slice(1),
                ]);
              }
              showToast('Enhanced portrait attached to Character Studio!', 'success');
              setCurrentTab('characters');
            }}
            showToast={showToast}
          />
        )}

        {currentTab === 'prompts' && (
          <FlowPromptStudioView
            project={activeProject}
            projects={projects}
            onSelectProject={setActiveProjectId}
            onUpdateProject={(updated) => {
              setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            }}
            onNewStoryClick={() => setCurrentTab('create')}
            showToast={showToast}
          />
        )}

        {currentTab === 'library' && (
          <PromptLibraryView
            templates={PROMPT_LIBRARY_TEMPLATES}
            onUseTemplate={(tpl) => {
              setPrefilledCategory(tpl.category);
              setCurrentTab('create');
              showToast(`Loaded template "${tpl.title}" into story creator!`, 'info');
            }}
            showToast={showToast}
          />
        )}

        {currentTab === 'projects' && (
          <MyProjectsView
            projects={projects}
            activeProjectId={activeProjectId}
            onOpenProject={handleOpenProject}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onRenameProject={handleRenameProject}
            onImportProjects={handleImportProjects}
            showToast={showToast}
            onCreateNew={() => setCurrentTab('create')}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            isGeminiOnline={isGeminiOnline}
            onClearData={handleClearAllData}
            theme={theme}
            onToggleTheme={toggleTheme}
            showToast={showToast}
            isInstallable={isInstallable}
            isInstalled={isInstalled}
            onInstallApp={handleInstallClick}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-white font-medium text-xs sm:text-sm animate-bounce ${
            toast.type === 'error'
              ? 'bg-rose-600'
              : toast.type === 'info'
              ? 'bg-cyan-600'
              : 'bg-emerald-600'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
