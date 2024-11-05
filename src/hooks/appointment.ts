"use client"
import { useState } from 'react';
import useSWR from 'swr';

import { creator, fetcher, modifier } from '@/apis/apiClient';
import { Appointment } from '@/types/appointment';

/**
 * Hook for fetching appointments with SWR (stale-while-revalidate) strategy.
 * 
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch appointment data.
 * @returns An object contFaining the fetched appointments, loading state, and error state.
 */
export const useGetAppointment = (initialData: Appointment[], pathKey: string) => {
    const { data: swrData, error } = useSWR<Appointment[]>(pathKey, fetcher, {
        fallbackData: initialData,
        refreshInterval: initialData ? 3600000 : 0, // 1 hour refresh if initialData exists
        revalidateOnFocus: false,                  // Disable revalidation on window focus
    });

    return { data: swrData || [], swrLoading: !error && !swrData, error };
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
    const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

    const createAppointment = async (newAppointmentData: Appointment) => {
        setLoading(true);
        setError(null);

        try {
            const appointment = await creator<Appointment, Appointment>(pathKey, newAppointmentData);
            setCreatedAppointment(appointment);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { createdAppointment, loading, error, createAppointment };
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
    const [updatedAppointment, setUpdatedAppointment] = useState<Appointment | null>(null);

    const modifyAppointment = async (updatedAppointmentData: Appointment) => {
        setLoading(true);
        setError(null);

        try {
            const appointment = await modifier<Appointment, Appointment>(pathKey, updatedAppointmentData);
            setUpdatedAppointment(appointment);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { updatedAppointment, loading, error, modifyAppointment };
};
