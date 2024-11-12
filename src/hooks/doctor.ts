"use client";

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

import { creator, fetcher, modifier } from '@/apis/apiClient';
import { DoctorData } from '@/types/doctor';

/**
 * Hook for fetching doctors with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch doctor data.
 * @param page - The page number for pagination.
 * @param limit - The number of items per page.
 * @returns An object containing the fetched doctors, loading, error state, and refetch function.
 */
export const useGetDoctor = (
    initialData: DoctorData[] | null,
    pathKey: string,
    page: number = 1,
    limit: number = 5
) => {
    const url = `${pathKey}?page=${page}&limit=${limit}`;

    const { data: swrData, error } = useSWR<DoctorData[] | null>(
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
        await mutate(`${url}&keyword=${keyword}`);
    };

    return {
        value: swrData || [],
        swrLoading: !error && !swrData,
        error,
        refetch
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
    const [createdDoctor, setCreatedDoctor] = useState<DoctorData | null>(null);

    const createDoctor = async (newDoctorData: DoctorData) => {
        setLoading(true);
        setError(null);

        try {
            const doctor = await creator<DoctorData, DoctorData>(pathKey, newDoctorData);
            setCreatedDoctor(doctor);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { createdDoctor, loading, error, createDoctor };
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
    const [updatedDoctor, setUpdatedDoctor] = useState<DoctorData | null>(null);

    const modifyDoctor = async (updatedDoctorData: DoctorData) => {
        setLoading(true);
        setError(null);

        try {
            const doctor = await modifier<DoctorData, DoctorData>(pathKey, updatedDoctorData);
            setUpdatedDoctor(doctor);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { updatedDoctor, loading, error, modifyDoctor };
};
