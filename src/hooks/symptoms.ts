"use client";

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

import { creator, fetcher, modifier } from '@/apis/apiClient';
import { Symptom, SymptomData } from '@/types/symptom';

/**
 * Hook for fetching symptoms with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch symptom data.
 * @param page
 * @param limit
 * @returns An object containing the fetched symptoms, loading, error state and refetch function.
 */
export const useGetSymptom = (
  initialData: Symptom | null,
  pathKey: string,
  page: number = 1,
  limit: number = 5
) => {
  const url = `${pathKey}?page=${page}&limit=${limit}`;
  const { data: swrData, error, isValidating } = useSWR<Symptom | null>(
    url,
    () => fetcher<Symptom>('symptom', url),
    {
      fallbackData: initialData,
      refreshInterval: initialData ? 3600000 : 0, // Refresh every hour if initialData exists
      revalidateOnFocus: false, // Disable revalidation on window focus
    });

  const refetch = async (keyword?: string) => {
    const refetchUrl = keyword ? `${url}&keyword=${keyword}` : url;
    return await mutate(refetchUrl);
  };

  return {
    value: swrData || {
      results: [], // Default structure for an empty result
      count: 0,
      pages: 0,
      errorMessage: null
    },
    swrLoading: !error && !swrData && isValidating,
    error,
    refetch,
  };
};

export const useCreateSymptom = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSymptom = async (dataObj: SymptomData) => {
    setLoading(true);
    setError(null);
    try {
      const symptom = await creator('symptom', pathKey, dataObj);
      return symptom;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  return { loading, error, createSymptom };
};


/**
 * Hook for modifying an existing symptom.
 * 
 * @param pathKey - The API path key used to modify a symptom.
 * @returns An object containing the updated symptom, loading state, error state, and the modifySymptom function.
 */

export const useModifySymptom = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const modifySymptom = async (
    updatedSymptomData: Partial<SymptomData>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const symptom = await modifier<SymptomData, Partial<SymptomData>>('symptom', pathKey, updatedSymptomData);
      return symptom;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  return { loading, error, modifySymptom };
};