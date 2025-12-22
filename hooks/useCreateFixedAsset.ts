"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface CreateFixedAssetPayload {
    registrationNo: string;
    name: string;
    assetClass: string;
    assetSubClass: string;
    brandModel?: string;
    costValue: number;
    acquisitionDate: string;
    invoiceNo?: string;
    supplierName?: string;
    usefulLife: number;
    depreciationRate: number;
    salvageValue?: number;
    depreciationStartDate: string;
    responsiblePerson?: string;
    warrantyEndDate?: string;
    revaluationApplied?: boolean;
    description?: string;
}

export interface CreateFixedAssetResult {
    success: boolean;
    data?: any;
    error?: string;
}

export default function useCreateFixedAsset() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createFixedAsset = async (payload: CreateFixedAssetPayload): Promise<CreateFixedAssetResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher(API_ENDPOINTS.fixedAssets.create, {
                method: 'POST',
                payload,
            });

            setIsLoading(false);
            return { success: true, data: result };
        } catch (err: any) {
            const errorMessage = err.message || 'Sabit varlık oluşturulurken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        createFixedAsset,
        isLoading,
        error,
    };
}
