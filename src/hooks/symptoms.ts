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
 * @param symptomId
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
  const { data: swrData, error } = useSWR<Symptom | null>(url, fetcher, {
    fallbackData: initialData,
    refreshInterval: initialData ? 3600000 : 0, // Refresh every hour if initialData exists
    revalidateOnFocus: false, // Disable revalidation on window focus
  });

  // Refetch function with an optional search keyword
  const refetch = async (keyword?: string) => {
    const refetchUrl = keyword ? `${url}&keyword=${keyword}` : url;
    await mutate(refetchUrl);
  };

  // Return structured data
  return {
    value: swrData || {
      results: [], // Default structure for an empty result
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
    },
    swrLoading: !error && !swrData,
    error,
    refetch,
  };
};

export const useCreateSymptom = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdSymptom, setCreatedSymptom] = useState<Symptom | null>(null);

  const createSymptom = async (pathKey: string, newSymptomData: Symptom) => {
    setLoading(true);
    setError(null);

    try {
      // Use pathKey for the dynamic API endpoint
      const symptom = await creator<Symptom, Symptom>(pathKey, newSymptomData);
      setCreatedSymptom(symptom);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { createdSymptom, loading, error, createSymptom };
};
  

/**
 * Hook for modifying an existing symptom.
 * 
 * @param pathKey - The API path key used to modify a symptom.
 * @returns An object containing the updated symptom, loading state, error state, and the modifySymptom function.
 */

export const useModifySymptom = (p0: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedSymptom, setUpdatedSymptom] = useState<SymptomData | null>(null);

  const modifySymptom = async (path: string, formData: { name: string; description: string }) => {
    setLoading(true);
    setError(null);

    try {
      const symptom = await modifier<SymptomData, SymptomData>(path, formData);
      setUpdatedSymptom(symptom);
      return symptom; // Return the updated symptom in case the caller needs it
    } catch (err) {
      setError(err as Error);
      throw err; // Propagate the error for better error handling in the calling function
    } finally {
      setLoading(false);
    }
  };

  return { updatedSymptom, loading, error, modifySymptom };
};