"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface DeleteFixedAssetResult {
    success: boolean;
    data?: any;
    error?: string;
}

export default function useDeleteFixedAsset() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteFixedAsset = async (id: number): Promise<DeleteFixedAssetResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher(API_ENDPOINTS.fixedAssets.delete(id), {
                method: 'DELETE',
            });

            setIsLoading(false);
            return { success: true, data: result };
        } catch (err: any) {
            const errorMessage = err.message || 'Sabit varlık silinirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        deleteFixedAsset,
        isLoading,
        error,
    };
}
