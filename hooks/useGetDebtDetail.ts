"use client";

import useSWR from 'swr';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface Collection {
    id: number;
    amountPaid: string;
    paymentMethod: string;
    receiptNumber?: string;
    collectionDate: string;
    notes?: string;
}

export interface DebtDetail {
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
    collections: Collection[];
}

export interface UnpaidDebt {
    id: number;
    debtType: string;
    amount: string;
    currency: string;
    collectedAmount: string;
}

export interface DebtDetailResponse {
    success: boolean;
    data: {
        debtDetails: DebtDetail;
        debtorName: string;
        unpaidDebts: UnpaidDebt[];
    };
}

export default function useGetDebtDetail(debtId: number | null) {
    const { data, error, isLoading, mutate } = useSWR<DebtDetailResponse>(
        debtId ? API_ENDPOINTS.finance.getDebtById(debtId) : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
        }
    );

    return {
        debtDetail: data?.data?.debtDetails || null,
        debtorName: data?.data?.debtorName || '',
        unpaidDebts: data?.data?.unpaidDebts || [],
        isLoading,
        isError: !!error,
        refetch: mutate,
    };
}
