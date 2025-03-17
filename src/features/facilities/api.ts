'use server';

import { Facility, FacilityFilter } from './types';
import { mockFacilities } from './mock-data';

// 모든 편의시설 목록 가져오기
export async function getAllFacilities(): Promise<Facility[]> {
  // 모의 데이터 반환
  return mockFacilities;
}

// 필터링된 편의시설 목록 가져오기
export async function getFilteredFacilities(filter: FacilityFilter): Promise<Facility[]> {
  // 모의 데이터 필터링
  let filteredFacilities = [...mockFacilities];
  
  // 터미널 필터링
  if (filter.terminal) {
    filteredFacilities = filteredFacilities.filter(facility => facility.terminal === filter.terminal);
  }
  
  // 층 필터링
  if (filter.floor) {
    filteredFacilities = filteredFacilities.filter(facility => facility.floor === filter.floor);
  }
  
  // 카테고리 필터링
  if (filter.category && filter.category !== 'all') {
    filteredFacilities = filteredFacilities.filter(facility => facility.category === filter.category);
  }
  
  // 검색어 필터링
  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    filteredFacilities = filteredFacilities.filter(facility => 
      facility.name.toLowerCase().includes(query) || 
      facility.location.toLowerCase().includes(query)
    );
  }
  
  return filteredFacilities;
}

// 특정 ID의 편의시설 정보 가져오기
export async function getFacilityById(id: string): Promise<Facility | null> {
  // 모의 데이터에서 ID로 시설 찾기
  const facility = mockFacilities.find(facility => facility.id === id);
  
  if (!facility) {
    return null;
  }
  
  return facility;
} 