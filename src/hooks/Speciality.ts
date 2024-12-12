"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";

import { creator, fetcher, modifier } from "@/apis/apiClient";
import { Speciality, SpecialityData } from "@/types/speciality";

/**
 * Hook for fetching Specialitys with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch speciality data.
 * @param page - The page number for pagination.
 * @param limit - The number of items per page.
 * @returns An object containing the fetched specialities, loading, error state and refetch function.
 */
export const useGetSpeciality = (
    initialData: Speciality | null,
    pathKey: string,
    page: number = 1,
    limit: number = 5
) => {
    const url = `${pathKey}?page=${page}&limit=${limit}`;
    const { data: swrData, error } = useSWR<Speciality | null>(
        url,
        fetcher,
        {
            fallbackData: initialData,
            refreshInterval: initialData ? 3600000 : 0, // Refresh every hour if initialData exists
            revalidateOnFocus: false, // Disable revalidation on window focus
        });

    const refetch = async (keyword?: string) => {
        const refetchUrl = keyword ? `${url}&keyword=${keyword}` : url;
        return await mutate(refetchUrl);
    };

    return {
        value: swrData || {
            results: [],
            count: 0,
            pages: 0,
            errorMessage: null
        },
        swrLoading: !error && !swrData,
        error,
        refetch
    };
};

export const useCreateSpeciality = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createSpeciality = async (dataObj: SpecialityData) => {
        setLoading(true);
        setError(null);
        try {
            const speciality = await creator<SpecialityData, SpecialityData>(pathKey, dataObj);
            return speciality;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, createSpeciality };
};

/**
 * Hook for modifying an existing Speciality.
 *
 * @param pathKey - The API path key used to modify a Speciality.
 * @returns An object containing the updated Speciality, loading state, error state, and the modifySpeciality function.
 */
export const useModifySpeciality = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const modifySpeciality = async (updatedSpecialityData: Partial<SpecialityData>) => {
        setLoading(true);
        setError(null);
        try {
            const speciality = await modifier<SpecialityData, Partial<SpecialityData>>(pathKey, updatedSpecialityData);
            return speciality;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, modifySpeciality };
};
