export type Language = 'English' | 'Urdu' | 'Hindi' | 'Roman Urdu';

export type AspectRatio = '9:16' | '16:9' | '1:1' | 'Custom';

export type VisualStyle = 
  | 'Cinematic 3D Animation'
  | 'Realistic Wildlife'
  | 'Stylized 3D Characters'
  | 'Anime'
  | 'Fantasy Film'
  | 'Documentary'
  | 'Cartoon'
  | 'Cyberpunk Cinematic';

export type StoryCategory = 
  | 'Animal Adventure'
  | 'Animal War'
  | 'Emotional Drama'
  | 'Fantasy'
  | 'Action'
  | 'Comedy'
  | 'Horror'
  | 'Motivational'
  | 'Islamic Educational'
  | 'Custom Story';

export type StoryTone = 
  | 'Cinematic'
  | 'Emotional'
  | 'Suspenseful'
  | 'Funny'
  | 'Epic'
  | 'Inspirational';

export interface Character {
  id: string;
  name: string;
  species: string;
  age: string;
  proportions: string;
  faceDetails: string;
  furClothing: string;
  distinctiveMarkings: string;
  accessories: string;
  personality: string;
  voiceCharacteristics: string;
  role: 'Protagonist' | 'Antagonist' | 'Supporting Scout' | 'Mentor' | 'Companion';
  referenceImage?: string;
  canonicalPrompt: string;
}

export interface Scene {
  sceneNumber: number;
  title: string;
  duration: string;
  location: string;
  charactersPresent: string[];
  continuityNotes: string;
  action: string;
  facialEmotion: string;
  cameraAngle: string;
  cameraMovement: string;
  lighting: string;
  background: string;
  dialogue: string;
  voiceOver?: string;
  soundDesign: string;
  musicMood: string;
  startFrame: string;
  endFrame: string;
  transition: string;
  flowPrompt: string;
}

export interface Episode {
  episodeNumber: number;
  title: string;
  hook: string;
  endingCliffhanger: string;
  summary: string;
  scenes: Scene[];
}

export interface Project {
  id: string;
  title: string;
  category: StoryCategory | string;
  language: Language;
  visualStyle: VisualStyle;
  aspectRatio: AspectRatio;
  tone: StoryTone | string;
  duration: string;
  summary: string;
  hook: string;
  characters: Character[];
  episodes: Episode[];
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  language: Language;
  visualStyle: VisualStyle;
  aspectRatio: AspectRatio;
  samplePrompt: string;
}

export interface AppSettings {
  defaultLanguage: Language;
  defaultStyle: VisualStyle;
  defaultRatio: AspectRatio;
  defaultDuration: string;
  theme: 'dark' | 'light';
  dailyLimit: number;
  generationsCount: number;
}
