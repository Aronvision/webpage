'use client';

import { useQuery } from '@tanstack/react-query';
import { Facility } from '../types';
import { getFacilityById } from '../api';

export function useFacility(id: string) {
  const result = useQuery({
    queryKey: ['facility', id],
    queryFn: async () => {
      try {
        const result = await getFacilityById(id);
        if (!result) {
          throw new Error('시설을 찾을 수 없습니다');
        }
        return result as Facility;
      } catch (err) {
        console.error('시설 정보 조회 중 오류 발생:', err);
        throw new Error('시설 정보를 가져오는 중 오류가 발생했습니다');
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터 캐싱
    gcTime: 1000 * 60 * 30 // 30분 동안 캐시 유지
  });

  return {
    facility: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error
  };
} 