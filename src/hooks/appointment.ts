"use client";

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

import { creator, fetcher, modifier } from "@/apis/apiClient";
import { AppointmentData, Appointment } from "@/types/appointment";

interface AppointmentFilters {
  dateFilter?: string;
  statusFilter?: string;
  search?: string;
}

/**
 * Hook for fetching appointments with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch customer data.
 * @param appointmentId
 * @param page
 * @param limit
 * @param filters - Object containing dateFilter, statusFilter, and search
 * @returns An object containing the fetched appointments, loading, error state and refetch function.
 */
export const useGetAppointment = (
  initialData: Appointment | null,
  pathKey: string,
  appointmentId?: string,
  page: number = 1,
  limit: number = 5,
  filters?: AppointmentFilters
) => {
  const { dateFilter, statusFilter, search } = filters || {};

  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  if (dateFilter) queryParams.append("dateFilter", dateFilter);
  if (statusFilter) queryParams.append("statusFilter", statusFilter);
  if (search) queryParams.append("search", search);

  const url = appointmentId
    ? `${pathKey}/${appointmentId}?${queryParams.toString()}`
    : `${pathKey}?${queryParams.toString()}`;

  const {
    data: swrData,
    error,
    isValidating,
  } = useSWR<Appointment | null>(url, () => fetcher("appointment", url), {
    fallbackData: initialData,
    refreshInterval: initialData ? 3600000 : 0,
    revalidateOnFocus: false,
  });

  const refetch = async (newFilters?: AppointmentFilters) => {
    const newQueryParams = new URLSearchParams();
    newQueryParams.append("page", page.toString());
    newQueryParams.append("limit", limit.toString());
    if (newFilters?.dateFilter)
      newQueryParams.append("dateFilter", newFilters.dateFilter);
    if (newFilters?.statusFilter)
      newQueryParams.append("statusFilter", newFilters.statusFilter);
    if (newFilters?.search) newQueryParams.append("search", newFilters.search);

    const newUrl = appointmentId
      ? `${pathKey}/${appointmentId}?${newQueryParams.toString()}`
      : `${pathKey}?${newQueryParams.toString()}`;

    await mutate(newUrl);
  };

  return {
    value: swrData || {
      results: [],
      total: 0,
      pages: 0,
      errorMessage: null
    },
    swrLoading: !error && !swrData && isValidating,
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
