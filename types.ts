
export enum ModuleView {
  ASCII_GENERATOR = 'ASCII_GENERATOR',
  SOCIAL_FORMATTER = 'SOCIAL_FORMATTER',
  SMILEY_LIBRARY = 'SMILEY_LIBRARY',
  KAOMOJI_LIBRARY = 'KAOMOJI_LIBRARY',
  KAOMOJI_BUILDER = 'KAOMOJI_BUILDER',
  DRAWING_EDITOR = 'DRAWING_EDITOR',
  USERNAME_GENERATOR = 'USERNAME_GENERATOR',
  TABLE_FORMATTER = 'TABLE_FORMATTER',
  SEPARATOR_GENERATOR = 'SEPARATOR_GENERATOR',
  IMAGE_TO_ASCII = 'IMAGE_TO_ASCII',
  TEXT_DECORATOR = 'TEXT_DECORATOR',
  ASCII_GALLERY = 'ASCII_GALLERY',
  APP_INFO = 'APP_INFO',
}

export interface AsciiFont {
  id: string;
  name: string;
  map: Record<string, string>;
  description?: string;
}

export interface AsciiFrame {
  id: string;
  name: string;
  top: string;
  middle: string;
  bottom: string;
}

export interface Smiley {
  id: string;
  char: string;
  name: string;
  category: string;
  keywords: string[];
}

export interface SymbolCategory {
  name: string;
  items: string[];
}

export interface KaomojiCategory {
  name: string;
  items: string[];
}

export interface SeparatorPattern {
  id: string;
  name: string;
  category: string; // Added category
  left: string;
  mid: string;
  right: string;
  repeat: boolean;
}

export interface DrawingProject {
  id: number;
  name: string;
  width: number;
  height: number;
  data: string[][]; // 2D grid of chars
  updatedAt: number;
}

export enum SocialPlatform {
  LINKEDIN = 'LinkedIn',
  TWITTER = 'X (Twitter)',
  FACEBOOK = 'Facebook',
  INSTAGRAM = 'Instagram',
  DISCORD = 'Discord',
  YOUTUBE = 'YouTube',
}

export interface AsciiTemplate {
  id: string;
  name: string;
  category: string;
  art: string;
}

export interface SocialTemplate {
  id: string;
  title: string;
  platform: SocialPlatform | 'All';
  category: string;
  content: string;
}

export interface AsciiGalleryItem {
  id: string;
  name: string;
  category: string;
  art: string;
  keywords: string[];
}
