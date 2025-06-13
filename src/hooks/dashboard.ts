"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, modifier } from "@/apis/apiClient";
import {
  Dashboard,
  DashboardStatData,
  AppointmentData,
  MonthlyChartData,
} from "@/types/dashboard";

export const useGetDashboard = (
  initialData: Dashboard | DashboardStatData[] | null,
  pathKey: string,
  page?: number,
  limit?: number,
  scope?: string,
  doctorId?: string
) => {
  const queryParams = new URLSearchParams();
  if (page !== undefined) queryParams.append("page", page.toString());
  if (limit !== undefined) queryParams.append("limit", limit.toString());
  if (scope) queryParams.append("scope", scope);
  if (doctorId) queryParams.append("doctorId", doctorId);

  const url = queryParams.toString()
    ? `${pathKey}${pathKey.includes("?") ? "&" : "?"}${queryParams.toString()}`
    : pathKey;

  const {
    data: swrData,
    error,
    isValidating,
  } = useSWR<Dashboard | DashboardStatData[]>(
    url,
    () => fetcher<Dashboard | DashboardStatData[]>("dashboard", url),
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
    }
  );

  const refetch = async (
    newScope?: string,
    newDoctorId?: string,
    newPage?: number,
    newLimit?: number
  ) => {
    const newQueryParams = new URLSearchParams();
    const pageToUse = newPage !== undefined ? newPage : page;
    const limitToUse = newLimit !== undefined ? newLimit : limit;
    if (pageToUse !== undefined)
      newQueryParams.append("page", pageToUse.toString());
    if (limitToUse !== undefined)
      newQueryParams.append("limit", limitToUse.toString());
    if (newScope) newQueryParams.append("scope", newScope);
    if (newDoctorId) newQueryParams.append("doctorId", newDoctorId);

    const newUrl = newQueryParams.toString()
      ? `${pathKey}${pathKey.includes("?") ? "&" : "?"}${newQueryParams.toString()}`
      : pathKey;
    await mutate(newUrl);
  };

  const getStats = (): DashboardStatData[] => {
    if (!swrData) return [];
    if (Array.isArray(swrData)) {
      return swrData as DashboardStatData[];
    }
    if (!swrData.data?.results) return [];
    return Array.isArray(swrData.data.results)
      ? (swrData.data.results as DashboardStatData[])
      : [];
  };

  const getAppointments = (): AppointmentData[] => {
    if (!swrData || Array.isArray(swrData)) return [];
    if (!swrData.data?.results) return [];
    return Array.isArray(swrData.data.results)
      ? (swrData.data.results as AppointmentData[])
      : [];
  };

  const getCharts = (): MonthlyChartData[] => {
    if (!swrData || Array.isArray(swrData)) return [];
    if (!swrData.data?.results) return [];
    return Array.isArray(swrData.data.results)
      ? (swrData.data.results as MonthlyChartData[])
      : [];
  };

  return {
    data: swrData || {
      statusCode: 200,
      message: "",
      data: {
        results: [],
        count: 0,
        pages: 0,
      },
    },
    loading: !error && !swrData && isValidating,
    error,
    refetch,
    getStats,
    getAppointments,
    getCharts,
    isEmpty:
      !swrData ||
      (Array.isArray(swrData)
        ? swrData.length === 0
        : !swrData.data?.results ||
          (Array.isArray(swrData.data.results) &&
            swrData.data.results.length === 0)),
  };
};

export const useModifyDashboard = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const modifyDashboard = async (updatedData: Partial<AppointmentData>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await modifier<Dashboard, Partial<AppointmentData>>(
        "dashboard",
        pathKey,
        updatedData
      );
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, modifyDashboard };
};
