"use client";

import useSWR from 'swr';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

// Bağışçı veri tipi
export interface Donor {
    id: number;
    name: string;
    type: 'Kişi' | 'Kurum';
    email?: string;
    phone?: string;
    totalDonation: number;
    donationCount: number;
    lastDonationDate?: string;
    createdAt: string;
    updatedAt?: string;
}

// API Response tipi
export interface DonorsResponse {
    success: boolean;
    data: Donor[];
    stats: DonorStats;
}

export interface DonorStats {
    totalDonors: number;
    individualDonors: number;
    corporateDonors: number;
    totalDonationAmount: number;
}

export default function useGetAllDonors() {
    const { data, error, isLoading, mutate } = useSWR<DonorsResponse>(
        API_ENDPOINTS.donors.getAllDonors,
        fetcher,
        {
            revalidateOnFocus: false,
            refreshInterval: 30000, // 30 saniye aralıklarla canlı veri akışı
            dedupingInterval: 2000,
        }
    );

    // Bağışçıları güvenli şekilde çıkar
    let donors: Donor[] = [];
    if (data?.success && Array.isArray(data.data)) {
        donors = data.data;
    } else if (Array.isArray(data)) {
        donors = data as unknown as Donor[];
    }

    // Stats'ı API'den al veya hesapla
    const stats: DonorStats = data?.stats || {
        totalDonors: donors.length,
        individualDonors: donors.filter(d => d.type === 'Kişi').length,
        corporateDonors: donors.filter(d => d.type === 'Kurum').length,
        totalDonationAmount: donors.reduce((sum, d) => sum + (d.totalDonation || 0), 0),
    };

    return {
        donors,
        stats,
        isLoading,
        isError: !!error,
        refetch: mutate,
    };
}
