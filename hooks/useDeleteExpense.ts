"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface DeleteExpenseResult {
    success: boolean;
    error?: string;
}

export default function useDeleteExpense() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteExpense = async (id: number): Promise<DeleteExpenseResult> => {
        setIsLoading(true);
        setError(null);

        try {
            await fetcher(API_ENDPOINTS.expenses.delete(id), {
                method: 'DELETE',
            });

            setIsLoading(false);
            return { success: true };
        } catch (err: any) {
            const errorMessage = err.message || 'Gider silinirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        deleteExpense,
        isLoading,
        error,
    };
}
