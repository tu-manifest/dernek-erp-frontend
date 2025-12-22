"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface BudgetItemPayload {
    type: 'gelir' | 'gider';
    category: string;
    item: string;
    amount: number;
}

export interface SaveBudgetPayload {
    year: number;
    items: BudgetItemPayload[];
}

export interface SaveBudgetResult {
    success: boolean;
    data?: any;
    error?: string;
}

export default function useSaveBudget() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const saveBudget = async (payload: SaveBudgetPayload): Promise<SaveBudgetResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher(API_ENDPOINTS.budget.save, {
                method: 'PUT',
                payload,
            });

            setIsLoading(false);
            return { success: true, data: result };
        } catch (err: any) {
            const errorMessage = err.message || 'Bütçe planı kaydedilirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        saveBudget,
        isLoading,
        error,
    };
}
