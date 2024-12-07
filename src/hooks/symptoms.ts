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
  // Construct the URL without requiring a symptomId
  const url = `${pathKey}?page=${page}&limit=${limit}`;

  // Fetch data using SWR
  const { data: swrData, error } = useSWR<Symptom | null>(url,
    fetcher,
    {
      fallbackData: initialData,
      refreshInterval: initialData ? 3600000 : 0, // Refresh every hour if initialData exists
      revalidateOnFocus: false, // Disable revalidation on window focus
    });

  // Refetch function with an optional search keyword
  const refetch = async (keyword?: string) => {
    const refetchUrl = keyword ? `${url}&keyword=${keyword}` : url;
    return await mutate(refetchUrl);
  };

  // Return structured data
  return {
    value: swrData || {
      results: [], // Default structure for an empty result
      total: 0,
      pages: 0,
    },
    swrLoading: !error && !swrData,
    error,
    refetch,
  };
};

export const useCreateSymptom = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSymptom = async (dataObj: object) => {
    setLoading(true);
    setError(null);

    try {
      // Use pathKey for the dynamic API endpoint
      const symptom = await creator(pathKey, dataObj);
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
      const symptom = await modifier<SymptomData, Partial<SymptomData>>(pathKey, updatedSymptomData);
      return symptom;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, modifySymptom };
};