"use client";

import { useState, useEffect, useCallback } from "react";
import {
    fetchRecentActivityLogs,
    ActivityLog,
    RecentActivityLogsResponse,
} from "../lib/api/activityLogService";

export default function useGetRecentActivityLogs(limit: number = 10) {
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        try {
            setIsLoading(true);
            setIsError(false);
            setError(null);

            const response: RecentActivityLogsResponse = await fetchRecentActivityLogs(limit);

            if (response.success && Array.isArray(response.data)) {
                setActivityLogs(response.data);
            } else {
                setActivityLogs([]);
            }
        } catch (err: any) {
            console.error("Aktivite logları yüklenirken hata oluştu:", err);
            setIsError(true);
            setError(err.message || "Aktivite logları yüklenemedi");
            setActivityLogs([]);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const refetch = useCallback(() => {
        fetchLogs();
    }, [fetchLogs]);

    return { activityLogs, isLoading, isError, error, refetch };
}
