"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";

import { creator, fetcher, modifier } from "@/apis/apiClient";
import { Doctor, DoctorData } from "@/types/doctor";

/**
 * Hook for fetching doctors with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch doctor data.
 * @param page
 * @param limit
 * @returns An object containing the fetched doctors, loading, error state, and refetch function.
 */
export const useGetDoctor = (
  initialData: Doctor | null,
  pathKey: string,
  page: number = 1,
  limit: number = 5,
  keyword?: string,
  isVerified?: boolean
) => {
  const queryParams = new URLSearchParams();
  queryParams.set("page", String(page));
  queryParams.set("limit", String(limit));
  if (keyword) queryParams.set("keyword", keyword);
  if (typeof isVerified === "boolean") {
    queryParams.set("isVerified", String(isVerified));
  }

  const url = `${pathKey}?${queryParams.toString()}`;

  const {
    data: swrData,
    error,
    isValidating,
  } = useSWR<Doctor | null>(url, () => fetcher<Doctor>("doctor", url), {
    fallbackData: initialData,
    refreshInterval: initialData ? 3600000 : 0,
    revalidateOnFocus: false,
  });

  const refetch = async (customKeyword?: string) => {
    const params = new URLSearchParams(queryParams.toString());
    if (customKeyword) {
      params.set("keyword", customKeyword);
    }
    const refetchUrl = `${pathKey}?${params.toString()}`;
    return await mutate(refetchUrl);
  };

  return {
    value: swrData || {
      results: [],
      count: 0,
      pages: 0,
      errorMessage: null,
    },
    swrLoading: !error && !swrData && isValidating,
    error,
    refetch,
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

  const createDoctor = async (newDoctorData: Partial<DoctorData>) => {
    setLoading(true);
    setError(null);
    try {
      const headers = {
        "Content-Type": "multipart/form-data",
      };
      const doctor = await creator<Doctor, Partial<DoctorData>>(
        "doctor",
        pathKey,
        newDoctorData,
        headers
      );
      return doctor;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  return { loading, error, createDoctor };
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

  const modifyDoctor = async (updatedDoctorData: Partial<DoctorData>) => {
    setLoading(true);
    setError(null);
    try {
      const headers = {
        "Content-Type": "multipart/form-data",
      };
      const doctor = await modifier<Doctor, Partial<DoctorData>>(
        "doctor",
        pathKey,
        updatedDoctorData,
        headers
      );
      return doctor;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  return { loading, error, modifyDoctor };
};

/**
 * Hook for public doctor signup via Firebase OTP and minimal data.
 *
 * @param pathKey - The API path key (e.g., '/public-signup-doctor').
 * @returns An object containing the loading state, error state, and the signup function.
 */
export const usePublicDoctorSignup = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signupDoctor = async (publicDoctorData: {
    username: string;
    email: string;
    contact: string;
    bio?: string;
    firebaseIdToken: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicDoctorData.firebaseIdToken}`,
      };
      const response = await creator<Doctor, typeof publicDoctorData>(
        "doctor",
        pathKey,
        publicDoctorData,
        headers
      );

      // Explicitly validate statusCode from response
      if (
        response &&
        typeof response === "object" &&
        "statusCode" in response
      ) {
        if (response.statusCode >= 400) {
          const error = new Error(
            response.message || `Error ${response.statusCode}`
          );
          error.name = `HTTP${response.statusCode}`;
          throw error;
        }
      }

      return response;
    } catch (err: any) {
      let errorMessage = "Signup failed";
      let statusCode = 500;

      // Check if it's an Axios error or custom thrown error
      if (err?.response?.data) {
        const data = err.response.data;
        errorMessage = data.message || errorMessage;
        statusCode = err.response.status || statusCode;
      } else if (err?.message) {
        errorMessage = err.message;
        statusCode = err.statusCode || 500;
      }

      const error = new Error(errorMessage);
      error.name = `HTTP${statusCode}`;
      setError(error);
      throw error;
    }
  };

  return { signupDoctor, loading, error };
};
