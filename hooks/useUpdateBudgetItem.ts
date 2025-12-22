"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface UpdateBudgetItemPayload {
    category?: string;
    item?: string;
    amount?: number;
}

export interface UpdateBudgetItemResult {
    success: boolean;
    data?: any;
    error?: string;
}

export default function useUpdateBudgetItem() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateBudgetItem = async (id: number, payload: UpdateBudgetItemPayload): Promise<UpdateBudgetItemResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher(API_ENDPOINTS.budget.updateItem(id), {
                method: 'PUT',
                payload,
            });

            setIsLoading(false);
            return { success: true, data: result };
        } catch (err: any) {
            const errorMessage = err.message || 'Bütçe kalemi güncellenirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        updateBudgetItem,
        isLoading,
        error,
    };
}
