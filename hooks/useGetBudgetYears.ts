"use client";

import useSWR from 'swr';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface BudgetYearsResponse {
    success: boolean;
    data: number[];
}

export default function useGetBudgetYears() {
    const { data, error, isLoading, mutate } = useSWR<BudgetYearsResponse>(
        API_ENDPOINTS.budget.getYears,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
        }
    );

    return {
        years: data?.data || [],
        isLoading,
        isError: !!error,
        refetch: mutate,
    };
}
