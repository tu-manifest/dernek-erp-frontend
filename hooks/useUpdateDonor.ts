"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface UpdateDonorPayload {
    name?: string;
    type?: 'Kişi' | 'Kurum';
    email?: string;
    phone?: string;
}

export interface UpdateDonorResult {
    success: boolean;
    data?: any;
    error?: string;
}

export default function useUpdateDonor() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateDonor = async (id: number, payload: UpdateDonorPayload): Promise<UpdateDonorResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher(API_ENDPOINTS.donors.updateDonor(id), {
                method: 'PUT',
                payload,
            });

            setIsLoading(false);
            return { success: true, data: result };
        } catch (err: any) {
            const errorMessage = err.message || 'Bağışçı güncellenirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        updateDonor,
        isLoading,
        error,
    };
}
