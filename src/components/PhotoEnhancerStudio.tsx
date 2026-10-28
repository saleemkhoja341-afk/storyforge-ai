import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  RotateCcw, 
  Undo2, 
  Redo2, 
  Sparkles, 
  SlidersHorizontal, 
  Eye, 
  Layers, 
  SplitSquareVertical, 
  Check, 
  Wand2, 
  History, 
  Image as ImageIcon,
  Send,
  Zap,
  ZoomIn,
  RefreshCw,
  Sun,
  Contrast,
  Palette,
  Focus
} from 'lucide-react';
import { 
  EnhancementSettings, 
  DEFAULT_ENHANCEMENT_SETTINGS, 
  ENHANCEMENT_PRESETS,
  EnhancementPreset,
  processCanvasImage, 
  createThumbnail 
} from '../utils/imageProcessing';
import { Character } from '../types';

interface VersionSnapshot {
  id: string;
  label: string;
  timestamp: string;
  thumbnail: string;
  settings: EnhancementSettings;
  // Snapshot canvas data URL for instant rollback
  canvasDataUrl: string;
}

interface PhotoEnhancerStudioProps {
  characters?: Character[];
  onExportToCharacter?: (dataUrl: string, characterId?: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

// Sample images for testing without needing to upload
const SAMPLE_PREVIEWS = [
  {
    name: 'Arctic Wolf (Reference)',
    url: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Golden Eagle (Aerial)',
    url: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Bengal Tiger (Ruins)',
    url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1000&q=80',
  },
];

export const PhotoEnhancerStudio: React.FC<PhotoEnhancerStudioProps> = ({
  characters = [],
  onExportToCharacter,
  showToast,
}) => {
  // Canvases
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const workingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active state
  const [hasImage, setHasImage] = useState(false);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; name: string } | null>(null);
  const [settings, setSettings] = useState<EnhancementSettings>(DEFAULT_ENHANCEMENT_SETTINGS);

  // Comparison controls
  const [compareMode, setCompareMode] = useState<'split' | 'hold' | 'sideBySide'>('split');
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0 to 100
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  // History & Versioning
  const [history, setHistory] = useState<EnhancementSettings[]>([DEFAULT_ENHANCEMENT_SETTINGS]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [repeatPassCount, setRepeatPassCount] = useState(0);

  // Initialize working canvases once
  useEffect(() => {
    if (!originalCanvasRef.current) originalCanvasRef.current = document.createElement('canvas');
    if (!workingCanvasRef.current) workingCanvasRef.current = document.createElement('canvas');
  }, []);

  // Load image onto source canvas
  const loadImage = useCallback((img: HTMLImageElement, name: string) => {
    const origCanvas = originalCanvasRef.current;
    const workCanvas = workingCanvasRef.current;
    const dispCanvas = displayCanvasRef.current;
    if (!origCanvas || !workCanvas || !dispCanvas) return;

    // Constrain maximum working dimension for silky 60fps canvas performance
    const maxDimension = 1920;
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;

    if (w > maxDimension || h > maxDimension) {
      if (w > h) {
        h = Math.round((h * maxDimension) / w);
        w = maxDimension;
      } else {
        w = Math.round((w * maxDimension) / h);
        h = maxDimension;
      }
    }

    origCanvas.width = w;
    origCanvas.height = h;
    workCanvas.width = w;
    workCanvas.height = h;
    dispCanvas.width = w;
    dispCanvas.height = h;

    const origCtx = origCanvas.getContext('2d');
    const workCtx = workCanvas.getContext('2d');
    if (origCtx && workCtx) {
      origCtx.drawImage(img, 0, 0, w, h);
      workCtx.drawImage(img, 0, 0, w, h);
    }

    setImageMeta({ width: w, height: h, name });
    setHasImage(true);
    setSettings(DEFAULT_ENHANCEMENT_SETTINGS);
    setHistory([DEFAULT_ENHANCEMENT_SETTINGS]);
    setHistoryIndex(0);
    setRepeatPassCount(0);
    setActivePresetId(null);

    // Initial snapshot
    const thumb = createThumbnail(origCanvas);
    const initialVersion: VersionSnapshot = {
      id: `ver_${Date.now()}`,
      label: 'Original Upload',
      timestamp: new Date().toLocaleTimeString(),
      thumbnail: thumb,
      settings: DEFAULT_ENHANCEMENT_SETTINGS,
      canvasDataUrl: origCanvas.toDataURL('image/jpeg', 0.9),
    };
    setVersions([initialVersion]);
    setActiveVersionId(initialVersion.id);

    renderPipeline(DEFAULT_ENHANCEMENT_SETTINGS);
  }, []);

  // Load from local file
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        loadImage(img, file.name);
        showToast(`Loaded "${file.name}"`, 'success');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Load from URL (with CORS proxy fallback if needed)
  const handleUrlLoad = (url: string, name: string) => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadImage(img, name);
      setIsProcessing(false);
      showToast(`Loaded ${name}`, 'success');
    };
    img.onerror = () => {
      setIsProcessing(false);
      showToast('Could not load image due to CORS. Please upload file directly.', 'error');
    };
    img.src = url;
  };

  // Execute Canvas Processing and Render to Display Canvas
  const renderPipeline = useCallback(
    (currentSettings: EnhancementSettings) => {
      const workCanvas = workingCanvasRef.current;
      const dispCanvas = displayCanvasRef.current;
      const origCanvas = originalCanvasRef.current;
      if (!workCanvas || !dispCanvas || !origCanvas) return;

      setIsProcessing(true);

      // 1. Process enhancements from working canvas into display canvas
      processCanvasImage(workCanvas, dispCanvas, currentSettings);

      setIsProcessing(false);
    },
    []
  );

  // Commit slider changes to history (debounced on mouseup or change complete)
  const commitSettingsChange = (newSettings: EnhancementSettings, label?: string) => {
    setSettings(newSettings);
    renderPipeline(newSettings);

    // Update Undo/Redo stack
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSettings);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Add snapshot if significant preset or repeat
    if (label && displayCanvasRef.current) {
      const thumb = createThumbnail(displayCanvasRef.current);
      const newVersion: VersionSnapshot = {
        id: `ver_${Date.now()}`,
        label,
        timestamp: new Date().toLocaleTimeString(),
        thumbnail: thumb,
        settings: { ...newSettings },
        canvasDataUrl: displayCanvasRef.current.toDataURL('image/jpeg', 0.9),
      };
      setVersions((prev) => [newVersion, ...prev]);
      setActiveVersionId(newVersion.id);
    }
  };

  // Slider change handler (live render)
  const handleSliderChange = (key: keyof EnhancementSettings, value: number) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    renderPipeline(updated);
    setActivePresetId(null);
  };

  const handleSliderCommit = () => {
    commitSettingsChange(settings);
  };

  // Preset Selection
  const applyPreset = (preset: EnhancementPreset) => {
    setActivePresetId(preset.id);
    commitSettingsChange(preset.settings, `Preset: ${preset.name}`);
    showToast(`Applied "${preset.name}" preset`, 'info');
  };

  // Repeat Enhancement (Bake current output into working base for stacked passes)
  const handleRepeatEnhancement = () => {
    const dispCanvas = displayCanvasRef.current;
    const workCanvas = workingCanvasRef.current;
    if (!dispCanvas || !workCanvas) return;

    // Copy current enhanced display into working canvas
    const workCtx = workCanvas.getContext('2d');
    if (!workCtx) return;
    workCtx.drawImage(dispCanvas, 0, 0);

    const nextPass = repeatPassCount + 1;
    setRepeatPassCount(nextPass);

    // Reset current sliders to neutral so the user can apply another distinct pass
    const neutralSettings = { ...DEFAULT_ENHANCEMENT_SETTINGS };
    setSettings(neutralSettings);
    setHistory([neutralSettings]);
    setHistoryIndex(0);

    const thumb = createThumbnail(workCanvas);
    const passVersion: VersionSnapshot = {
      id: `ver_${Date.now()}`,
      label: `Enhancement Pass #${nextPass}`,
      timestamp: new Date().toLocaleTimeString(),
      thumbnail: thumb,
      settings: neutralSettings,
      canvasDataUrl: workCanvas.toDataURL('image/jpeg', 0.9),
    };

    setVersions((prev) => [passVersion, ...prev]);
    setActiveVersionId(passVersion.id);

    renderPipeline(neutralSettings);
    showToast(`Baked Pass #${nextPass}! Sliders reset for secondary tuning.`, 'success');
  };

  // Reset to Original
  const handleResetToOriginal = () => {
    const origCanvas = originalCanvasRef.current;
    const workCanvas = workingCanvasRef.current;
    if (!origCanvas || !workCanvas) return;

    const workCtx = workCanvas.getContext('2d');
    if (workCtx) {
      workCtx.drawImage(origCanvas, 0, 0);
    }

    setRepeatPassCount(0);
    setSettings(DEFAULT_ENHANCEMENT_SETTINGS);
    setHistory([DEFAULT_ENHANCEMENT_SETTINGS]);
    setHistoryIndex(0);
    setActivePresetId(null);
    renderPipeline(DEFAULT_ENHANCEMENT_SETTINGS);
    showToast('Reset to original image', 'info');
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      const prevSettings = history[prevIdx];
      setSettings(prevSettings);
      renderPipeline(prevSettings);
      showToast('Undo', 'info');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const nextSettings = history[nextIdx];
      setSettings(nextSettings);
      renderPipeline(nextSettings);
      showToast('Redo', 'info');
    }
  };

  // Restore snapshot version
  const handleRestoreVersion = (ver: VersionSnapshot) => {
    const workCanvas = workingCanvasRef.current;
    if (!workCanvas) return;

    const img = new Image();
    img.onload = () => {
      const ctx = workCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
      setSettings(ver.settings);
      setHistory([ver.settings]);
      setHistoryIndex(0);
      setActiveVersionId(ver.id);
      renderPipeline(ver.settings);
      showToast(`Restored version "${ver.label}"`, 'success');
    };
    img.src = ver.canvasDataUrl;
  };

  // Download Output
  const handleDownload = (format: 'png' | 'jpeg') => {
    const dispCanvas = displayCanvasRef.current;
    if (!dispCanvas) return;

    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = format === 'jpeg' ? 0.95 : undefined;
    const dataUrl = dispCanvas.toDataURL(mime, quality);

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `storyforge_enhanced_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast(`Downloaded as ${format.toUpperCase()}!`, 'success');
  };

  // Split slider drag handling
  const handleSplitMouseDown = () => setIsDraggingSplit(true);
  const handleSplitMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSplit || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSplitPosition(percent);
  };
  const handleSplitMouseUp = () => setIsDraggingSplit(false);

  // Send to character studio
  const handleSendToCharacterStudio = () => {
    const dispCanvas = displayCanvasRef.current;
    if (!dispCanvas) return;
    const dataUrl = dispCanvas.toDataURL('image/jpeg', 0.9);
    if (onExportToCharacter) {
      onExportToCharacter(dataUrl);
      showToast('Exported enhanced image to Character Studio!', 'success');
    }
  };

  return (
    <div 
      className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn select-none"
      onMouseUp={handleSplitMouseUp}
      onMouseLeave={handleSplitMouseUp}
    >
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23273D] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="font-semibold text-violet-400">Photo Enhancer Studio</span>
            <span aria-hidden="true">·</span>
            <span>100% Client-Side Canvas Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white flex items-center gap-2.5">
            <span>Visual Quality & Detail Enhancer</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Enhance reference portraits, unsharp mask sharpening, denoise, and cinematic color curves with zero external API calls.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xl bg-[#0E1018] border border-[#23273D] hover:border-slate-500 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xl bg-[#0E1018] border border-[#23273D] hover:border-slate-500 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetToOriginal}
            disabled={!hasImage}
            className="px-3 py-2 rounded-xl bg-[#0E1018] border border-[#23273D] hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
            title="Reset to Original"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleRepeatEnhancement}
            disabled={!hasImage}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
            title="Bake current enhancement as base and allow stacked passes"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Repeat Pass {repeatPassCount > 0 ? `(#${repeatPassCount})` : ''}</span>
          </button>
          <button
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showHistoryPanel
                ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                : 'bg-[#0E1018] border-[#23273D] text-slate-300 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({versions.length})</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleDownload('png')}
              disabled={!hasImage}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: VIEWPORT CANVAS & COMPARISON */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Viewport Control Bar */}
          <div className="flex items-center justify-between bg-[#0E1018] p-3 rounded-2xl border border-[#23273D] text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Comparison Mode:</span>
              <button
                onClick={() => setCompareMode('split')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  compareMode === 'split' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Interactive Split
              </button>
              <button
                onClick={() => setCompareMode('hold')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  compareMode === 'hold' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hold to Compare
              </button>
              <button
                onClick={() => setCompareMode('sideBySide')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  compareMode === 'sideBySide' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Side by Side
              </button>
            </div>

            {hasImage && imageMeta && (
              <div className="text-slate-400 font-mono text-[11px] hidden sm:block">
                {imageMeta.width} × {imageMeta.height}px
              </div>
            )}
          </div>

          {/* Canvas Interactive Stage */}
          <div 
            ref={containerRef}
            onMouseMove={handleSplitMouseMove}
            className="relative glass-card rounded-3xl border border-[#23273D] overflow-hidden min-h-[420px] max-h-[580px] flex items-center justify-center bg-[#07080D]"
          >
            {!hasImage ? (
              /* Empty Dropzone State */
              <div className="p-8 text-center max-w-md space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto text-violet-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Upload Reference Image to Enhance</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Drag and drop any character portrait, storyboard shot, or animation frame to sharpen details and balance tones.
                  </p>
                </div>

                <div className="flex justify-center gap-2 pt-2">
                  <label className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </label>
                </div>

                {/* Instant Sample Previews */}
                <div className="pt-4 border-t border-[#23273D]/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Or Test With Sample Reference:
                  </span>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {SAMPLE_PREVIEWS.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleUrlLoad(sample.url, sample.name)}
                        className="px-3 py-1.5 rounded-xl bg-[#0E1018] border border-[#23273D] hover:border-violet-500 text-slate-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>{sample.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Canvas Viewport */
              <div className="relative w-full h-full flex items-center justify-center p-2">
                {compareMode === 'sideBySide' ? (
                  /* Side By Side View */
                  <div className="grid grid-cols-2 gap-3 w-full h-full items-center">
                    <div className="relative rounded-2xl overflow-hidden border border-[#23273D]">
                      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-slate-300 uppercase">
                        Original
                      </div>
                      <img 
                        src={originalCanvasRef.current?.toDataURL('image/jpeg', 0.9)} 
                        alt="Original" 
                        className="w-full h-auto max-h-[500px] object-contain"
                      />
                    </div>
                    <div className="relative rounded-2xl overflow-hidden border border-violet-500/40 glow-accent">
                      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-violet-600/80 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                        Enhanced
                      </div>
                      <canvas 
                        ref={displayCanvasRef} 
                        className="w-full h-auto max-h-[500px] object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  /* Interactive Split or Hold to Compare View */
                  <div className="relative inline-block overflow-hidden max-h-[540px]">
                    {/* Underlying Enhanced Canvas */}
                    <canvas 
                      ref={displayCanvasRef} 
                      className={`max-w-full max-h-[520px] object-contain rounded-2xl ${
                        isHoldingOriginal ? 'opacity-0' : 'opacity-100'
                      }`}
                    />

                    {/* Original Image Layer for Comparison */}
                    {originalCanvasRef.current && (
                      <div 
                        className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl"
                        style={{
                          width: compareMode === 'split' ? `${splitPosition}%` : isHoldingOriginal ? '100%' : '0%',
                          borderRight: compareMode === 'split' ? '2px solid #06B6D4' : 'none',
                        }}
                      >
                        <img
                          src={originalCanvasRef.current.toDataURL('image/jpeg', 0.9)}
                          alt="Original Overlay"
                          className="max-w-none h-full object-contain"
                          style={{
                            width: displayCanvasRef.current?.clientWidth,
                            height: displayCanvasRef.current?.clientHeight,
                          }}
                        />
                        {compareMode === 'split' && (
                          <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-slate-300 uppercase">
                            Original
                          </div>
                        )}
                      </div>
                    )}

                    {/* Split Drag Handle Line */}
                    {compareMode === 'split' && (
                      <div
                        onMouseDown={handleSplitMouseDown}
                        style={{ left: `${splitPosition}%` }}
                        className="absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center cursor-ew-resize group z-20"
                      >
                        <div className="w-7 h-7 rounded-full bg-cyan-400 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-cyan-400/50 group-hover:scale-110 transition-transform">
                          <SplitSquareVertical className="w-4 h-4" />
                        </div>
                      </div>
                    )}

                    {/* Enhanced Label (Top Right) */}
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-violet-600/80 backdrop-blur-md text-[10px] font-bold text-white uppercase pointer-events-none">
                      Enhanced
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Comparison Bar (Below Stage) */}
          {hasImage && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0E1018] p-3 rounded-2xl border border-[#23273D] text-xs">
              <div className="flex items-center gap-2">
                <button
                  onMouseDown={() => setIsHoldingOriginal(true)}
                  onMouseUp={() => setIsHoldingOriginal(false)}
                  onTouchStart={() => setIsHoldingOriginal(true)}
                  onTouchEnd={() => setIsHoldingOriginal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#141724] border border-[#23273D] hover:border-slate-400 text-slate-200 font-semibold flex items-center gap-1.5 active:bg-violet-600 active:text-white transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hold to View Original</span>
                </button>
                <span className="text-[11px] text-slate-500">
                  {compareMode === 'split' ? 'Drag cyan slider horizontally' : 'Press & hold to toggle original'}
                </span>
              </div>

              {characters.length > 0 && onExportToCharacter && (
                <button
                  onClick={handleSendToCharacterStudio}
                  className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 font-semibold flex items-center gap-1.5 border border-violet-500/30 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Use as Character Reference</span>
                </button>
              )}
            </div>
          )}

          {/* 1-Click Cinematic Enhancement Presets */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-violet-400" />
              <span>1-Click Enhancement Presets</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ENHANCEMENT_PRESETS.map((preset) => {
                const isActive = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    disabled={!hasImage}
                    onClick={() => applyPreset(preset)}
                    className={`glass-card p-3 rounded-2xl text-left border transition-all cursor-pointer disabled:opacity-40 ${
                      isActive
                        ? 'border-violet-500 bg-violet-600/20 shadow-md'
                        : 'border-[#23273D] hover:border-violet-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">{preset.name}</span>
                      {isActive && <Check className="w-3 h-3 text-cyan-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MANUAL ENHANCEMENT SLIDERS & HISTORY */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Version History Drawer / Panel */}
          {showHistoryPanel ? (
            <div className="glass-card rounded-3xl p-5 border border-violet-500/40 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#23273D] pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-bold text-white">Version History</h3>
                </div>
                <button
                  onClick={() => setShowHistoryPanel(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {versions.map((ver) => (
                  <div
                    key={ver.id}
                    onClick={() => handleRestoreVersion(ver)}
                    className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      activeVersionId === ver.id
                        ? 'bg-violet-600/20 border-violet-500'
                        : 'bg-[#0E1018] border-[#23273D] hover:border-slate-500'
                    }`}
                  >
                    <img
                      src={ver.thumbnail}
                      alt={ver.label}
                      className="w-12 h-12 rounded-lg object-cover border border-[#23273D]"
                    />
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-white truncate">{ver.label}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">{ver.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-cyan-400 mt-0.5">Click to restore state</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Enhancement Tuning Controls */
            <div className="glass-card rounded-3xl p-5 border border-[#23273D] space-y-5">
              <div className="flex items-center justify-between border-b border-[#23273D] pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Fine-Tuning Controls</h3>
                </div>
                <button
                  onClick={() => commitSettingsChange(DEFAULT_ENHANCEMENT_SETTINGS)}
                  disabled={!hasImage}
                  className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold disabled:opacity-40 cursor-pointer"
                >
                  Reset Sliders
                </button>
              </div>

              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                
                {/* 1. Sharpening (Convolution Kernel) */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-[#0E1018] border border-[#23273D]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Focus className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Edge Sharpening</span>
                    </span>
                    <span className="font-mono text-cyan-400">{settings.sharpen}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sharpen}
                    disabled={!hasImage}
                    onChange={(e) => handleSliderChange('sharpen', Number(e.target.value))}
                    onMouseUp={handleSliderCommit}
                    onTouchEnd={handleSliderCommit}
                    className="w-full accent-cyan-400 cursor-pointer disabled:opacity-40"
                  />
                  <p className="text-[10px] text-slate-500">Unsharp mask sharpening for plumage and whiskers</p>
                </div>

                {/* 2. Noise Reduction (Edge-Preserving Spatial Denoise) */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-[#0E1018] border border-[#23273D]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-violet-400" />
                      <span>Noise Reduction & Smoothing</span>
                    </span>
                    <span className="font-mono text-violet-400">{settings.noiseReduction}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.noiseReduction}
                    disabled={!hasImage}
                    onChange={(e) => handleSliderChange('noiseReduction', Number(e.target.value))}
                    onMouseUp={handleSliderCommit}
                    onTouchEnd={handleSliderCommit}
                    className="w-full accent-violet-500 cursor-pointer disabled:opacity-40"
                  />
                  <p className="text-[10px] text-slate-500">Removes compression artifacts while preserving edges</p>
                </div>

                {/* 3. Brightness */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-300 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Brightness</span>
                    </span>
                    <span className="font-mono text-slate-400">{settings.brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.brightness}
                    disabled={!hasImage}
                    onChange={(e) => handleSliderChange('brightness', Number(e.target.value))}
                    onMouseUp={handleSliderCommit}
                    onTouchEnd={handleSliderCommit}
                    className="w-full accent-violet-500 cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* 4. Contrast */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-300 flex items-center gap-1.5">
                      <Contrast className="w-3.5 h-3.5 text-slate-400" />
                      <span>Contrast</span>
                    </span>
                    <span className="font-mono text-slate-400">{settings.contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.contrast}
                    disabled={!hasImage}
                    onChange={(e) => handleSliderChange('contrast', Number(e.target.value))}
                    onMouseUp={handleSliderCommit}
                    onTouchEnd={handleSliderCommit}
                    className="w-full accent-violet-500 cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* 5. Saturation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-300 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Color Saturation</span>
                    </span>
                    <span className="font-mono text-slate-400">{settings.saturation}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.saturation}
                    disabled={!hasImage}
                    onChange={(e) => handleSliderChange('saturation', Number(e.target.value))}
                    onMouseUp={handleSliderCommit}
                    onTouchEnd={handleSliderCommit}
                    className="w-full accent-violet-500 cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* 6. Vibrance (Smart Saturation) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-300">Vibrance</span>
                    <span className="font-mono text-slate-400">{settings.vibrance}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.vibrance}
                    disabled={!hasImage}
                    onChange={(e) => handleSliderChange('vibrance', Number(e.target.value))}
                    onMouseUp={handleSliderCommit}
                    onTouchEnd={handleSliderCommit}
                    className="w-full accent-violet-500 cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* 7. Warmth / Temperature */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-300">Warmth (Color Temp)</span>
                    <span className="font-mono text-slate-400">{settings.warmth}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.warmth}
                    disabled={!hasImage}
                    onChange={(e) => handleSliderChange('warmth', Number(e.target.value))}
                    onMouseUp={handleSliderCommit}
                    onTouchEnd={handleSliderCommit}
                    className="w-full accent-amber-500 cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* 8. Exposure */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-300">Exposure</span>
                    <span className="font-mono text-slate-400">{settings.exposure}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.exposure}
                    disabled={!hasImage}
                    onChange={(e) => handleSliderChange('exposure', Number(e.target.value))}
                    onMouseUp={handleSliderCommit}
                    onTouchEnd={handleSliderCommit}
                    className="w-full accent-violet-500 cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* 9. Shadows & Highlights */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Shadows</span>
                      <span className="font-mono">{settings.shadows}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.shadows}
                      disabled={!hasImage}
                      onChange={(e) => handleSliderChange('shadows', Number(e.target.value))}
                      onMouseUp={handleSliderCommit}
                      onTouchEnd={handleSliderCommit}
                      className="w-full accent-violet-500 cursor-pointer disabled:opacity-40"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Highlights</span>
                      <span className="font-mono">{settings.highlights}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.highlights}
                      disabled={!hasImage}
                      onChange={(e) => handleSliderChange('highlights', Number(e.target.value))}
                      onMouseUp={handleSliderCommit}
                      onTouchEnd={handleSliderCommit}
                      className="w-full accent-violet-500 cursor-pointer disabled:opacity-40"
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Quick Character Reference Bridge */}
          {characters.length > 0 && (
            <div className="glass-card rounded-2xl p-4 border border-[#23273D] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Enhance Character Reference:
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {characters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => {
                      if (char.referenceImage) {
                        handleUrlLoad(char.referenceImage, char.name);
                      } else {
                        showToast(`No reference image found on ${char.name}`, 'info');
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-[#0E1018] border border-[#23273D] hover:border-violet-500 text-xs text-slate-300 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
                  >
                    <span className="text-sm">🦁</span>
                    <span>{char.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
