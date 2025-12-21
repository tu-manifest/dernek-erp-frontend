"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface CreateDonorPayload {
    name: string;
    type: 'Kişi' | 'Kurum';
    email?: string;
    phone?: string;
}

export interface CreateDonorResult {
    success: boolean;
    data?: any;
    error?: string;
}

export default function useCreateDonor() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createDonor = async (payload: CreateDonorPayload): Promise<CreateDonorResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher(API_ENDPOINTS.donors.createDonor, {
                method: 'POST',
                payload,
            });

            setIsLoading(false);
            return { success: true, data: result };
        } catch (err: any) {
            const errorMessage = err.message || 'Bağışçı eklenirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        createDonor,
        isLoading,
        error,
    };
}
