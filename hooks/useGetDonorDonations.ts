"use client";

import useSWR from 'swr';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

// Bağış veri tipi
export interface DonorDonation {
    id: number;
    amount: number;
    date: string;
    source: string;
    description?: string;
    transactionRef?: string;
    campaign?: {
        id: number;
        name: string;
    };
}

// Bağışçı bilgisi
export interface DonorInfo {
    id: number;
    name: string;
    type: 'Kişi' | 'Kurum';
    email?: string;
    phone?: string;
}

// API Response tipi
export interface DonorDonationsResponse {
    success: boolean;
    data: {
        donor: DonorInfo;
        donations: DonorDonation[];
        totalAmount: number;
        donationCount: number;
    };
}

export default function useGetDonorDonations(donorId: number | null) {
    const { data, error, isLoading, mutate } = useSWR<DonorDonationsResponse>(
        donorId ? API_ENDPOINTS.donors.getDonorDonations(donorId) : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
        }
    );

    return {
        donor: data?.data?.donor || null,
        donations: data?.data?.donations || [],
        totalAmount: data?.data?.totalAmount || 0,
        donationCount: data?.data?.donationCount || 0,
        isLoading,
        isError: !!error,
        refetch: mutate,
    };
}
