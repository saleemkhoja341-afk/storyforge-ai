import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  FolderPlus, 
  Search, 
  Clapperboard, 
  Users, 
  Film, 
  Flame, 
  Heart, 
  Compass, 
  Smile, 
  Sword,
  Wand2 
} from 'lucide-react';
import { Project, Character } from '../types';

interface DashboardViewProps {
  projects: Project[];
  characters: Character[];
  onSelectCategory: (category: string) => void;
  onOpenProject: (projectId: string) => void;
  onCreateNew: () => void;
  onOpenCharacters: () => void;
  onOpenLibrary: () => void;
  onOpenEnhancer?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  characters,
  onSelectCategory,
  onOpenProject,
  onCreateNew,
  onOpenCharacters,
  onOpenLibrary,
  onOpenEnhancer
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const totalEpisodes = projects.reduce((acc, p) => acc + (p.episodes?.length || 0), 0);
  const totalScenes = projects.reduce(
    (acc, p) => acc + (p.episodes?.reduce((epAcc, ep) => epAcc + (ep.scenes?.length || 0), 0) || 0),
    0
  );

  const quickCategories = [
    { name: 'Animal Adventure', icon: Compass, desc: 'Wilderness quests & soaring raptors' },
    { name: 'Epic Battle', icon: Sword, desc: 'Pack confrontations & territorial wars' },
    { name: 'Emotional Story', icon: Heart, desc: 'Sacrifice, cubs, and survival bonds' },
    { name: 'Fantasy World', icon: Sparkles, desc: 'Runic powers & mythical beasts' },
    { name: 'Funny Animals', icon: Smile, desc: 'Viral comedy & clumsy misadventures' },
    { name: 'Motivational Story', icon: Flame, desc: 'Triumph over adversity & pride' },
  ];

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Cinematic Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-10 border border-violet-500/30 glow-accent">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Next-Gen Cinematic Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
            What will you <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">create today?</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Generate multi-episode cinematic stories, preserve character consistency across all shots, and forge ready-to-copy prompts tailored for Google Flow, Runway Gen-3, Sora, and Kling.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onCreateNew}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-violet-600/30 flex items-center gap-2 transform active:scale-98 transition-all"
            >
              <Sparkles className="w-5 h-5 text-cyan-200" />
              <span>Create New Story</span>
            </button>
            <button
              onClick={onOpenCharacters}
              className="px-5 py-3.5 rounded-xl bg-[#0E1018] border border-[#23273D] hover:border-slate-500 text-slate-200 font-medium text-sm flex items-center gap-2 transition-all"
            >
              <Users className="w-4 h-4 text-violet-400" />
              <span>Character Studio</span>
            </button>
            <button
              onClick={onOpenLibrary}
              className="px-5 py-3.5 rounded-xl bg-[#0E1018] border border-[#23273D] hover:border-slate-500 text-slate-200 font-medium text-sm flex items-center gap-2 transition-all"
            >
              <Film className="w-4 h-4 text-cyan-400" />
              <span>Prompt Templates</span>
            </button>
            {onOpenEnhancer && (
              <button
                onClick={onOpenEnhancer}
                className="px-5 py-3.5 rounded-xl bg-[#0E1018] border border-[#23273D] hover:border-slate-500 text-slate-200 font-medium text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Wand2 className="w-4 h-4 text-cyan-400" />
                <span>Photo Enhancer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Active Projects', val: projects.length, icon: FolderPlus, color: 'text-violet-400' },
          { label: 'Total Episodes', val: totalEpisodes, icon: Film, color: 'text-cyan-400' },
          { label: 'Flow Video Prompts', val: totalScenes, icon: Clapperboard, color: 'text-amber-400' },
          { label: 'Canonical Characters', val: characters.length, icon: Users, color: 'text-emerald-400' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card rounded-2xl p-4 border border-[#23273D] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#0E1018] border border-[#23273D]/80">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">{stat.val}</div>
                <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Category Forge */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Quick Start Categories</h2>
            <p className="text-xs text-slate-400 mt-0.5">Click any genre to pre-configure tone, narrative structure, and prompts</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectCategory(cat.name)}
                className="glass-card glass-card-hover rounded-2xl p-4 text-left border border-[#23273D] flex flex-col justify-between group h-32"
              >
                <div className="p-2 rounded-xl bg-[#0E1018] w-fit text-violet-400 group-hover:text-cyan-400 group-hover:scale-110 transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 text-xs sm:text-sm group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{cat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Recent Projects */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Recently Created Projects</h2>
            <p className="text-xs text-slate-400 mt-0.5">Pick up where you left off or generate additional scenes</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 sm:p-12 text-center border border-dashed border-[#23273D]">
            <Clapperboard className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-200">
              {projects.length === 0 ? 'No Stories Created Yet' : 'No Matching Projects Found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
              {projects.length === 0
                ? 'Launch your first multi-episode project. Generate scenes, audio dialogues in Urdu/Hindi/English, and video prompt packs.'
                : 'Try adjusting your search query or create a new story.'}
            </p>
            <button
              onClick={onCreateNew}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate First Story</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.slice(0, 6).map((proj) => (
              <div
                key={proj.id}
                onClick={() => onOpenProject(proj.id)}
                className="glass-card glass-card-hover rounded-2xl p-5 border border-[#23273D] flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Clean unboxed metadata per design constitution */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-violet-400">{proj.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{proj.episodes?.length || 1} Episodes</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{proj.aspectRatio || '9:16'}</span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-base line-clamp-1 group-hover:text-cyan-400 transition-colors">
                    {proj.title}
                  </h3>

                  <p
                    className={`text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed ${
                      proj.language === 'Urdu' ? 'rtl-text text-right text-sm text-slate-300' : ''
                    }`}
                  >
                    {proj.summary}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#23273D] flex items-center justify-between text-xs text-slate-400">
                  <span>{new Date(proj.updatedAt || proj.createdAt).toLocaleDateString()}</span>
                  <span className="text-violet-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Flow Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Characters Bar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Canonical Characters Vault</h2>
            <p className="text-xs text-slate-400 mt-0.5">Reusable character descriptions that lock consistency in every video prompt</p>
          </div>
          <button
            onClick={onOpenCharacters}
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <span>Manage All ({characters.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {characters.slice(0, 4).map((char) => (
            <div
              key={char.id}
              onClick={onOpenCharacters}
              className="glass-card rounded-2xl p-4 border border-[#23273D] flex items-center gap-3 cursor-pointer hover:border-violet-500/40 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0E1018] border border-[#23273D] overflow-hidden flex-shrink-0 flex items-center justify-center">
                {char.referenceImage ? (
                  <img src={char.referenceImage} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">🦁</span>
                )}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-white text-xs sm:text-sm truncate">{char.name}</h4>
                <p className="text-[11px] text-cyan-400 truncate">{char.species}</p>
                <p className="text-[10px] text-slate-400 truncate">{char.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
