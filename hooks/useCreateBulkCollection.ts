"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface CreateBulkCollectionPayload {
    debtorId: number;
    debtorType: 'MEMBER' | 'EXTERNAL';
    totalAmount: number;
    currency: string;
    paymentMethod: string;
    collectionDate: string;
    receiptNumber?: string;
    notes?: string;
    convertToDonation?: boolean;
}

export interface DebtDistribution {
    debtId: number;
    debtType: string;
    paidAmount: number;
    newStatus: 'Partial' | 'Paid';
}

export interface BulkCollectionResult {
    success: boolean;
    message?: string;
    data?: {
        totalPaid: number;
        distributedToDebts: number;
        convertedToDonation: number;
        distributions: DebtDistribution[];
        donation?: {
            id: number;
            amount: number;
        };
    };
    error?: string;
}

export default function useCreateBulkCollection() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createBulkCollection = async (payload: CreateBulkCollectionPayload): Promise<BulkCollectionResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher(API_ENDPOINTS.finance.createBulkCollection, {
                method: 'POST',
                payload,
            });

            setIsLoading(false);
            return { success: true, message: result.message, data: result.data };
        } catch (err: any) {
            const errorMessage = err.message || 'Toplu tahsilat kaydı oluşturulurken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        createBulkCollection,
        isLoading,
        error,
    };
}
