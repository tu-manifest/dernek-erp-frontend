"use client";

import { useState, useCallback } from "react";
import { createMeeting, CreateMeetingPayload, MeetingResponse } from "../lib/api/meetingService";

interface UseCreateMeetingReturn {
    create: (data: CreateMeetingPayload) => Promise<MeetingResponse>;
    isLoading: boolean;
    error: string | null;
    reset: () => void;
}

export default function useCreateMeeting(): UseCreateMeetingReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = useCallback(async (data: CreateMeetingPayload): Promise<MeetingResponse> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await createMeeting(data);
            return response;
        } catch (err: any) {
            const errorMessage = err.message || "Toplantı oluşturulurken bir hata oluştu.";
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

    return { create, isLoading, error, reset };
}
