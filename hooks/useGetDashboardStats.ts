"use client";

import useSWR from "swr";
import fetcher from "@/lib/api/fetcher";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export interface DashboardStats {
    totalMembers: number;
    activeEvents: number;
    totalDocuments: number;
    monthlyIncome: number;
    period: {
        month: string;
        year: number;
    };
}

interface DashboardStatsResponse {
    success: boolean;
    data: DashboardStats;
}

export default function useGetDashboardStats() {
    const { data, error, isLoading, mutate } = useSWR<DashboardStatsResponse>(
        API_ENDPOINTS.dashboard.stats,
        (url: string) => fetcher(url),
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // 1 dakika cache
        }
    );

    return {
        stats: data?.data || null,
        isLoading,
        isError: !!error,
        error: error?.message,
        refetch: mutate,
    };
}
