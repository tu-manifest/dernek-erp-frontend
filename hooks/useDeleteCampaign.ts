"use client";

import { useState, useCallback } from "react";
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export default function useDeleteCampaign() {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const deleteCampaign = useCallback(async (campaignId: number) => {
        try {
            setIsLoading(true);
            setIsError(false);
            setError(null);
            setIsSuccess(false);

            const url = API_ENDPOINTS.campaigns.deleteCampaign(campaignId);
            await fetcher(url, { method: 'DELETE' });

            setIsSuccess(true);
            return true;
        } catch (err: any) {
            console.error("Kampanya silinirken hata:", err);
            setIsError(true);
            setError(err.message || "Kampanya silinirken bir hata oluştu");
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

    return { deleteCampaign, isLoading, isError, error, isSuccess, reset };
}
