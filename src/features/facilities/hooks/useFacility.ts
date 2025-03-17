'use client';

import { useQuery } from '@tanstack/react-query';
import { Facility } from '../types';
import { getFacilityById } from '../api';

export function useFacility(id: string) {
  const {
    data: facility,
    isLoading,
    isError,
    error
  } = useQuery<Facility | null>({
    queryKey: ['facility', id],
    queryFn: () => getFacilityById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터 캐싱
    gcTime: 1000 * 60 * 30 // 30분 동안 캐시 유지
  });

  return {
    facility,
    isLoading,
    isError,
    error
  };
} 