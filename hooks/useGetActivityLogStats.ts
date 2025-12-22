"use client";

import { useState, useEffect, useCallback } from "react";
import {
    fetchActivityLogStats,
    ActivityLogStats,
    ActivityLogStatsResponse,
} from "../lib/api/activityLogService";

export default function useGetActivityLogStats() {
    const [stats, setStats] = useState<ActivityLogStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setIsLoading(true);
            setIsError(false);
            setError(null);

            const response: ActivityLogStatsResponse = await fetchActivityLogStats();

            if (response.success && response.data) {
                setStats(response.data);
            } else {
                setStats(null);
            }
        } catch (err: any) {
            console.error("Aktivite log istatistikleri yüklenirken hata oluştu:", err);
            setIsError(true);
            setError(err.message || "İstatistikler yüklenemedi");
            setStats(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const refetch = useCallback(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, isLoading, isError, error, refetch };
}
