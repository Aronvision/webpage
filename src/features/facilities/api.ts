'use server';

import { Facility, FacilityFilter } from './types';
import { createClient } from '@/lib/supabase/server';

// 모든 편의시설 목록 가져오기
export async function getAllFacilities(): Promise<Facility[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('facilities')
    .select('*');
  
  if (error) {
    return [];
  }
  
  return data || [];
}

// 필터링된 편의시설 목록 가져오기
export async function getFilteredFacilities(filter: FacilityFilter): Promise<Facility[]> {
  const supabase = await createClient();
  let query = supabase.from('facilities').select('*');
  
  // 터미널 필터링
  if (filter.terminal) {
    query = query.eq('terminal', filter.terminal);
  }
  
  // 층 필터링 - 'ALL'일 경우 적용하지 않음
  if (filter.floor && filter.floor !== 'ALL') {
    query = query.eq('floor', filter.floor);
  }
  
  // 카테고리 필터링
  if (filter.category && filter.category !== 'all') {
    query = query.eq('category', filter.category);
  }
  
  // 검색어 필터링 - 이름 또는 위치에 포함된 경우
  if (filter.searchQuery) {
    const searchTerm = `%${filter.searchQuery}%`;
    query = query.or(`name.ilike.${searchTerm},location.ilike.${searchTerm}`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return [];
  }
  
  return data || [];
}

// 특정 ID의 편의시설 정보 가져오기
export async function getFacilityById(id: string): Promise<Facility | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    return null;
  }
  
  return data || null;
} 