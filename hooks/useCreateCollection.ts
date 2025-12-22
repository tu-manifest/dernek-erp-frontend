"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface CreateCollectionPayload {
    debtId: string | number;
    amountPaid: number;
    paymentMethod: string;
    receiptNumber?: string;
    collectionDate: string;
    notes?: string;
}

export interface CreateCollectionResult {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
}

export default function useCreateCollection() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createCollection = async (payload: CreateCollectionPayload): Promise<CreateCollectionResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher(API_ENDPOINTS.finance.createCollection, {
                method: 'POST',
                payload,
            });

            setIsLoading(false);
            return { success: true, message: result.message, data: result.data };
        } catch (err: any) {
            const errorMessage = err.message || 'Tahsilat kaydı oluşturulurken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        createCollection,
        isLoading,
        error,
    };
}
