"use client";

import useSWR from 'swr';
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

export default function useGetCampaignDonations(campaignId: number | null) {
    // campaignId null ise istek yapma
    const url = campaignId ? API_ENDPOINTS.campaigns.getCampaignDonations(campaignId) : null;

    const { data, error, isLoading, mutate } = useSWR<CampaignDonationsResponse>(
        url,
        fetcher,
        {
            revalidateOnFocus: false, // Tarayıcı odaklandığında tekrar istek atma
            refreshInterval: 10000, // 10 saniye aralıklarla veriyi yenile
            dedupingInterval: 2000, // 2 saniye içinde tekrarlanan istekleri engelle
        }
    );

    // Donations array'ini güvenli şekilde çıkar
    let donations: CampaignDonation[] = [];
    if (data?.success && Array.isArray(data.data)) {
        donations = data.data;
    }

    return {
        donations,
        count: data?.count || 0,
        isLoading,
        isError: !!error,
        error: error?.message || null,
        refetch: mutate, // Manuel yenileme için
    };
}
