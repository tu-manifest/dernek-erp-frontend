"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchAllEvents, Event, EventsResponse } from "../lib/api/eventService";

export interface EventStats {
    totalEvents: number;
    plannedEvents: number;
    completedEvents: number;
    onlineEvents: number;
    offlineEvents: number;
}

export default function useGetAllEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [stats, setStats] = useState<EventStats>({
        totalEvents: 0,
        plannedEvents: 0,
        completedEvents: 0,
        onlineEvents: 0,
        offlineEvents: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const fetchEvents = useCallback(async () => {
        try {
            setIsLoading(true);
            setIsError(false);

            const response: EventsResponse = await fetchAllEvents();

            if (response.success && Array.isArray(response.data)) {
                setEvents(response.data);
                if (response.stats) {
                    setStats(response.stats);
                }
            } else {
                setEvents([]);
            }
        } catch (error) {
            console.error("Etkinlikler yüklenirken hata oluştu:", error);
            setIsError(true);
            setEvents([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Refetch function for refreshing data after mutations
    const refetch = useCallback(() => {
        fetchEvents();
    }, [fetchEvents]);

    return { events, stats, isLoading, isError, refetch };
}
