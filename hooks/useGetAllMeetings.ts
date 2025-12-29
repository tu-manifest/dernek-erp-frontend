"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchAllMeetings, Meeting, MeetingsResponse } from "../lib/api/meetingService";

export interface MeetingStats {
    totalMeetings: number;
    plannedMeetings: number;
    completedMeetings: number;
    cancelledMeetings: number;
    thisMonthMeetings: number;
}

export default function useGetAllMeetings() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [stats, setStats] = useState<MeetingStats>({
        totalMeetings: 0,
        plannedMeetings: 0,
        completedMeetings: 0,
        cancelledMeetings: 0,
        thisMonthMeetings: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const fetchMeetings = useCallback(async () => {
        try {
            setIsLoading(true);
            setIsError(false);

            const response: MeetingsResponse = await fetchAllMeetings();

            if (response.success && Array.isArray(response.data)) {
                setMeetings(response.data);
                if (response.stats) {
                    setStats(response.stats);
                }
            } else {
                setMeetings([]);
            }
        } catch (error) {
            console.error("Toplantılar yüklenirken hata oluştu:", error);
            setIsError(true);
            setMeetings([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMeetings();
    }, [fetchMeetings]);

    // Refetch function for refreshing data after mutations
    const refetch = useCallback(() => {
        fetchMeetings();
    }, [fetchMeetings]);

    return { meetings, stats, isLoading, isError, refetch };
}
