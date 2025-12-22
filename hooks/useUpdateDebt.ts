"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface UpdateDebtPayload {
    debtType?: string;
    amount?: number;
    currency?: string;
    dueDate?: string;
    description?: string;
    status?: 'Pending' | 'Partial' | 'Paid';
}

export interface UpdateDebtResult {
    success: boolean;
    data?: any;
    error?: string;
}

export default function useUpdateDebt() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateDebt = async (id: number, payload: UpdateDebtPayload): Promise<UpdateDebtResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher(API_ENDPOINTS.finance.updateDebt(id), {
                method: 'PUT',
                payload,
            });

            setIsLoading(false);
            return { success: true, data: result };
        } catch (err: any) {
            const errorMessage = err.message || 'Borç güncellenirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        updateDebt,
        isLoading,
        error,
    };
}
