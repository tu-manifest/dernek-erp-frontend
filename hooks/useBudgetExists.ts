"use client";

import useSWR from 'swr';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface BudgetExistsResponse {
    success: boolean;
    data: {
        exists: boolean;
        year: number;
    };
}

export default function useBudgetExists(year: number) {
    const { data, error, isLoading, mutate } = useSWR<BudgetExistsResponse>(
        year ? API_ENDPOINTS.budget.exists(year) : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
        }
    );

    return {
        exists: data?.data?.exists || false,
        isLoading,
        isError: !!error,
        refetch: mutate,
    };
}
