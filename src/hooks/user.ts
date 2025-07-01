"use client";

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

import { creator, fetcher, modifier } from '@/apis/apiClient';
import {user, userData} from '@/types/user';
/**
 * Hook for fetching users with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch user data.
 * @param page 
 * @param limit 
 * @returns An object containing the fetched users, loading, error state, and refetch function.
 */
export const useGetuser = (
    initialData: user | null,
    pathKey: string,
    page: number = 1,
    limit: number = 5,
    keyword?: string
) => {
    const url = `${pathKey}?page=${page}&limit=${limit}&keyword=${keyword}`;
    const { data: swrData, error, isValidating } = useSWR<user | null>(
        url,
        () => fetcher<user>('user', url),
        {
            fallbackData: initialData,
            refreshInterval: initialData ? 3600000 : 0,
            revalidateOnFocus: false,
        }
    );

    const refetch = async (keyword?: string) => {
        const refetchUrl = keyword ? `${url}&keyword=${keyword}` : url;
        return await mutate(refetchUrl);
    };

    return {
        value: swrData || {
            results: [], // Default structure for an empty result
            count: 0,
            pages: 0,
            errorMessage: null
        },
        swrLoading: !error && !swrData && isValidating,
        error,
        refetch,
    };
};

/**
 * Hook for creating a new user.
 * 
 * @param pathKey - The API path key used to create a new user.
 * @returns An object containing the created user, loading state, error state, and the createuser function.
 */
export const useCreateuser = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createuser = async (newuserData: Partial<userData>) => {
        setLoading(true);
        setError(null);
        try {
            const headers = {
                "Content-Type": "multipart/form-data"
            };
            const user = await creator<user, Partial<userData>>('user', pathKey, newuserData, headers);
            return user;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, createuser };
};

/**
 * Hook for modifying an existing user.
 * 
 * @param pathKey - The API path key used to modify a user.
 * @returns An object containing the updated user, loading state, error state, and the modifyuser function.
 */
export const useModifyuser = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const modifyuser = async (updateduserData: Partial<userData>) => {
        setLoading(true);
        setError(null);
        try {
            const headers = {
                "Content-Type": "multipart/form-data"
            };
            const user = await modifier<user, Partial<userData>>('user', pathKey, updateduserData, headers);
            return user;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, modifyuser };
};
