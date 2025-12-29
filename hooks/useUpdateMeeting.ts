"use client";

import { useState, useCallback } from "react";
import { updateMeeting, UpdateMeetingPayload, MeetingResponse } from "../lib/api/meetingService";

interface UseUpdateMeetingReturn {
    update: (id: number, data: UpdateMeetingPayload) => Promise<MeetingResponse>;
    isLoading: boolean;
    error: string | null;
    reset: () => void;
}

export default function useUpdateMeeting(): UseUpdateMeetingReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = useCallback(async (id: number, data: UpdateMeetingPayload): Promise<MeetingResponse> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await updateMeeting(id, data);
            return response;
        } catch (err: any) {
            const errorMessage = err.message || "Toplantı güncellenirken bir hata oluştu.";
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

    return { update, isLoading, error, reset };
}
