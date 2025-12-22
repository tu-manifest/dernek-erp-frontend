"use client";

import { useState } from "react";
import { API_ENDPOINTS } from "../lib/api/endpoints";
import { FixedAsset } from "./useGetAllFixedAssets";

// Güncelleme için payload tipi
export interface UpdateFixedAssetPayload {
    registrationNo?: string;
    name?: string;
    assetClass?: string;
    assetSubClass?: string;
    brandModel?: string;
    costValue?: number;
    acquisitionDate?: string;
    invoiceNo?: string;
    supplierName?: string;
    usefulLife?: number;
    depreciationRate?: number;
    salvageValue?: number;
    depreciationStartDate?: string;
    responsiblePerson?: string;
    warrantyEndDate?: string;
    revaluationApplied?: boolean;
    description?: string;
    status?: string;
}

interface UpdateResponse {
    success: boolean;
    message?: string;
    data?: FixedAsset;
}

export default function useUpdateFixedAsset() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateAsset = async (
        id: number,
        payload: UpdateFixedAssetPayload
    ): Promise<{ success: boolean; data?: FixedAsset; error?: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(API_ENDPOINTS.fixedAssets.update(id), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(payload),
            });

            const data: UpdateResponse = await response.json();

            if (!response.ok || !data.success) {
                const errorMsg = data.message || "Varlık güncellenirken bir hata oluştu";
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }

            return { success: true, data: data.data };
        } catch (err: any) {
            const errorMsg = err.message || "Bir hata oluştu";
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        updateAsset,
        isLoading,
        error,
    };
}
