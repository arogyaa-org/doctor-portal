"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";

import { creator, fetcher, modifier } from "@/apis/apiClient";
import { Qualification, QualificationData } from "@/types/qualification";

/**
 * Hook for fetching qualifications with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch qualification data.
 * @param page - The current page number for pagination.
 * @param limit - The number of qualifications per page.
 * @returns An object containing the fetched qualifications, loading, error state, and refetch function.
 */
export const useGetQualification = (
  initialData: Qualification | null,
  pathKey: string,
  page: number = 1,
  limit: number = 5
) => {
  // Construct the URL for the API call
  const url = `${pathKey}?page=${page}&limit=${limit}`;

  // Fetch data using SWR
  const { data: swrData, error } = useSWR<Qualification | null>(url, fetcher, {
    fallbackData: initialData,
    refreshInterval: initialData ? 3600000 : 0, // Refresh every hour if initialData exists
    revalidateOnFocus: false, // Disable revalidation on window focus
  });

  // Refetch function with an optional search keyword
  const refetch = async (keyword?: string) => {
    const refetchUrl = keyword ? `${url}&keyword=${keyword}` : url;
    return await mutate(refetchUrl);
  };

  // Return structured data
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
    refetch,
  };
};

/**
 * Hook for creating a new qualification.
 *
 * @param pathKey - The API path key for creating a qualification.
 * @returns An object containing the loading state, error state, and createQualification function.
 */
export const useCreateQualification = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createQualification = async (dataObj: object) => {
    setLoading(true);
    setError(null);

    try {
      const qualification = await creator(pathKey, dataObj);
      return qualification;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, createQualification };
};

/**
 * Hook for modifying an existing qualification.
 *
 * @param pathKey - The API path key used to modify a qualification.
 * @returns An object containing the updated qualification, loading state, error state, and modifyQualification function.
 */
export const useModifyQualification = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const modifyQualification = async (
    updatedQualificationData: Partial<QualificationData>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const qualification = await modifier<QualificationData, Partial<QualificationData>>(
        pathKey,
        updatedQualificationData
      );
      return qualification;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, modifyQualification };
};
