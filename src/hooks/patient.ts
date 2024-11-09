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
 * @param patientId - The ID of the patient to fetch.
 * @param page - The page number for pagination.
 * @param limit - The number of items per page.
 * @returns An object containing the fetched patients, loading, error state and refetch function.
 */
export const useGetPatient = (
    initialData: Patient | null,
    pathKey: string,
    patientId: string,
    page: number = 1,
    limit: number = 5
) => {
    const url = `${pathKey}/${patientId}?page=${page}&limit=${limit}`;

    const { data: swrData, error } = useSWR<Patient | null>(
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
 * Hook for creating a new patient.
 * 
 * @param pathKey - The API path key used to create a new patient.
 * @returns An object containing the created patient, loading state, error state, and the createPatient function.
 */
export const useCreatePatient = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [createdPatient, setCreatedPatient] = useState<PatientData | null>(null);

    const createPatient = async (newPatientData: PatientData) => {
        setLoading(true);
        setError(null);

        try {
            const patient = await creator<PatientData, PatientData>(pathKey, newPatientData);
            setCreatedPatient(patient);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { createdPatient, loading, error, createPatient };
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
    const [updatedPatient, setUpdatedPatient] = useState<PatientData | null>(null);

    const modifyPatient = async (updatedPatientData: PatientData) => {
        setLoading(true);
        setError(null);

        try {
            const patient = await modifier<PatientData, PatientData>(pathKey, updatedPatientData);
            setUpdatedPatient(patient);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { updatedPatient, loading, error, modifyPatient };
};
