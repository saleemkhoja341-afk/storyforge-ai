import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clapperboard, 
  Users, 
  Globe, 
  Layers, 
  Clock, 
  Compass, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { 
  Character, 
  Language, 
  StoryCategory, 
  StoryTone, 
  VisualStyle, 
  AspectRatio, 
  Project 
} from '../types';
import { generateStory } from '../services/geminiService';

interface StoryGeneratorViewProps {
  prefilledCategory: string | null;
  characters: Character[];
  defaultLanguage: Language;
  defaultStyle: VisualStyle;
  defaultRatio: AspectRatio;
  defaultDuration: string;
  onStoryGenerated: (project: Project, source: 'gemini' | 'offline_engine') => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenCharacterStudio: () => void;
}

export const StoryGeneratorView: React.FC<StoryGeneratorViewProps> = ({
  prefilledCategory,
  characters,
  defaultLanguage,
  defaultStyle,
  defaultRatio,
  defaultDuration,
  onStoryGenerated,
  showToast,
  onOpenCharacterStudio
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<StoryCategory>('Animal Adventure');
  const [language, setLanguage] = useState<Language>(defaultLanguage || 'English');
  const [storyLength, setStoryLength] = useState('5 episodes');
  const [duration, setDuration] = useState(defaultDuration || '30 seconds');
  const [customDuration, setCustomDuration] = useState('');
  const [tone, setTone] = useState<StoryTone>('Cinematic');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(defaultStyle || 'Cinematic 3D Animation');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(defaultRatio || '9:16');

  // Additional Inputs
  const [selectedCharId, setSelectedCharId] = useState('');
  const [customCharName, setCustomCharName] = useState('');
  const [supportingCharacters, setSupportingCharacters] = useState('');
  const [villainOrRival, setVillainOrRival] = useState('');
  const [setting, setSetting] = useState('');
  const [storyIdea, setStoryIdea] = useState('');
  const [targetAudience, setTargetAudience] = useState('YouTube Shorts & Instagram Reels');
  const [preferredEnding, setPreferredEnding] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  useEffect(() => {
    if (prefilledCategory) {
      setCategory(prefilledCategory as StoryCategory);
    }
  }, [prefilledCategory]);

  const boundChar = characters.find((c) => c.id === selectedCharId);
  const isUrdu = language === 'Urdu';

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerationStep('Architecting narrative structure and multi-episode continuity...');

    // Parse requested episode count
    let numEpisodes = 3;
    if (storyLength.includes('1 episode')) numEpisodes = 1;
    else if (storyLength.includes('5')) numEpisodes = 5;
    else if (storyLength.includes('10')) numEpisodes = 5; // Initial batch
    else if (storyLength.includes('20')) numEpisodes = 5;
    else if (storyLength.includes('30')) numEpisodes = 5;
    else if (storyLength.includes('40')) numEpisodes = 5;

    const actualDuration = duration === 'Custom duration' ? (customDuration || '45s') : duration;

    try {
      setGenerationStep('Forging episodic arcs, dialogues, camera choreography, and Google Flow prompts...');

      const { project, source } = await generateStory({
        title,
        category,
        language,
        episodeCount: numEpisodes,
        duration: actualDuration,
        tone,
        mainCharacterName: customCharName,
        boundCharacter: boundChar,
        supportingCharacters,
        villainOrRival,
        setting,
        storyIdea,
        targetAudience,
        preferredEnding,
        visualStyle,
        aspectRatio,
      });

      onStoryGenerated(project, source);

      if (source === 'gemini') {
        showToast('Story forged with Google Gemini 3.8 Flash!', 'success');
      } else {
        showToast('Story forged via Creative Narrative Engine!', 'success');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      showToast('Generation encountered an issue. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#23273D] pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span className="font-semibold text-violet-400">Story Studio</span>
          <span aria-hidden="true">·</span>
          <span>Google Flow Ready</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white flex items-center gap-2.5">
          <span>AI Story & Screenplay Generator</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure narrative themes, bind canonical characters, and produce episodic cinematic scripts with complete video prompt packs.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        
        {/* Row 1: Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Story Title <span className="text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Flight of the Sun Eagle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Story Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as StoryCategory)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="Animal Adventure">Animal Adventure</option>
              <option value="Animal War">Animal War</option>
              <option value="Emotional Drama">Emotional Drama</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Action">Action</option>
              <option value="Comedy">Comedy</option>
              <option value="Horror">Horror</option>
              <option value="Motivational">Motivational</option>
              <option value="Islamic Educational">Islamic Educational</option>
              <option value="Custom Story">Custom Story</option>
            </select>
          </div>
        </div>

        {/* Row 2: Language, Length, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Language *</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="English">English</option>
              <option value="Urdu">Urdu (اردو - Nastaliq)</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Roman Urdu">Roman Urdu</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              <span>Story Length *</span>
            </label>
            <select
              value={storyLength}
              onChange={(e) => setStoryLength(e.target.value)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="1 episode">1 episode (Short Spotlight)</option>
              <option value="5 episodes">5 episodes (Complete Mini-Series)</option>
              <option value="10 episodes">10 episodes (Batched Arc)</option>
              <option value="20 episodes">20 episodes (Multi-Batch Series)</option>
              <option value="30 episodes">30 episodes (Extended Series)</option>
              <option value="40 episodes">40 episodes (Epic Saga)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Episode Duration *</span>
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="15 seconds">15 seconds (TikTok / Reels)</option>
              <option value="30 seconds">30 seconds (YouTube Shorts)</option>
              <option value="60 seconds">60 seconds (Full Short Film)</option>
              <option value="Custom duration">Custom duration</option>
            </select>
          </div>
        </div>

        {duration === 'Custom duration' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Custom Duration Specification
            </label>
            <input
              type="text"
              placeholder="e.g. 45 seconds, 90 seconds"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>
        )}

        {/* Row 3: Tone, Visual Style, Aspect Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Story Tone *
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as StoryTone)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="Cinematic">Cinematic</option>
              <option value="Emotional">Emotional</option>
              <option value="Suspenseful">Suspenseful</option>
              <option value="Funny">Funny</option>
              <option value="Epic">Epic</option>
              <option value="Inspirational">Inspirational</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Visual Style *
            </label>
            <select
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value as VisualStyle)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Aspect Ratio *
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="9:16">9:16 Vertical (Shorts & Reels)</option>
              <option value="16:9">16:9 Widescreen (Cinema / YouTube)</option>
              <option value="1:1">1:1 Square (Instagram Post)</option>
            </select>
          </div>
        </div>

        {/* Character Consistency Engine Integration */}
        <div className="glass-card rounded-2xl p-5 border border-violet-500/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                <span>Bind Canonical Character</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Locks anatomical build, plumage/fur markings, scars, and accessories into every generated scene prompt
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenCharacterStudio}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 self-start sm:self-auto"
            >
              <span>+ Create Character in Studio</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Select from Character Vault
              </label>
              <select
                value={selectedCharId}
                onChange={(e) => {
                  setSelectedCharId(e.target.value);
                  if (e.target.value) setCustomCharName('');
                }}
                className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
              >
                <option value="">-- Choose saved consistent character --</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.species} · {c.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Or Specify Custom Protagonist
              </label>
              <input
                type="text"
                placeholder="e.g. Zara the Desert Falcon"
                value={customCharName}
                disabled={!!selectedCharId}
                onChange={(e) => setCustomCharName(e.target.value)}
                className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 disabled:opacity-40"
              />
            </div>
          </div>

          {boundChar && (
            <div className="mt-2 p-3 rounded-xl bg-[#0E1018]/90 border border-violet-500/30 flex items-center gap-3">
              {boundChar.referenceImage && (
                <img
                  src={boundChar.referenceImage}
                  alt={boundChar.name}
                  className="w-12 h-12 rounded-lg object-cover border border-violet-500/40 flex-shrink-0"
                />
              )}
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{boundChar.name}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">({boundChar.species})</span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono line-clamp-1 mt-0.5">
                  {boundChar.canonicalPrompt}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Narrative Characters & Cast */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Supporting Characters
            </label>
            <input
              type="text"
              placeholder="e.g. Talon (elder mentor), Luna (young cub scout)"
              value={supportingCharacters}
              onChange={(e) => setSupportingCharacters(e.target.value)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Villain or Rival
            </label>
            <input
              type="text"
              placeholder="e.g. Vorgar (scarred rival hyena alpha), Drone fleet"
              value={villainOrRival}
              onChange={(e) => setVillainOrRival(e.target.value)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>

        {/* Setting & Core Idea */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Setting & Environments
            </label>
            <input
              type="text"
              placeholder="e.g. Ancient Karakoram snowy crags, overgrown mossy ruins at golden hour"
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Story Idea or Central Conflict
            </label>
            <textarea
              rows={3}
              dir={isUrdu ? 'rtl' : 'ltr'}
              placeholder={
                isUrdu
                  ? 'کہانی کا مرکزی خیال، قبیلے کی بقا، یا تنازعہ یہاں لکھیں...'
                  : 'Describe the inciting incident, the emotional stakes, or the journey...'
              }
              value={storyIdea}
              onChange={(e) => setStoryIdea(e.target.value)}
              className={`w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors ${
                isUrdu ? 'rtl-text text-base' : ''
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Audience
              </label>
              <input
                type="text"
                placeholder="e.g. YouTube Shorts, Reels, Film Festival"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Preferred Climax / Ending
              </label>
              <input
                type="text"
                placeholder="e.g. Emotional redemption, heroic sacrifice, cliffhanger"
                value={preferredEnding}
                onChange={(e) => setPreferredEnding(e.target.value)}
                className="w-full bg-[#0E1018] border border-[#23273D] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Long story batching note */}
        {parseInt(storyLength) > 5 && (
          <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-500/30 text-xs text-violet-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyan-400" />
            <p>
              <strong>Multi-Batch Generation Active:</strong> StoryForge AI generates the initial batch of high-fidelity episodes first with seamless continuity. You can click <strong>"Continue Story"</strong> in Flow Studio to forge the subsequent episodes seamlessly.
            </p>
          </div>
        )}

        {/* Generate Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-400 hover:from-violet-500 hover:to-cyan-300 text-white font-bold text-base shadow-xl shadow-violet-600/25 flex items-center justify-center gap-3 disabled:opacity-50 transform active:scale-99 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{generationStep || 'Forging Cinematic Story Arc...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-cyan-200" />
                <span>Generate Story & Video Prompts</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
