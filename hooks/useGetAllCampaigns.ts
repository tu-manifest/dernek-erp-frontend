"use client";

import useSWR from 'swr';
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
    const { data, error, isLoading, mutate } = useSWR<CampaignsResponse>(
        API_ENDPOINTS.campaigns.getAllCampaigns,
        fetcher,
        {
            revalidateOnFocus: false, // Tarayıcı odaklandığında tekrar istek atma
            refreshInterval: 30000, // 30 saniye aralıklarla canlı veri akışı
            dedupingInterval: 2000, // 2 saniye içinde tekrarlanan istekleri engelle
        }
    );

    // Kampanyaları güvenli şekilde çıkar
    let campaigns: Campaign[] = [];
    if (data?.success && Array.isArray(data.data)) {
        campaigns = data.data;
    } else if (Array.isArray(data)) {
        campaigns = data;
    }

    // İstatistikleri hesapla
    const stats: CampaignStats = {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
        totalTarget: campaigns.reduce((sum, c) => sum + (c.targetAmount || 0), 0),
        totalCollected: campaigns.reduce((sum, c) => sum + (c.collectedAmount || 0), 0),
    };

    return {
        campaigns,
        stats,
        isLoading,
        isError: !!error,
        refetch: mutate, // Manuel yenileme için
    };
}
