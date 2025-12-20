"use client";

import { useState, useCallback } from "react";
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

// Bağış veri tipi
export interface CampaignDonation {
    id: number;
    donationAmount: string;
    donationDate: string;
    senderName: string;
    transactionRef: string;
    source: string;
    description: string;
}

// API Response tipi
export interface CampaignDonationsResponse {
    success: boolean;
    count: number;
    data: CampaignDonation[];
}

export default function useGetCampaignDonations() {
    const [donations, setDonations] = useState<CampaignDonation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDonations = useCallback(async (campaignId: number) => {
        try {
            setIsLoading(true);
            setIsError(false);
            setError(null);

            const url = API_ENDPOINTS.campaigns.getCampaignDonations(campaignId);
            const response: CampaignDonationsResponse = await fetcher(url, { method: 'GET' });

            if (response.success && Array.isArray(response.data)) {
                setDonations(response.data);
            } else {
                setDonations([]);
            }
        } catch (err: any) {
            console.error("Bağışlar yüklenirken hata:", err);
            setIsError(true);
            setError(err.message || "Bağışlar yüklenirken bir hata oluştu");
            setDonations([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setDonations([]);
        setIsLoading(false);
        setIsError(false);
        setError(null);
    }, []);

    return { donations, isLoading, isError, error, fetchDonations, reset };
}
