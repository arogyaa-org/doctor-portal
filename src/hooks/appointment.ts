"use client";

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

import { creator, fetcher, modifier } from '@/apis/apiClient';
import { AppointmentData, Appointment } from '@/types/appointment';

/**
 * Hook for fetching appointments with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch customer data.
 * @param page - The page number for pagination.
 * @param limit - The number of items per page.
 * @param searchQuery - (Optional) The search query for filtering results.
 * @returns An object containing the fetched appointments, loading, error state and refetch function.
 */
export const useGetAppointment = (
    initialData: Appointment | null,
    pathKey: string,
    page: number = 1,
    limit: number = 5,
    searchQuery: string = ""
) => {
    const url = `${pathKey}?page=${page}&limit=${limit}${searchQuery ? `&search=${searchQuery}` : ""}`;

    const { data: swrData, error } = useSWR<Appointment | null>(
        url,
        () => fetcher('appointment', url),
        {
            fallbackData: initialData,
            refreshInterval: initialData ? 3600000 : 0,
            revalidateOnFocus: false,
        });

        const refetch = async (query?: string) => {
            const refetchUrl = query
              ? `${pathKey}?page=${page}&limit=${limit}&search=${query}`
              : url;
            return await mutate(refetchUrl);
          };
        

    return {
        value: swrData || {
            results: [],
            total: 0,
            pages: 0,
            errorMessage: null
        },
        swrLoading: !error && !swrData,
        error,
        refetch
    };
};

/**
 * Hook for creating a new appointment.
 * 
 * @param pathKey - The API path key used to create a new appointment.
 * @returns An object containing the created appointment, loading state, error state, and the createAppointment function.
 */
export const useCreateAppointment = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createAppointment = async (newAppointmentData: AppointmentData) => {
        setLoading(true);
        setError(null);
        try {
            const appointment = await creator<AppointmentData, AppointmentData>(
                'appointment',
                pathKey,
                newAppointmentData
            );
            return appointment;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, createAppointment };
};

/**
 * Hook for modifying an existing appointment.
 * 
 * @param pathKey - The API path key used to modify a appointment.
 * @returns An object containing the updated appointment, loading state, error state, and the modifyAppointment function.
 */
export const useModifyAppointment = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const modifyAppointment = async (updatedAppointmentData: Partial<AppointmentData>) => {
        setLoading(true);
        setError(null);
        try {
            const appointment = await modifier<AppointmentData, Partial<AppointmentData>>(
                'appointment',
                pathKey,
                updatedAppointmentData
            );
            return appointment;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, modifyAppointment };
};
