import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Copy, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  Film, 
  Check 
} from 'lucide-react';
import { PromptTemplate } from '../types';

interface PromptLibraryViewProps {
  templates: PromptTemplate[];
  onUseTemplate: (template: PromptTemplate) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PromptLibraryView: React.FC<PromptLibraryViewProps> = ({
  templates,
  onUseTemplate,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('storyforge_fav_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const categories = [
    'All',
    'Animal Battles',
    'Eagle Adventures',
    'Lion Stories',
    'Wolf Adventures',
    'Jungle Adventures',
    'Emotional Scenes',
    'Cinematic Intros',
    'Chase Scenes',
    'Transformation Scenes',
    'YouTube Shorts',
    'Fantasy Worlds',
  ];

  const toggleFavorite = (id: string) => {
    const next = favoriteIds.includes(id)
      ? favoriteIds.filter((item) => item !== id)
      : [...favoriteIds, id];
    setFavoriteIds(next);
    localStorage.setItem('storyforge_fav_templates', JSON.stringify(next));
    showToast(favoriteIds.includes(id) ? 'Removed from favorites' : 'Added to favorites!', 'info');
  };

  const copyTemplatePrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Template prompt copied to clipboard!', 'success');
  };

  const filtered = templates.filter((t) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      t.category === selectedCategory ||
      t.tags.includes(selectedCategory);

    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.samplePrompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#23273D] pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span className="font-semibold text-violet-400">Prompt Library</span>
          <span aria-hidden="true">·</span>
          <span>Tested Flow & Runway Formulas</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white flex items-center gap-2.5">
          <span>Cinematic Prompt Library</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore production-grade video formulas crafted for YouTube Shorts, Instagram Reels, and wildlife cinematics. Customize any blueprint in Story Generator with one click.
        </p>
      </div>

      {/* Search & Categories */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search templates (e.g. eagle, wolf, battle, emotional, chase)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-[#0E1018] text-slate-400 hover:text-slate-200 border border-[#23273D]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center border border-dashed border-[#23273D]">
          <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-semibold">No matching templates found</p>
          <p className="text-xs text-slate-500 mt-1">Try another search keyword or switch category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((tpl) => {
            const isFav = favoriteIds.includes(tpl.id);
            return (
              <div
                key={tpl.id}
                className="glass-card rounded-2xl p-5 border border-[#23273D] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-violet-400">{tpl.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{tpl.aspectRatio}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tpl.visualStyle}</span>
                    </div>

                    <button
                      onClick={() => toggleFavorite(tpl.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isFav ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={isFav ? 'Favorited' : 'Favorite template'}
                    >
                      {isFav ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug">{tpl.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{tpl.summary}</p>

                  {/* Clean unboxed tags */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-cyan-400/90 my-3 font-mono">
                    {tpl.tags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>

                  {/* Sample Video Prompt Box */}
                  <div className="bg-[#0E1018] p-3 rounded-xl border border-[#23273D] font-mono text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {tpl.samplePrompt}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#23273D] flex items-center justify-between text-xs">
                  <button
                    onClick={() => copyTemplatePrompt(tpl.samplePrompt)}
                    className="text-slate-400 hover:text-white font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Prompt</span>
                  </button>

                  <button
                    onClick={() => onUseTemplate(tpl)}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                    <span>Forge Story Arc →</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
