
export type Language = 'zh-CN' | 'zh-TW' | 'en';

export type ReadingMode = 'standard' | 'visual_novel';

export type ReaderFont = 'mono' | 'sans' | 'serif' | 'custom-02' | 'pixel';

export interface AppConfig {
  language: Language;
  crtEnabled: boolean;
  isLightTheme: boolean;
  setupCompleted: boolean;
  bgmPlaying: boolean;
  bgmVolume: number;
  readerFont: ReaderFont;
  readingMode: ReadingMode;
  nickname: string;
}

export interface CharacterStats {
  strength: number;    // 强度/破坏力
  intelligence: number;// 智力/演算力
  agility: number;     // 机动/反应
  mental: number;      // 精神/抗性
  resonance: number;   // 共鸣/量子适应性
}

export interface CharacterTranslation {
  name: string;
  role: string;
  description: string[];
  tags: string[];
  quote?: string;
}

export interface Character {
  id: string;
  alias?: string;
  stats: CharacterStats;
  themeColor?: string;
  translations: {
    'zh-CN': CharacterTranslation;
    'zh-TW': CharacterTranslation;
    'en': CharacterTranslation;
  };
}

export interface LoreTranslation {
  title: string;
  content: string[];
}

export interface LoreEntry {
  id: string;
  category: 'World' | 'Organization' | 'Technology' | 'Society' | 'Setting';
  translations: {
    'zh-CN': LoreTranslation;
    'zh-TW': LoreTranslation;
    'en': LoreTranslation;
  };
}

export interface ChapterTranslation {
  title: string;
  summary?: string;
  content: string;
}

export interface Chapter {
  id: string;
  date: string;
  status?: 'published' | 'locked' | 'corrupted';
  translations: {
    'zh-CN': ChapterTranslation;
    'zh-TW': ChapterTranslation;
    'en': ChapterTranslation;
  };
}

export interface SideStoryVolume {
  id: string;
  title: string; 
  titleEn: string;
  status: 'unlocked' | 'locked' | 'corrupted';
  chapters: Chapter[];
}

export interface NovelData {
  title: string;
  subtitle: string;
  intro: string;
  characters: Character[];
  lore: LoreEntry[];
  chapters: Chapter[];
}

export interface SideCharacterData {
  id: string;
  group: string; // Grouping for tree view
  isLocked?: boolean; // Lock status
  themeColor?: string;
  translations: {
    [key in Language]: {
      name: string;
      enName: string;
      role: string;
      tags: string[];
      description: string[];
      quote?: string;
    }
  }
}

// --- Visual Novel Types ---
export interface VNNode {
  id: string;
  type: 'dialogue' | 'narration' | 'system' | 'image';
  speaker?: string; // ID of the character or Raw Name
  speakerName?: string; // Display Name
  text: string;
  emotion?: 'neutral' | 'happy' | 'angry' | 'shocked' | 'sweat';
}

// --- Guestbook Types ---
export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  isSystem?: boolean;
  isAdmin?: boolean;
}