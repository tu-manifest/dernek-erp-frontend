"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface DeleteBudgetResult {
    success: boolean;
    data?: any;
    error?: string;
}

export default function useDeleteBudget() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteBudget = async (year: number): Promise<DeleteBudgetResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher(API_ENDPOINTS.budget.deleteByYear(year), {
                method: 'DELETE',
            });

            setIsLoading(false);
            return { success: true, data: result };
        } catch (err: any) {
            const errorMessage = err.message || 'Bütçe planı silinirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        deleteBudget,
        isLoading,
        error,
    };
}
