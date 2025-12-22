"use client";

import useSWR from 'swr';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface BudgetItem {
    id: number;
    type: 'gelir' | 'gider';
    category: string;
    item: string;
    amount: number;
    year: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface BudgetResponse {
    success: boolean;
    data: {
        year: number;
        gelirItems: BudgetItem[];
        giderItems: BudgetItem[];
        totalGelir: number;
        totalGider: number;
        netBalance: number;
    };
}

export default function useGetBudget(year: number) {
    const { data, error, isLoading, mutate } = useSWR<BudgetResponse>(
        year ? API_ENDPOINTS.budget.getByYear(year) : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
        }
    );

    return {
        budget: data?.data || null,
        gelirItems: data?.data?.gelirItems || [],
        giderItems: data?.data?.giderItems || [],
        totalGelir: data?.data?.totalGelir || 0,
        totalGider: data?.data?.totalGider || 0,
        netBalance: data?.data?.netBalance || 0,
        isLoading,
        isError: !!error,
        refetch: mutate,
    };
}
