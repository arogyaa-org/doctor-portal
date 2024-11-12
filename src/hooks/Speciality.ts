"use client";

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

import { creator, fetcher, modifier } from '@/apis/apiClient';
import { SpecialityData, Speciality } from '@/types/speciality';

/**
 * Hook for fetching specialities with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch speciality data.
 * @param patientId - The ID of the speciality to fetch.
 * @param page - The page number for pagination.
 * @param limit - The number of items per page.
 * @returns An object containing the fetched specialities, loading, error state and refetch function.
 */
export const useGetSpeciality = (
    initialData: Speciality | null,
    pathKey: string,
    patientId: string,
    page: number = 1,
    limit: number = 5
) => {
    const url = `${pathKey}/${patientId}?page=${page}&limit=${limit}`;

    const { data: swrData, error } = useSWR<Speciality | null>(
        url,
        fetcher,
        {
            fallbackData: initialData,
            refreshInterval: initialData ? 3600000 : 0, // 1 hour refresh if initialData exists
            revalidateOnFocus: false,                  // Disable revalidation on window focus
        }
    );

    // Manually re-trigger re-fetch
    const refetch = async (keyword?: string) => {
        await mutate(`${url}?keyword=${keyword}`);
    };

    return {
        value: swrData || {
            results: [],
            total: 0,
            page: 1,
            limit,
            totalPages: 1,
        },
        swrLoading: !error && !swrData,
        error,
        refetch
    };
};

/**
 * Hook for creating a new speciality.
 * 
 * @param pathKey - The API path key used to create a new speciality.
 * @returns An object containing the created speciality, loading state, error state, and the createSpeciality function.
 */
export const useCreateSpeciality = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [createdSpeciality, setCreatedSpeciality] = useState<SpecialityData | null>(null);

    const createSpeciality = async (newSpecialityData: SpecialityData) => {
        setLoading(true);
        setError(null);

        try {
            const speciality = await creator<SpecialityData, SpecialityData>(pathKey, newSpecialityData);
            setCreatedSpeciality(speciality);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { createdSpeciality, loading, error, createSpeciality };
};

/**
 * Hook for modifying an existing speciality.
 * 
 * @param pathKey - The API path key used to modify a speciality.
 * @returns An object containing the updated speciality, loading state, error state, and the modifySpeciality function.
 */
export const useModifySpeciality = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [updatedSpeciality, setUpdatedSpeciality] = useState<SpecialityData | null>(null);

    const modifySpeciality = async (updatedSpecialityData: SpecialityData) => {
        setLoading(true);
        setError(null);

        try {
            const speciality = await modifier<SpecialityData, SpecialityData>(pathKey, updatedSpecialityData);
            setUpdatedSpeciality(speciality);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { updatedSpeciality, loading, error, modifySpeciality };
};
