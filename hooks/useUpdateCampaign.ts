"use client";

import { useState, useCallback } from "react";
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

// Kampanya güncelleme payload tipi
export interface UpdateCampaignPayload {
    name?: string;
    type?: string;
    targetAmount?: number;
    description?: string;
    duration?: string;
    iban?: string;
}

export default function useUpdateCampaign() {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const updateCampaign = useCallback(async (campaignId: number, data: UpdateCampaignPayload) => {
        try {
            setIsLoading(true);
            setIsError(false);
            setError(null);
            setIsSuccess(false);

            const url = API_ENDPOINTS.campaigns.updateCampaign(campaignId);
            await fetcher(url, {
                method: 'PUT',
                payload: data,
            });

            setIsSuccess(true);
            return true;
        } catch (err: any) {
            console.error("Kampanya güncellenirken hata:", err);
            setIsError(true);
            setError(err.message || "Kampanya güncellenirken bir hata oluştu");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setIsLoading(false);
        setIsError(false);
        setError(null);
        setIsSuccess(false);
    }, []);

    return { updateCampaign, isLoading, isError, error, isSuccess, reset };
}
