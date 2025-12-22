"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

// Status seçenekleri
export type FixedAssetStatus = 'Kullanımda' | 'Arızalı' | 'Hurdaya Çekilmiş';

export const FIXED_ASSET_STATUS_OPTIONS: { value: FixedAssetStatus; label: string; color: string }[] = [
    { value: 'Kullanımda', label: 'Kullanımda', color: 'green' },
    { value: 'Arızalı', label: 'Arızalı', color: 'yellow' },
    { value: 'Hurdaya Çekilmiş', label: 'Hurdaya Çekilmiş', color: 'red' },
];

export interface UpdateStatusPayload {
    status: FixedAssetStatus;
}

export interface UpdateStatusResult {
    success: boolean;
    data?: any;
    error?: string;
}

export default function useUpdateFixedAssetStatus() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateStatus = async (id: number, status: FixedAssetStatus): Promise<UpdateStatusResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher(API_ENDPOINTS.fixedAssets.updateStatus(id), {
                method: 'PATCH',
                payload: { status },
            });

            setIsLoading(false);
            return { success: true, data: result };
        } catch (err: any) {
            const errorMessage = err.message || 'Durum güncellenirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        updateStatus,
        isLoading,
        error,
    };
}
