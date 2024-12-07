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
 * @param appointmentId
 * @param page
 * @param limit
 * @returns An object containing the fetched appointments, loading, error state and refetch function.
 */
export const useGetAppointment = (
    initialData: Appointment | null,
    pathKey: string,
    appointmentId: string,
    page: number = 1,
    limit: number = 5
) => {
    const url = `${pathKey}/${appointmentId}?page=${page}&limit=${limit}`;

    const { data: swrData, error } = useSWR<Appointment | null>(
        url,
        fetcher,
        {
            fallbackData: initialData,
            refreshInterval: initialData ? 3600000 : 0, // 1 hour refresh if initialData exists
            revalidateOnFocus: false,                  // Disable revalidation on window focus
        });

    // Manually re-trigger re-fetch
    const refetch = async (keyword?: string) => {
        await mutate(`${url}?keyword=${keyword}`);
    };

    return {
        value: swrData || {
            results: [],
            total: 0,
            pages: 0,
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
            const appointment = await creator<AppointmentData, AppointmentData>(pathKey, newAppointmentData);
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
            const appointment = await modifier<AppointmentData, Partial<AppointmentData>>(pathKey, updatedAppointmentData);
            return appointment;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, modifyAppointment };
};
