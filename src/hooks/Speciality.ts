"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";

import { creator, fetcher, modifier } from "@/apis/apiClient";
import { Speciality, SpecialityData } from "@/types/speciality";


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
export const useGetSpeciality = (
    initialData: Speciality | null,
    pathKey: string,
    page: number = 1,
    limit: number = 5,
    searchQuery: string = ""
  ) => {
    const url = `${pathKey}?page=${page}&limit=${limit}${searchQuery.trim() ? `&search=${searchQuery.trim()}` : ""}`;
    const { data: swrData, error } = useSWR<Speciality | null>(
      url,
      () => fetcher<Speciality>('speciality', url),
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

export const useCreateSpeciality = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createSpeciality = async (dataObj: SpecialityData) => {
        setLoading(true);
        setError(null);
        try {
            const speciality = await creator<SpecialityData, SpecialityData>('speciality', pathKey, dataObj);
            return speciality;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, createSpeciality };
};

/**
 * Hook for modifying an existing Speciality.
 *
 * @param pathKey - The API path key used to modify a Speciality.
 * @returns An object containing the updated Speciality, loading state, error state, and the modifySpeciality function.
 */
export const useModifySpeciality = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const modifySpeciality = async (updatedSpecialityData: Partial<SpecialityData>) => {
        setLoading(true);
        setError(null);
        try {
            const speciality = await modifier<SpecialityData, Partial<SpecialityData>>('speciality', pathKey, updatedSpecialityData);
            return speciality;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, modifySpeciality };
};
