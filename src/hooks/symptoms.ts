"use client";

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

import { creator, fetcher, modifier } from '@/apis/apiClient';
import { SymptomData, Symptoms } from '@/types/symptoms';

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
    initialData: Symptoms | null,
    pathKey: string,
    symptomId: string,
    page: number = 1,
    limit: number = 5
) => {
    const url = `${pathKey}/${symptomId}?page=${page}&limit=${limit}`;

    const { data: swrData, error } = useSWR<Symptoms | null>(
        url,
        fetcher,
        {
            fallbackData: initialData,
            refreshInterval: initialData ? 3600000 : 0, // 1 hour refresh if initialData exists
            revalidateOnFocus: false,                  // Disable revalidation on window focus
        });

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
 * Hook for creating a new symptom.
 * 
 * @param pathKey - The API path key used to create a new symptom.
 * @returns An object containing the created symptom, loading state, error state, and the createSymptom function.
 */
export const useCreateSymptom = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [createdSymptom, setCreatedSymptom] = useState<SymptomData | null>(null);

    const createSymptom = async (newSymptomData: SymptomData) => {
        setLoading(true);
        setError(null);

        try {
            const symptom = await creator<SymptomData, SymptomData>(pathKey, newSymptomData);
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
export const useModifySymptom = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [updatedSymptom, setUpdatedSymptom] = useState<SymptomData | null>(null);

    const modifySymptom = async (updatedSymptomData: SymptomData) => {
        setLoading(true);
        setError(null);

        try {
            const symptom = await modifier<SymptomData, SymptomData>(pathKey, updatedSymptomData);
            setUpdatedSymptom(symptom);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { updatedSymptom, loading, error, modifySymptom };
};
