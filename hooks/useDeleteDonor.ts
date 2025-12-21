"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface DeleteDonorResult {
    success: boolean;
    error?: string;
}

export default function useDeleteDonor() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteDonor = async (id: number): Promise<DeleteDonorResult> => {
        setIsLoading(true);
        setError(null);

        try {
            await fetcher(API_ENDPOINTS.donors.deleteDonor(id), {
                method: 'DELETE',
            });

            setIsLoading(false);
            return { success: true };
        } catch (err: any) {
            const errorMessage = err.message || 'Bağışçı silinirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        deleteDonor,
        isLoading,
        error,
    };
}
