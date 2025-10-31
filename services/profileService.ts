
import type { JournalEntry, UserProfile, ProfileStats, Achievement, ItemCategory } from '../types';
import { AVATAR_LIST } from '../components/avatars';
import { TrophyIcon, PawPrintIcon, LeafIcon, MapPinIcon, BoltIcon, SparklesIcon, PaintBrushIcon, WrenchScrewdriverIcon, ShoppingBagIcon } from '../components/icons';

const PROFILE_STORAGE_KEY = 'visionUserProfile';

const ALL_ACHIEVEMENTS_CONFIG = [
  { id: 'first_discovery', name: 'First Discovery', description: 'Save your first item.', icon: TrophyIcon },
  { id: 'curious_collector', name: 'Curious Collector', description: 'Save 5 items.', icon: TrophyIcon },
  { id: 'expert_archivist', name: 'Expert Archivist', description: 'Save 20 items.', icon: TrophyIcon },
  { id: 'master_collector', name: 'Master Collector', description: 'Save 50 items.', icon: TrophyIcon },
  { id: 'animal_friend', name: 'Animal Friend', description: 'Save your first animal.', icon: PawPrintIcon },
  { id: 'botanist', name: 'Botanist', description: 'Save your first plant.', icon: LeafIcon },
  { id: 'world_traveler', name: 'World Traveler', description: 'Save your first landmark.', icon: MapPinIcon },
  { id: 'food_critic', name: 'Food Critic', description: 'Save your first food item.', icon: BoltIcon },
  { id: 'art_connoisseur', name: 'Art Connoisseur', description: 'Save your first artwork.', icon: PaintBrushIcon },
  { id: 'gearhead', name: 'Gearhead', description: 'Save your first vehicle.', icon: WrenchScrewdriverIcon },
  { id: 'fashionista', name: 'Fashionista', description: 'Save your first fashion item.', icon: ShoppingBagIcon },
  { id: 'on_the_map', name: 'On The Map', description: 'Save an item with location data.', icon: MapPinIcon },
  { id: 'category_collector', name: 'Category Collector', description: 'Save items from 4 categories.', icon: SparklesIcon },
  { id: 'renaissance_person', name: 'Renaissance Person', description: 'Save items from 7 categories.', icon: SparklesIcon },
];


export const getDefaultProfile = (): UserProfile => ({
    name: 'Vision Explorer',
    avatarId: AVATAR_LIST[0].id,
    stats: { total: 0, Animal: 0, Plant: 0, Food: 0, Object: 0, Landmark: 0, Artwork: 0, Vehicle: 0, Fashion: 0, Other: 0 },
});

export const loadProfile = (): UserProfile => {
    try {
        const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            // Basic validation
            if (parsed.name && parsed.avatarId && parsed.stats) {
                // Ensure all stats fields are present
                const defaultStats = getDefaultProfile().stats;
                const loadedStats = { ...defaultStats, ...parsed.stats };
                return { ...parsed, stats: loadedStats };
            }
        }
    } catch (error) {
        console.error("Failed to load profile from localStorage", error);
    }
    return getDefaultProfile();
};

export const saveProfile = (profile: UserProfile): void => {
    try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
        console.error("Failed to save profile to localStorage", error);
    }
};

const calculateStats = (journal: JournalEntry[]): ProfileStats => {
    const stats: ProfileStats = { total: 0, Animal: 0, Plant: 0, Food: 0, Object: 0, Landmark: 0, Artwork: 0, Vehicle: 0, Fashion: 0, Other: 0 };
    stats.total = journal.length;
    
    for (const entry of journal) {
        if (stats.hasOwnProperty(entry.info.category)) {
            stats[entry.info.category]++;
        } else {
            stats.Other++;
        }
    }
    return stats;
};

const checkAchievedIds = (journal: JournalEntry[]): Set<string> => {
    const achievedIds = new Set<string>();

    if (journal.length >= 1) achievedIds.add('first_discovery');
    if (journal.length >= 5) achievedIds.add('curious_collector');
    if (journal.length >= 20) achievedIds.add('expert_archivist');
    if (journal.length >= 50) achievedIds.add('master_collector');

    if (journal.some(entry => !!entry.location)) achievedIds.add('on_the_map');

    const categories = new Set(journal.map(entry => entry.info.category));
    if (categories.has('Animal')) achievedIds.add('animal_friend');
    if (categories.has('Plant')) achievedIds.add('botanist');
    if (categories.has('Landmark')) achievedIds.add('world_traveler');
    if (categories.has('Food')) achievedIds.add('food_critic');
    if (categories.has('Artwork')) achievedIds.add('art_connoisseur');
    if (categories.has('Vehicle')) achievedIds.add('gearhead');
    if (categories.has('Fashion')) achievedIds.add('fashionista');
    
    if (categories.size >= 4) achievedIds.add('category_collector');
    if (categories.size >= 7) achievedIds.add('renaissance_person');

    return achievedIds;
};

export const updateProfileWithJournal = (profile: UserProfile, journal: JournalEntry[]): UserProfile => {
    const newStats = calculateStats(journal);
    return { ...profile, stats: newStats };
};


export const getAchievements = (journal: JournalEntry[]): Achievement[] => {
    const achievedIds = checkAchievedIds(journal);
    // Sort achievements so that achieved ones come first
    return ALL_ACHIEVEMENTS_CONFIG.map(ach => ({
        ...ach,
        isAchieved: achievedIds.has(ach.id),
    })).sort((a, b) => (b.isAchieved ? 1 : 0) - (a.isAchieved ? 1 : 0));
};