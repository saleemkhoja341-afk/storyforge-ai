import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { generateCreativeStory, continueStoryProject } from './src/services/narrativeEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI SDK if GEMINI_API_KEY is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// 1. Health & Status
app.get(['/health', '/api/health', '/api/status'], (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    app: 'StoryForge AI',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// 2. Generate Story via Gemini 3.8 Flash
app.post('/api/generate-story', async (req: Request, res: Response) => {
  const {
    title,
    category,
    language,
    episodeCount = 3,
    duration = '30s',
    tone = 'Cinematic',
    mainCharacterName,
    boundCharacter,
    setting,
    storyIdea,
    preferredEnding,
    visualStyle = 'Cinematic 3D Animation',
    aspectRatio = '9:16',
  } = req.body;

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY not configured on server',
      fallbackRequired: true,
    });
  }

  const protagonist = boundCharacter?.name || mainCharacterName || 'Heroic Animal Protagonist';
  const canonicalPrompt = boundCharacter?.canonicalPrompt || `${protagonist}: Consistent anatomical markings, fur texture, eye color, and accessories.`;

  const systemInstruction = `You are StoryForge AI, an expert cinematic director, screenplay author, and AI video prompt engineer.
Create a complete multi-episode cinematic story in strictly valid JSON format.
Language for dialogue, summary, and hooks: ${language}.
Visual style for video prompts: ${visualStyle}.
Aspect ratio: ${aspectRatio}.
Main Character Canonical Continuity: ${canonicalPrompt}.

JSON Schema:
{
  "title": "Story Title",
  "summary": "Short emotional synopsis in ${language}",
  "hook": "Opening sensory hook in ${language}",
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "Episode title in ${language}",
      "hook": "Episode hook in ${language}",
      "endingCliffhanger": "Ending or cliffhanger in ${language}",
      "summary": "Episode summary in ${language}",
      "scenes": [
        {
          "sceneNumber": 1,
          "title": "Scene title",
          "duration": "${duration}",
          "location": "Location description",
          "charactersPresent": ["${protagonist}"],
          "continuityNotes": "Strict character continuity lock: ${canonicalPrompt}",
          "action": "Physical action and body movements",
          "facialEmotion": "Facial expressions and emotions",
          "cameraAngle": "Camera angle",
          "cameraMovement": "Camera movement",
          "lighting": "Lighting and atmosphere",
          "background": "Background elements",
          "dialogue": "Character spoken dialogue in ${language}",
          "soundDesign": "Ambient audio and SFX",
          "musicMood": "Music tone and instrumentation",
          "startFrame": "Beginning frame visual composition",
          "endFrame": "Ending frame visual composition",
          "transition": "Transition description",
          "flowPrompt": "Ultra-detailed ready-to-copy video prompt for Google Flow and Runway Gen-3 in English specifying style, subject continuity, motion, lighting, and camera."
        }
      ]
    }
  ]
}`;

  const prompt = `Category: ${category}
Tone: ${tone}
Number of episodes: ${Math.min(episodeCount, 5)}
Environment Setting: ${setting || 'Dramatic wilderness'}
Story Idea: ${storyIdea || 'An unforgettable tale of courage and destiny.'}
Ending: ${preferredEnding || 'Triumphant and emotional.'}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${systemInstruction}\n\nUser Request:\n${prompt}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);

    const project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title || parsed.title || `${category}: ${protagonist}'s Journey`,
      category,
      language,
      visualStyle,
      aspectRatio,
      tone,
      duration,
      summary: parsed.summary,
      hook: parsed.hook,
      characters: boundCharacter ? [boundCharacter] : [],
      episodes: parsed.episodes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return res.json({ project });
  } catch (err: any) {
    console.error('Gemini generation error in /api/generate-story:', err);
    const fallbackProject = generateCreativeStory({
      title,
      category,
      language,
      episodeCount,
      duration,
      tone,
      mainCharacterName,
      boundCharacter,
      setting,
      storyIdea,
      preferredEnding,
      visualStyle,
      aspectRatio,
    });
    return res.json({ project: fallbackProject, source: 'offline_engine', notice: 'Generated via Creative Narrative Engine' });
  }
});

// 3. Continue Story via Gemini
app.post('/api/continue-story', async (req: Request, res: Response) => {
  const { project, additionalEpisodesCount = 2 } = req.body;
  if (!ai || !project) {
    return res.status(503).json({ error: 'Gemini not configured or invalid project', fallbackRequired: true });
  }

  const currentEpCount = project.episodes?.length || 0;
  const boundChar = project.characters?.[0];

  const systemInstruction = `You are StoryForge AI. Continue an existing story seamlessly from Episode ${currentEpCount + 1}.
Preserve previous character models, unresolved plot points, and language (${project.language}).
Output strictly valid JSON with an array of ${additionalEpisodesCount} new episodes starting from episodeNumber: ${currentEpCount + 1}.

JSON Schema:
{
  "newEpisodes": [
    {
      "episodeNumber": ${currentEpCount + 1},
      "title": "Episode title in ${project.language}",
      "hook": "Episode hook in ${project.language}",
      "endingCliffhanger": "Ending or cliffhanger",
      "summary": "Episode summary",
      "scenes": [
        {
          "sceneNumber": 1,
          "title": "Scene title",
          "duration": "${project.duration || '30s'}",
          "location": "Location",
          "charactersPresent": ["${boundChar?.name || 'Protagonist'}"],
          "continuityNotes": "Character continuity notes",
          "action": "Action",
          "facialEmotion": "Emotion",
          "cameraAngle": "Camera angle",
          "cameraMovement": "Camera motion",
          "lighting": "Lighting",
          "background": "Background",
          "dialogue": "Spoken dialogue in ${project.language}",
          "soundDesign": "SFX",
          "musicMood": "Music description",
          "startFrame": "Start frame composition",
          "endFrame": "End frame composition",
          "transition": "Transition",
          "flowPrompt": "Detailed English video prompt for Google Flow"
        }
      ]
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${systemInstruction}\n\nOriginal Story Summary:\n${project.summary}\nLast Episode Hook:\n${project.episodes[currentEpCount - 1]?.endingCliffhanger || ''}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const newEpisodes = parsed.newEpisodes || [];

    const updatedProject = {
      ...project,
      episodes: [...project.episodes, ...newEpisodes],
      updatedAt: new Date().toISOString(),
    };

    return res.json({ project: updatedProject });
  } catch (err: any) {
    console.error('Gemini error in continue-story:', err);
    const updatedProject = continueStoryProject(project, additionalEpisodesCount);
    return res.json({ project: updatedProject, source: 'offline_engine', notice: 'Extended via Creative Narrative Engine' });
  }
});

// Setup Vite middleware in dev or serve static files in production
async function startServer() {
  // Always serve static assets from public/ (manifest.json, sw.js, PWA icons)
  app.use(
    express.static(path.resolve(__dirname, 'public'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('sw.js')) {
          res.setHeader('Service-Worker-Allowed', '/');
          res.setHeader('Cache-Control', 'no-cache');
        } else if (filePath.endsWith('manifest.json')) {
          res.setHeader('Content-Type', 'application/manifest+json');
        }
      },
    })
  );

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true', allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StoryForge AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
