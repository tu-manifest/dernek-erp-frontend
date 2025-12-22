"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface CreateBudgetPayload {
    year: number;
}

export interface CreateBudgetResult {
    success: boolean;
    data?: any;
    error?: string;
}

export default function useCreateBudget() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createBudget = async (payload: CreateBudgetPayload): Promise<CreateBudgetResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher(API_ENDPOINTS.budget.createNew, {
                method: 'POST',
                payload,
            });

            setIsLoading(false);
            return { success: true, data: result };
        } catch (err: any) {
            const errorMessage = err.message || 'Bütçe planı oluşturulurken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        createBudget,
        isLoading,
        error,
    };
}
