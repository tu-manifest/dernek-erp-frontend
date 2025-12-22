"use client";

import useSWR from 'swr';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface Debt {
    id: number;
    memberId: number | null;
    externalDebtorId: string | null;
    debtorType: 'MEMBER' | 'EXTERNAL';
    debtType: string;
    amount: string;
    currency: string;
    dueDate: string;
    collectedAmount: string;
    status: 'Pending' | 'Partial' | 'Paid';
    description: string | null;
    createdAt: string;
    updatedAt: string;
    member?: {
        fullName: string;
        email: string;
    };
    externalDebtor?: {
        name: string;
        email?: string;
    } | null;
}

export interface DebtsResponse {
    success: boolean;
    data: Debt[];
}

export default function useGetAllDebts() {
    const { data, error, isLoading, mutate } = useSWR<DebtsResponse>(
        API_ENDPOINTS.finance.getAllDebts,
        fetcher,
        {
            revalidateOnFocus: false,
            refreshInterval: 30000,
            dedupingInterval: 2000,
        }
    );

    let debts: Debt[] = [];
    if (data?.success && Array.isArray(data.data)) {
        debts = data.data;
    } else if (Array.isArray(data)) {
        debts = data as unknown as Debt[];
    }

    return {
        debts,
        isLoading,
        isError: !!error,
        refetch: mutate,
    };
}
