import React, { useState } from 'react';
import { 
  Clapperboard, 
  Copy, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Edit3, 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  Layers, 
  Film, 
  Volume2, 
  Camera, 
  Sliders, 
  Info,
  Maximize2,
  FileText
} from 'lucide-react';
import { Project, Scene, Episode, AspectRatio } from '../types';
import { extendStory } from '../services/geminiService';

interface FlowPromptStudioViewProps {
  project: Project | null;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onUpdateProject: (updated: Project) => void;
  onNewStoryClick: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FlowPromptStudioView: React.FC<FlowPromptStudioViewProps> = ({
  project,
  projects,
  onSelectProject,
  onUpdateProject,
  onNewStoryClick,
  showToast,
}) => {
  const [currentEpIndex, setCurrentEpIndex] = useState(0);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPromptText, setEditedPromptText] = useState('');
  const [isContinuing, setIsContinuing] = useState(false);
  const [showFullInspector, setShowFullInspector] = useState(false);

  if (!project) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 animate-fadeIn my-16">
        <div className="p-4 rounded-3xl bg-violet-600/10 border border-violet-500/20 w-fit mx-auto">
          <Clapperboard className="w-12 h-12 text-violet-400" />
        </div>
        <h2 className="text-xl font-bold text-white">No Story Selected</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Select an existing project from your vault or create a new multi-episode story to view and export Google Flow prompts.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={onNewStoryClick}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg transition-all"
          >
            + Create New Story
          </button>
        </div>
      </div>
    );
  }

  const episodes = project.episodes || [];
  const currentEp = episodes[currentEpIndex] || episodes[0];
  const scenes = currentEp?.scenes || [];
  const currentScene: Scene | undefined = scenes[currentSceneIndex] || scenes[0];

  const isUrdu = project.language === 'Urdu';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'success');
  };

  const copyCompleteSceneBlueprint = () => {
    if (!currentScene) return;

    const blueprint = `=== STORYFORGE AI: SCENE BLUEPRINT ===
PROJECT: ${project.title} (${project.visualStyle})
EPISODE ${currentEp?.episodeNumber || currentEpIndex + 1}: ${currentEp?.title || ''}
SCENE ${currentScene.sceneNumber}: ${currentScene.title} (Duration: ${currentScene.duration})
ASPECT RATIO: ${project.aspectRatio}

[1. MAIN GOOGLE FLOW VIDEO PROMPT]
${currentScene.flowPrompt}

[2. CHARACTER CONSISTENCY & CONTINUITY LOCK]
Characters Present: ${(currentScene.charactersPresent || []).join(', ')}
Continuity Notes: ${currentScene.continuityNotes}
Facial Emotion: ${currentScene.facialEmotion}
Actions: ${currentScene.action}

[3. DIALOGUE & AUDIO PROMPT (${project.language})]
Dialogue: "${currentScene.dialogue}"
Sound Design: ${currentScene.soundDesign}
Music Mood: ${currentScene.musicMood}

[4. CAMERA & CINEMATOGRAPHY]
Camera Angle: ${currentScene.cameraAngle}
Camera Movement: ${currentScene.cameraMovement}
Lighting: ${currentScene.lighting}
Environment & Background: ${currentScene.location} — ${currentScene.background}

[5. KEYFRAME ANCHORS]
Start Frame: ${currentScene.startFrame}
End Frame: ${currentScene.endFrame}
Transition: ${currentScene.transition}

[6. NEGATIVE CONSTRAINTS]
deformed, distorted, extra limbs, bad anatomy, text watermark, blurry, low resolution artifacts, cartoonish if realistic style.`;

    copyToClipboard(blueprint, 'Full Scene Blueprint');
  };

  // Continuity story extension
  const handleContinueStory = async () => {
    setIsContinuing(true);
    showToast('Synthesizing next episodic arc with narrative continuity...', 'info');

    try {
      const { project: updated } = await extendStory(project, 2);
      onUpdateProject(updated);
      showToast('Forged 2 additional episodes preserving characters and lore!', 'success');
      setCurrentEpIndex(episodes.length);
      setCurrentSceneIndex(0);
    } catch {
      showToast('Could not continue story. Please try again.', 'error');
    } finally {
      setIsContinuing(false);
    }
  };

  const handleSaveEditedPrompt = () => {
    if (!currentScene) return;
    const updatedScenes = scenes.map((s, idx) => 
      idx === currentSceneIndex ? { ...s, flowPrompt: editedPromptText } : s
    );
    const updatedEpisodes = episodes.map((ep, idx) =>
      idx === currentEpIndex ? { ...ep, scenes: updatedScenes } : ep
    );
    onUpdateProject({
      ...project,
      episodes: updatedEpisodes,
      updatedAt: new Date().toISOString()
    });
    setIsEditingPrompt(false);
    showToast('Saved custom video prompt!', 'success');
  };

  const handleUpdateAspectRatio = (ratio: AspectRatio) => {
    onUpdateProject({
      ...project,
      aspectRatio: ratio,
      updatedAt: new Date().toISOString()
    });
    showToast(`Updated project ratio to ${ratio}`, 'info');
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Project Selector & Ratio Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23273D] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <select
              value={project.id}
              onChange={(e) => onSelectProject(e.target.value)}
              className="bg-[#0E1018] border border-[#23273D] text-white text-base sm:text-lg font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-violet-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.episodes?.length || 1} eps)
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span className="font-semibold text-violet-400">{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{project.visualStyle}</span>
            <span aria-hidden="true">·</span>
            <span>{project.language}</span>
          </div>
        </div>

        {/* Aspect Ratio Buttons */}
        <div className="flex items-center gap-1.5 bg-[#0E1018] p-1 rounded-xl border border-[#23273D] self-start sm:self-auto">
          {[
            { id: '9:16' as AspectRatio, label: '9:16 (Shorts/Reels)' },
            { id: '16:9' as AspectRatio, label: '16:9 (Landscape)' },
            { id: '1:1' as AspectRatio, label: '1:1 (Square)' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => handleUpdateAspectRatio(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                project.aspectRatio === r.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.id}
            </button>
          ))}
        </div>
      </div>

      {/* Episode Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#23273D]">
        {episodes.map((ep, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentEpIndex(idx);
              setCurrentSceneIndex(0);
              setIsEditingPrompt(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
              currentEpIndex === idx
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/50 shadow-sm'
                : 'bg-[#0E1018] text-slate-400 hover:text-slate-200 border border-[#23273D]'
            }`}
          >
            <span>Ep {ep.episodeNumber || idx + 1}</span>
            <span className="text-[10px] opacity-75">({ep.scenes?.length || 0} scenes)</span>
          </button>
        ))}

        <button
          onClick={handleContinueStory}
          disabled={isContinuing}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap bg-gradient-to-r from-cyan-500/20 to-violet-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isContinuing ? 'Generating Next Arc...' : '+ Continue Story Arc'}</span>
        </button>
      </div>

      {/* Episode Header & Scene Navigation */}
      {currentEp && (
        <div className="glass-card rounded-2xl p-4 border border-[#23273D] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-cyan-400" />
                <span>{currentEp.title}</span>
              </h2>
              <p className={`text-xs text-slate-400 mt-0.5 ${isUrdu ? 'rtl-text text-right text-sm' : ''}`}>
                Hook: <span className="text-slate-200 font-medium">{currentEp.hook}</span>
              </p>
            </div>
            <div className="text-xs text-slate-400">
              Ending: <span className="text-amber-300/90 font-medium">{currentEp.endingCliffhanger}</span>
            </div>
          </div>

          {/* Scene Numbers */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#23273D]/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Scenes:</span>
            {scenes.map((sc, sIdx) => (
              <button
                key={sIdx}
                onClick={() => {
                  setCurrentSceneIndex(sIdx);
                  setIsEditingPrompt(false);
                }}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentSceneIndex === sIdx
                    ? 'bg-cyan-400 text-slate-950 font-extrabold shadow-md shadow-cyan-400/30'
                    : 'bg-[#0E1018] text-slate-400 hover:text-slate-200 border border-[#23273D]'
                }`}
              >
                {sc.sceneNumber || sIdx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Scene Workbench */}
      {currentScene ? (
        <div className="space-y-4">
          
          {/* Scene Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0E1018] p-4 rounded-2xl border border-[#23273D]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Scene #{currentScene.sceneNumber}
                </span>
                <h3 className="font-bold text-white text-base">{currentScene.title}</h3>
                <span className="text-xs text-slate-400 font-mono">({currentScene.duration || '15s'})</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Location: <span className="text-slate-200">{currentScene.location}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowFullInspector(!showFullInspector)}
                className="px-3 py-2 rounded-xl bg-[#141724] border border-[#23273D] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showFullInspector ? 'Hide 20-Point Details' : 'View All 20 Scene Details'}</span>
              </button>
              <button
                onClick={copyCompleteSceneBlueprint}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All Scene Data</span>
              </button>
            </div>
          </div>

          {/* PROMPT BLOCKS GRID: SECTIONS A-F */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* SECTION A: MAIN VIDEO PROMPT (GOOGLE FLOW READY) */}
            <div className="glass-card rounded-2xl p-5 border border-violet-500/40 glow-accent space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>A. Main Video Prompt (Google Flow & Runway)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (!isEditingPrompt) setEditedPromptText(currentScene.flowPrompt);
                      setIsEditingPrompt(!isEditingPrompt);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#0E1018] cursor-pointer"
                    title="Edit Prompt"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(currentScene.flowPrompt, 'Main Video Prompt')}
                    className="px-2.5 py-1 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {isEditingPrompt ? (
                <div className="space-y-2">
                  <textarea
                    rows={5}
                    value={editedPromptText}
                    onChange={(e) => setEditedPromptText(e.target.value)}
                    className="w-full bg-[#0E1018] border border-violet-500 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none leading-relaxed"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingPrompt(false)}
                      className="px-3 py-1 rounded-lg bg-[#0E1018] text-slate-400 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEditedPrompt}
                      className="px-3 py-1 rounded-lg bg-violet-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Save Prompt
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0E1018]/90 border border-[#23273D] rounded-xl p-3.5 text-xs font-mono text-slate-200 leading-relaxed max-h-48 overflow-y-auto">
                  {currentScene.flowPrompt}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Ratio: <strong className="text-white font-mono">{project.aspectRatio}</strong></span>
                <span>Style: <strong className="text-white">{project.visualStyle}</strong></span>
              </div>
            </div>

            {/* SECTION B: CHARACTER REFERENCE PROMPT & CONTINUITY */}
            <div className="glass-card rounded-2xl p-5 border border-[#23273D] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" />
                  <span>B. Character Reference & Continuity Lock</span>
                </span>
                <button
                  onClick={() => copyToClipboard(currentScene.continuityNotes, 'Character Continuity Lock')}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="bg-[#0E1018]/90 border border-[#23273D] rounded-xl p-3.5 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Characters in Scene:</span>
                  <span className="text-white font-medium">{(currentScene.charactersPresent || []).join(', ') || 'Hero Protagonist'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Continuity Specs:</span>
                  <p className="text-slate-300 font-mono text-[11px] leading-relaxed">{currentScene.continuityNotes}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Expression & Emotion:</span>
                  <p className="text-slate-300">{currentScene.facialEmotion}</p>
                </div>
              </div>
            </div>

            {/* SECTION C: DIALOGUE & AUDIO PROMPT */}
            <div className="glass-card rounded-2xl p-5 border border-[#23273D] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>C. Dialogue & Audio Prompt ({project.language})</span>
                </span>
                <button
                  onClick={() => copyToClipboard(currentScene.dialogue, 'Dialogue')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="bg-[#0E1018]/90 border border-[#23273D] rounded-xl p-3.5 space-y-2">
                <div className={isUrdu ? 'rtl-text text-right text-base text-slate-100' : 'text-sm text-slate-100 font-medium'}>
                  "{currentScene.dialogue || 'Atmospheric suspense silence.'}"
                </div>
                {currentScene.voiceOver && (
                  <div className="text-xs text-slate-400 italic">
                    VO: "{currentScene.voiceOver}"
                  </div>
                )}
                <div className="text-[11px] text-slate-400 border-t border-[#23273D] pt-2 flex flex-col gap-1">
                  <span><strong>Audio SFX:</strong> {currentScene.soundDesign}</span>
                  <span><strong>Music Mood:</strong> {currentScene.musicMood}</span>
                </div>
              </div>
            </div>

            {/* SECTION D: CAMERA & NEGATIVE CONSTRAINTS */}
            <div className="glass-card rounded-2xl p-5 border border-[#23273D] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                  <span>D. Camera & Negative Constraints</span>
                </span>
                <button
                  onClick={() => copyToClipboard('deformed, distorted, extra limbs, bad anatomy, text watermark, blurry, low resolution artifacts', 'Negative Prompt')}
                  className="px-2.5 py-1 rounded-lg bg-[#0E1018] hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Negatives</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-[#0E1018]/90 p-3.5 rounded-xl border border-[#23273D]">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Camera Angle</span>
                  <span className="text-slate-200 font-mono text-[11px]">{currentScene.cameraAngle}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Motion</span>
                  <span className="text-slate-200 font-mono text-[11px]">{currentScene.cameraMovement}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-[#23273D]/60">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Lighting & Atmosphere</span>
                  <span className="text-slate-200 text-[11px]">{currentScene.lighting}</span>
                </div>
              </div>
            </div>

            {/* SECTION E & F: KEYFRAME COMPOSITION ANCHORS */}
            <div className="glass-card rounded-2xl p-5 border border-[#23273D] space-y-3 lg:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>E & F. Keyframe Composition Anchors (First & Last Frames)</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#0E1018]/90 p-3.5 rounded-xl border border-[#23273D] text-xs">
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span className="font-semibold text-cyan-400">First-Frame Anchor</span>
                    <button
                      onClick={() => copyToClipboard(currentScene.startFrame, 'Start Frame')}
                      className="text-[10px] text-violet-400 hover:text-violet-300 cursor-pointer"
                    >
                      copy anchor
                    </button>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px] leading-relaxed">{currentScene.startFrame}</p>
                </div>

                <div className="bg-[#0E1018]/90 p-3.5 rounded-xl border border-[#23273D] text-xs">
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span className="font-semibold text-violet-400">Last-Frame Anchor</span>
                    <button
                      onClick={() => copyToClipboard(currentScene.endFrame, 'End Frame')}
                      className="text-[10px] text-violet-400 hover:text-violet-300 cursor-pointer"
                    >
                      copy anchor
                    </button>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px] leading-relaxed">{currentScene.endFrame}</p>
                </div>
              </div>
            </div>
          </div>

          {/* EXPANDABLE 20-POINT SCENE DETAIL INSPECTOR */}
          {showFullInspector && (
            <div className="glass-card rounded-2xl p-5 border border-cyan-500/30 space-y-3 animate-fadeIn">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>All 20 Cinematic Specifications for Scene #{currentScene.sceneNumber}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-[#0E1018] p-4 rounded-xl border border-[#23273D]">
                <div><span className="text-slate-500 block text-[10px]">1. Ep & Scene:</span> Ep {currentEp.episodeNumber}, Scene {currentScene.sceneNumber}</div>
                <div><span className="text-slate-500 block text-[10px]">2. Title:</span> {currentScene.title}</div>
                <div><span className="text-slate-500 block text-[10px]">3. Duration:</span> {currentScene.duration}</div>
                <div><span className="text-slate-500 block text-[10px]">4. Location:</span> {currentScene.location}</div>
                <div><span className="text-slate-500 block text-[10px]">5. Cast Present:</span> {(currentScene.charactersPresent || []).join(', ')}</div>
                <div><span className="text-slate-500 block text-[10px]">6. Continuity:</span> {currentScene.continuityNotes}</div>
                <div><span className="text-slate-500 block text-[10px]">7. Action:</span> {currentScene.action}</div>
                <div><span className="text-slate-500 block text-[10px]">8. Facial Emotion:</span> {currentScene.facialEmotion}</div>
                <div><span className="text-slate-500 block text-[10px]">9. Camera Angle:</span> {currentScene.cameraAngle}</div>
                <div><span className="text-slate-500 block text-[10px]">10. Movement:</span> {currentScene.cameraMovement}</div>
                <div><span className="text-slate-500 block text-[10px]">11. Lighting:</span> {currentScene.lighting}</div>
                <div><span className="text-slate-500 block text-[10px]">12. Background:</span> {currentScene.background}</div>
                <div><span className="text-slate-500 block text-[10px]">13. Dialogue:</span> "{currentScene.dialogue}"</div>
                <div><span className="text-slate-500 block text-[10px]">14. Voice-over:</span> {currentScene.voiceOver || 'None'}</div>
                <div><span className="text-slate-500 block text-[10px]">15. Sound SFX:</span> {currentScene.soundDesign}</div>
                <div><span className="text-slate-500 block text-[10px]">16. Music Mood:</span> {currentScene.musicMood}</div>
                <div><span className="text-slate-500 block text-[10px]">17. Start Frame:</span> {currentScene.startFrame}</div>
                <div><span className="text-slate-500 block text-[10px]">18. End Frame:</span> {currentScene.endFrame}</div>
                <div><span className="text-slate-500 block text-[10px]">19. Transition:</span> {currentScene.transition}</div>
                <div><span className="text-slate-500 block text-[10px]">20. Flow Prompt:</span> Ready in Section A</div>
              </div>
            </div>
          )}

          {/* Scene Navigation Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={currentSceneIndex === 0}
              onClick={() => {
                setCurrentSceneIndex((prev) => prev - 1);
                setIsEditingPrompt(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#0E1018] border border-[#23273D] text-slate-300 text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Scene</span>
            </button>

            <div className="text-xs text-slate-400 font-mono">
              Scene {currentSceneIndex + 1} of {scenes.length}
            </div>

            <button
              disabled={currentSceneIndex >= scenes.length - 1}
              onClick={() => {
                setCurrentSceneIndex((prev) => prev + 1);
                setIsEditingPrompt(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#0E1018] border border-[#23273D] text-slate-300 text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Next Scene</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-sm">
          No scenes found for this episode.
        </div>
      )}
    </div>
  );
};
