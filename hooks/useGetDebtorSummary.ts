"use client";

import useSWR from 'swr';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

// We can reuse the Debt interface or define a more specific one for the summary if needed.
// Based on the user request, the summary endpoint returns details. 
// Assuming the structure is similar to what we need for the detail view.
// If the summary just returns totals, we might need a different approach, 
// but the user said "detay kısmına girdiğimde görüntülemek istiyorum" and pointed to the summary endpoint.
// Let's assume the summary endpoint might return a list of debts or at least aggregate info.
// However, typically "summary" implies aggregate. 
// If the user wants to see *individual* debts in the detail view, 
// we might need to use `useGetAllDebts` filtered by this debtor OR the summary endpoint returns them.
// Let's define a flexible interface for now.

// Raw API Response Interface
interface RawDebtorSummary {
    debtor: {
        id: number;
        fullName: string; // Changed from name
        email?: string;
        phoneNumber?: string; // Changed from phone
    };
    debtorType: 'MEMBER' | 'EXTERNAL';
    summary: {
        totalDebt: number;
        totalPaid: number;
        totalOutstanding: number;
        openDebtsCount: number;
    };
    debts: {
        id: number;
        debtType: string;
        amount: string; // API returns string
        collectedAmount: string; // API returns string
        status: 'Pending' | 'Partial' | 'Paid';
        dueDate: string;
        currency: string;
    }[];
}

interface RawDebtorSummaryResponse {
    success: boolean;
    data: RawDebtorSummary;
}

// UI Interface (Clean)
export interface DebtorSummary {
    debtor: {
        id: number;
        name: string;
        type: 'MEMBER' | 'EXTERNAL';
        email?: string;
        phone?: string;
    };
    totalDebt: number;
    totalPaid: number;
    remainingDebt: number;
    debts: {
        id: number;
        debtType: string;
        amount: number;
        collectedAmount: number;
        remainingAmount: number;
        dueDate: string;
        status: 'Pending' | 'Partial' | 'Paid';
        currency: string;
    }[];
}

export default function useGetDebtorSummary(type: 'MEMBER' | 'EXTERNAL', id: number | null) {
    const shouldFetch = type && id;

    const { data: rawData, error, isLoading, mutate } = useSWR<RawDebtorSummaryResponse>(
        shouldFetch ? API_ENDPOINTS.finance.getDebtorSummary(type, id!) : null,
        fetcher
    );

    // Transform Raw Data to UI Interface
    let summary: DebtorSummary | undefined = undefined;

    if (rawData?.success && rawData.data) {
        const d = rawData.data;
        summary = {
            debtor: {
                id: d.debtor.id,
                name: d.debtor.fullName,
                type: d.debtorType,
                email: d.debtor.email,
                phone: d.debtor.phoneNumber,
            },
            totalDebt: d.summary.totalDebt,
            totalPaid: d.summary.totalPaid,
            remainingDebt: d.summary.totalOutstanding,
            debts: d.debts.map(debt => {
                const amount = parseFloat(debt.amount);
                const collectedAmount = parseFloat(debt.collectedAmount);
                return {
                    id: debt.id,
                    debtType: debt.debtType,
                    amount: amount,
                    collectedAmount: collectedAmount,
                    remainingAmount: amount - collectedAmount,
                    dueDate: debt.dueDate,
                    status: debt.status,
                    currency: debt.currency,
                };
            }),
        };
    }

    return {
        summary,
        isLoading,
        isError: !!error,
        refetch: mutate,
    };
}
