'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Facility, FacilityFilter } from '../types';
import { getAllFacilities, getFilteredFacilities } from '../api';

export function useFacilities(initialFilter?: FacilityFilter) {
  const [filter, setFilter] = useState<FacilityFilter>(initialFilter || {});
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // 필터링된 시설 목록 가져오기
  const {
    data: facilities = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['facilities', filter],
    queryFn: () => {
      // 필터가 비어있으면 모든 시설 가져오기
      if (!filter.terminal && !filter.floor && (!filter.category || filter.category === 'all') && !filter.searchQuery) {
        return getAllFacilities();
      }
      // 필터가 있으면 필터링된 시설 가져오기
      return getFilteredFacilities(filter);
    },
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터 캐싱
    gcTime: 1000 * 60 * 30 // 30분 동안 캐시 유지
  });

  // 필터 업데이트 함수 - useCallback으로 감싸서 불필요한 재생성 방지
  const updateFilter = useCallback((newFilter: Partial<FacilityFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  // 선택된 시설 업데이트 함수 - useCallback으로 감싸서 불필요한 재생성 방지
  const selectFacility = useCallback((facility: Facility | null) => {
    setSelectedFacility(facility);
  }, []);

  return {
    facilities,
    isLoading,
    isError,
    error,
    filter,
    updateFilter,
    selectedFacility,
    selectFacility,
    refetch
  };
} 