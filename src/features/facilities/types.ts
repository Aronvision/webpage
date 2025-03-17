export type FacilityCategory = 
  | 'cafe'
  | 'shop'
  | 'restaurant'
  | 'medical'
  | 'wifi'
  | 'phone'
  | 'babycare'
  | 'accessibility'
  | 'gate';

export interface Coordinates {
  x: number;
  y: number;
}

export interface Facility {
  id: string;
  name: string;
  category: FacilityCategory;
  location: string;
  terminal: string;
  floor: string;
  coordinates: Coordinates;
  description?: string;
  operatingHours?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FacilityFilter {
  terminal?: string;
  floor?: string;
  category?: FacilityCategory | 'all';
  searchQuery?: string;
}

export interface CategoryInfo {
  name: string;
  color: string;
}

export const categoryInfo: Record<FacilityCategory, CategoryInfo> = {
  'cafe': { name: '카페', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  'shop': { name: '쇼핑', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  'restaurant': { name: '식당', color: 'bg-green-100 text-green-700 border-green-200' },
  'medical': { name: '의료', color: 'bg-red-100 text-red-700 border-red-200' },
  'wifi': { name: '와이파이', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  'phone': { name: '전화', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  'babycare': { name: '유아시설', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  'accessibility': { name: '교통약자', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  'gate': { name: '탑승구', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
}; 