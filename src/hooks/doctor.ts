"use client";

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

import { creator, fetcher, modifier } from '@/apis/apiClient';
import { Doctor, DoctorData } from '@/types/doctor';

/**
 * Hook for fetching doctors with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch doctor data.
 * @param page - The page number for pagination.
 * @param limit - The number of items per page.
 * @param searchQuery - (Optional) The search query for filtering results.
 * @returns An object containing the fetched doctors, loading, error state, and refetch function.
 */
export const useGetDoctor = (
    initialData: Doctor | null,
    pathKey: string,
    page: number = 1,
    limit: number = 5,
    searchQuery: string = ""
  ) => {
    const url = `${pathKey}?page=${page}&limit=${limit}${searchQuery.trim() ? `&search=${searchQuery.trim()}` : ""}`;
  
    const { data: swrData, error } = useSWR<Doctor | null>(
      url,
      () => fetcher<Doctor>('doctor', url),
      {
      fallbackData: initialData,
      refreshInterval: initialData ? 3600000 : 0,
      revalidateOnFocus: false,
    }
  );
  
  const refetch = async (query?: string) => {
    const refetchUrl = query
        ? `${pathKey}?page=${page}&limit=${limit}&search=${query.trim()}`
        : url;
    try {
        console.log('Refetch URL:', refetchUrl);
        await mutate(refetchUrl);
    } catch (error) {
        console.error("Error during refetch:", error);
    }
    };
  
    return {
      value: swrData || {
        results: [], // Default structure for an empty result
        count: 0,
        pages: 0,
        errorMessage: null
      },
      swrLoading: !error && !swrData ,
      error,
      refetch,
    };
  };
  

/**
 * Hook for creating a new doctor.
 * 
 * @param pathKey - The API path key used to create a new doctor.
 * @returns An object containing the created doctor, loading state, error state, and the createDoctor function.
 */
export const useCreateDoctor = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createDoctor = async (newDoctorData: Partial<DoctorData>) => {
        setLoading(true);
        setError(null);
        try {
            const doctor = await creator<DoctorData, Partial<DoctorData>>('doctor', pathKey, newDoctorData);
            return doctor;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, createDoctor };
};

/**
 * Hook for modifying an existing doctor.
 * 
 * @param pathKey - The API path key used to modify a doctor.
 * @returns An object containing the updated doctor, loading state, error state, and the modifyDoctor function.
 */
export const useModifyDoctor = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const modifyDoctor = async (updatedDoctorData: Partial<DoctorData>) => {
        setLoading(true);
        setError(null);
        try {
            const doctor = await modifier<DoctorData, Partial<DoctorData>>('doctor', pathKey, updatedDoctorData);
            return doctor;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, modifyDoctor };
};
