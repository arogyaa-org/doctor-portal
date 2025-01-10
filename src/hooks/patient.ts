"use client";

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

import { creator, fetcher, modifier } from '@/apis/apiClient';
import { PatientData, Patient } from '@/types/patient';

/**
 * Hook for fetching patients with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch patient data.
 * @param page - The page number for pagination.
 * @param limit - The number of items per page.
 * @param searchQuery - (Optional) The search query for filtering results.
 * @returns An object containing the fetched patients, loading, error state, and refetch function.
 */
export const useGetPatient = (
    initialData: Patient | null,
    pathKey: string,
    page: number = 1,
    limit: number = 5,
    searchQuery: string = ""
) => {
    const url = `${pathKey}?page=${page}&limit=${limit}${searchQuery.trim() ? `&search=${searchQuery.trim()}` : ""}`;

    const { data: swrData, error, isValidating } = useSWR<Patient | null>(
        url,
        () => fetcher('patient', url),
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
            results: [],
            total: 0,
            pages: 0,
        },
        swrLoading: !error && !swrData ,
        error,
        refetch,
    };
};


/**
 * Hook for creating a new patient.
 * 
 * @param pathKey - The API path key used to create a new patient.
 * @returns An object containing the created patient, loading state, error state, and the createPatient function.
 */
export const useCreatePatient = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createPatient = async (newPatientData: PatientData) => {
        setLoading(true);
        setError(null);

        try {
            const patient = await creator<PatientData, PatientData>('patient', pathKey, newPatientData);
            return patient;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, createPatient };
};

/**
 * Hook for modifying an existing patient.
 * 
 * @param pathKey - The API path key used to modify a patient.
 * @returns An object containing the updated patient, loading state, error state, and the modifyPatient function.
 */
export const useModifyPatient = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const modifyPatient = async (updatedPatientData: Partial<PatientData>) => {
        setLoading(true);
        setError(null);

        try {
            const patient = await modifier<PatientData, Partial<PatientData>>('patient', pathKey, updatedPatientData);
            return patient;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, modifyPatient };
};
