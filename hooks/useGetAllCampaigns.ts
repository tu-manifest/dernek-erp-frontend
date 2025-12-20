"use client";

import { useState, useEffect, useCallback } from "react";
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

// Kampanya veri tipi
export interface Campaign {
    id: number;
    name: string;
    type: string;
    targetAmount: number;
    collectedAmount?: number;
    description: string;
    duration: string;
    iban: string;
    status?: 'active' | 'completed' | 'paused';
    createdAt?: string;
    updatedAt?: string;
}

// API Response tipi
export interface CampaignsResponse {
    success: boolean;
    count: number;
    data: Campaign[];
}

export interface CampaignStats {
    totalCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    totalTarget: number;
    totalCollected: number;
}

export default function useGetAllCampaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [stats, setStats] = useState<CampaignStats>({
        totalCampaigns: 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        totalTarget: 0,
        totalCollected: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const fetchCampaigns = useCallback(async () => {
        try {
            setIsLoading(true);
            setIsError(false);

            const url = API_ENDPOINTS.campaigns.getAllCampaigns;
            const response: CampaignsResponse = await fetcher(url, { method: 'GET' });

            if (response.success && Array.isArray(response.data)) {
                setCampaigns(response.data);

                // İstatistikleri hesapla
                const calculatedStats: CampaignStats = {
                    totalCampaigns: response.data.length,
                    activeCampaigns: response.data.filter(c => c.status === 'active').length,
                    completedCampaigns: response.data.filter(c => c.status === 'completed').length,
                    totalTarget: response.data.reduce((sum, c) => sum + (c.targetAmount || 0), 0),
                    totalCollected: response.data.reduce((sum, c) => sum + (c.collectedAmount || 0), 0),
                };
                setStats(calculatedStats);
            } else if (Array.isArray(response)) {
                // Eğer response direkt array olarak gelirse
                setCampaigns(response);
            } else {
                setCampaigns([]);
            }
        } catch (error) {
            console.error("Kampanyalar yüklenirken hata oluştu:", error);
            setIsError(true);
            setCampaigns([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    // Refetch function for refreshing data after mutations
    const refetch = useCallback(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    return { campaigns, stats, isLoading, isError, refetch };
}
