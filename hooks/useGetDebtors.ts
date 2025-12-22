"use client";

import useSWR from 'swr';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface Debtor {
    id: number;
    name: string;
    type: 'MEMBER' | 'EXTERNAL'; // "MEMBER" or "EXTERNAL" from API
    isInstitution: boolean;
    totalDebt: number;
    totalPaid: number;
    totalOutstanding: number;
    debtCount: number;
}

export interface DebtorsResponse {
    success: boolean;
    data: Debtor[];
}

export default function useGetDebtors() {
    const { data, error, isLoading, mutate } = useSWR<DebtorsResponse>(
        API_ENDPOINTS.finance.getDebtors,
        fetcher,
        {
            revalidateOnFocus: false,
            refreshInterval: 0,
        }
    );

    let debtors: Debtor[] = [];
    if (data?.success && Array.isArray(data.data)) {
        debtors = data.data;
    }

    return {
        debtors,
        isLoading,
        isError: !!error,
        refetch: mutate,
    };
}
