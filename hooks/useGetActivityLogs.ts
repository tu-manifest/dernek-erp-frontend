"use client";

import { useState, useEffect, useCallback } from "react";
import {
    fetchActivityLogs,
    ActivityLog,
    ActivityLogFilters,
    ActivityLogsResponse,
} from "../lib/api/activityLogService";

export interface UseGetActivityLogsReturn {
    activityLogs: ActivityLog[];
    totalCount: number;
    page: number;
    totalPages: number;
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    refetch: () => void;
    setFilters: (filters: ActivityLogFilters) => void;
}

export default function useGetActivityLogs(
    initialFilters: ActivityLogFilters = { page: 1, limit: 50 }
): UseGetActivityLogsReturn {
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(initialFilters.page || 1);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFiltersState] = useState<ActivityLogFilters>(initialFilters);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        try {
            setIsLoading(true);
            setIsError(false);
            setError(null);

            const response: ActivityLogsResponse = await fetchActivityLogs(filters);

            if (response.success && Array.isArray(response.data)) {
                setActivityLogs(response.data);
                setTotalCount(response.totalCount || 0);
                setPage(response.page || 1);
                setTotalPages(response.totalPages || 0);
            } else {
                setActivityLogs([]);
                setTotalCount(0);
                setTotalPages(0);
            }
        } catch (err: any) {
            console.error("Aktivite logları yüklenirken hata oluştu:", err);
            setIsError(true);
            setError(err.message || "Aktivite logları yüklenemedi");
            setActivityLogs([]);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const refetch = useCallback(() => {
        fetchLogs();
    }, [fetchLogs]);

    const setFilters = useCallback((newFilters: ActivityLogFilters) => {
        // Merge yapmak yerine tüm filtreleri değiştir - böylece temizlenen filtreler düzgün silinir
        setFiltersState(newFilters);
    }, []);

    return {
        activityLogs,
        totalCount,
        page,
        totalPages,
        isLoading,
        isError,
        error,
        refetch,
        setFilters,
    };
}
