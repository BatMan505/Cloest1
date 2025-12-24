
export type Category = 'Tops' | 'Bottoms' | 'Shoes' | 'Accessories' | 'Outerwear' | 'Dresses';

export type Occasion = 'Casual' | 'Work' | 'Formal' | 'Night Out' | 'Gym' | 'Date Night' | 'Lounge' | 'Other';

export interface User {
  id: string;
  email: string;
  username: string;
  joinedAt: number;
  avatar?: string;
  bio?: string;
  preferences?: {
    aesthetics: string[];
    favoriteColors: string[];
  };
}

export interface ClothingItem {
  id: string;
  imageUrl: string;
  category: Category;
  color: string;
  season: string[];
  occasion: string[];
  tags: string[];
  createdAt: number;
  isLiked?: boolean;
}

export interface Outfit {
  id: string;
  name: string;
  itemIds: string[];
  occasion: Occasion;
  createdAt: number;
  background?: string;
  backgroundImage?: string;
  stickers?: string[];
  isTemplate?: boolean;
}

export interface WardrobeState {
  items: ClothingItem[];
  outfits: Outfit[];
}

export interface GeminiCategorization {
  category: Category;
  color: string;
  season: string[];
  occasion: string[];
  tags: string[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export interface ShoppingRecommendation {
  wardrobeAnalysis: string;
  styleProfile: {
    dominantColors: string[];
    topOccasions: string[];
    coreAesthetic: string;
  };
  gaps: {
    category: string;
    reason: string;
  }[];
  suggestions: {
    itemType: string;
    whyItFits: string;
    stylingIdea: string;
  }[];
  brandMatches: {
    name: string;
    style: string;
    url: string;
  }[];
  sources?: GroundingChunk[];
}

export type ReportType = 'Bug' | 'AI Mistake' | 'Feature Suggestion' | 'Other';

export interface Report {
  id: string;
  type: ReportType;
  description: string;
  timestamp: number;
}
