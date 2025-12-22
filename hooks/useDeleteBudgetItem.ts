"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface DeleteBudgetItemResult {
    success: boolean;
    data?: any;
    error?: string;
}

export default function useDeleteBudgetItem() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteBudgetItem = async (id: number): Promise<DeleteBudgetItemResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher(API_ENDPOINTS.budget.deleteItem(id), {
                method: 'DELETE',
            });

            setIsLoading(false);
            return { success: true, data: result };
        } catch (err: any) {
            const errorMessage = err.message || 'Bütçe kalemi silinirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        deleteBudgetItem,
        isLoading,
        error,
    };
}
