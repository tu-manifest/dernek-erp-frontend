"use client";

import { useState, useCallback } from "react";
import { deleteMeeting } from "../lib/api/meetingService";

interface UseDeleteMeetingReturn {
    remove: (id: number) => Promise<{ success: boolean; message: string }>;
    isLoading: boolean;
    error: string | null;
    reset: () => void;
}

export default function useDeleteMeeting(): UseDeleteMeetingReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const remove = useCallback(async (id: number): Promise<{ success: boolean; message: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await deleteMeeting(id);
            return response;
        } catch (err: any) {
            const errorMessage = err.message || "Toplantı silinirken bir hata oluştu.";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setError(null);
        setIsLoading(false);
    }, []);

    return { remove, isLoading, error, reset };
}
