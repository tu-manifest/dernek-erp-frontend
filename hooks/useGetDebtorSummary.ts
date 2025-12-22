"use client";

import useSWR from 'swr';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface DebtorInfo {
    id: number;
    fullName?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    phone?: string;
}

export interface DebtSummary {
    totalDebt: number;
    totalPaid: number;
    totalOutstanding: number;
    openDebtsCount: number;
}

export interface DebtorDebt {
    id: number;
    debtType: string;
    amount: string;
    collectedAmount: string;
    status: 'Pending' | 'Partial' | 'Paid';
    dueDate: string;
    currency: string;
}

export interface DebtorSummaryResponse {
    success: boolean;
    data: {
        debtor: DebtorInfo;
        debtorType: 'MEMBER' | 'EXTERNAL';
        summary: DebtSummary;
        debts: DebtorDebt[];
    };
}

export default function useGetDebtorSummary(
    debtorType: 'MEMBER' | 'EXTERNAL' | null,
    debtorId: number | null
) {
    const shouldFetch = debtorType && debtorId;

    const { data, error, isLoading, mutate } = useSWR<DebtorSummaryResponse>(
        shouldFetch ? API_ENDPOINTS.finance.getDebtorSummary(debtorType, debtorId) : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
        }
    );

    return {
        debtor: data?.data?.debtor || null,
        debtorType: data?.data?.debtorType || null,
        summary: data?.data?.summary || null,
        debts: data?.data?.debts || [],
        isLoading,
        isError: !!error,
        refetch: mutate,
    };
}
