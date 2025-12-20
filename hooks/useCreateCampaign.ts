"use client";

import { useState, useCallback } from "react";
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

// Kampanya oluşturma payload tipi
export interface CreateCampaignPayload {
    name: string;
    type: string;
    targetAmount: number;
    description: string;
    duration: string;
    iban: string;
}

export default function useCreateCampaign() {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const createCampaign = useCallback(async (data: CreateCampaignPayload) => {
        try {
            setIsLoading(true);
            setIsError(false);
            setError(null);
            setIsSuccess(false);

            const url = API_ENDPOINTS.campaigns.createCampaign;
            await fetcher(url, {
                method: 'POST',
                payload: data,
            });

            setIsSuccess(true);
            return true;
        } catch (err: any) {
            console.error("Kampanya oluşturulurken hata:", err);
            setIsError(true);
            setError(err.message || "Kampanya oluşturulurken bir hata oluştu");
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

    return { createCampaign, isLoading, isError, error, isSuccess, reset };
}
