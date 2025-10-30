
export interface Geolocation {
  lat: number;
  lng: number;
}

export interface ARFeature {
  x: number;
  y: number;
  name: string;
}

export type ItemCategory = 'Animal' | 'Plant' | 'Food' | 'Object' | 'Landmark' | 'Artwork' | 'Vehicle' | 'Fashion' | 'Other';

export interface ItemInfo {
  name: string;
  category: ItemCategory;
  confidence: number;
  description: string;
  funFact: string;
  imageUrl: string;

  // Animal/Plant specific
  scientificName?: string;
  habitat?: string;
  diet?: string;
  lifespan?: string;
  conservationStatus?: string;
  
  // Food specific
  cuisine?: string;
  ingredients?: string[];

  // Object specific
  material?: string;
  era?: string;
}


export interface JournalEntry {
  id: string;
  info: ItemInfo;
  userImage: string;
  location?: Geolocation;
  date: string;
}

export interface DiscoveryItem {
    title: string;
    description: string;
    category: 'Local Discovery' | 'Fun Fact' | 'Challenge';
}

export interface ProfileStats {
    total: number;
    Animal: number;
    Plant: number;
    Food: number;
    Object: number;
    Landmark: number;
    Artwork: number;
    Vehicle: number;
    Fashion: number;
    Other: number;
}

export interface UserProfile {
    name: string;
    avatarId: string;
    stats: ProfileStats;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    isAchieved: boolean;
}