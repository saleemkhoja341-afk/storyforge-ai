import { Project, Character, Language, VisualStyle, AspectRatio } from '../types';
import { generateCreativeStory, continueStoryProject } from './narrativeEngine';

interface StoryGenerationParams {
  title?: string;
  category: string;
  language: Language;
  episodeCount: number;
  duration: string;
  tone: string;
  mainCharacterName?: string;
  boundCharacter?: Character;
  supportingCharacters?: string;
  villainOrRival?: string;
  setting?: string;
  storyIdea?: string;
  targetAudience?: string;
  preferredEnding?: string;
  visualStyle: VisualStyle;
  aspectRatio: AspectRatio;
}

export async function checkServerStatus(): Promise<{ online: boolean; geminiConfigured: boolean }> {
  try {
    const res = await fetch('/api/status', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return { online: true, geminiConfigured: !!data.geminiConfigured };
    }
  } catch {
    // Expected when running pure client or server not ready
  }
  return { online: false, geminiConfigured: false };
}

export async function generateStory(params: StoryGenerationParams): Promise<{ project: Project; source: 'gemini' | 'offline_engine' }> {
  try {
    const res = await fetch('/api/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(15000)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.project && Array.isArray(data.project.episodes) && data.project.episodes.length > 0) {
        return { project: data.project, source: 'gemini' };
      }
    }
  } catch (err) {
    console.warn('Backend /api/generate-story unavailable or timed out. Using built-in Creative Narrative Engine.', err);
  }

  // Resilient fallback to offline creative engine
  const offlineProject = generateCreativeStory(params);
  return { project: offlineProject, source: 'offline_engine' };
}

export async function extendStory(project: Project, additionalEpisodesCount: number = 2): Promise<{ project: Project; source: 'gemini' | 'offline_engine' }> {
  try {
    const res = await fetch('/api/continue-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project, additionalEpisodesCount }),
      signal: AbortSignal.timeout(15000)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.project) {
        return { project: data.project, source: 'gemini' };
      }
    }
  } catch (err) {
    console.warn('Backend /api/continue-story failed. Falling back to offline narrative extension.', err);
  }

  const extended = continueStoryProject(project, additionalEpisodesCount);
  return { project: extended, source: 'offline_engine' };
}
