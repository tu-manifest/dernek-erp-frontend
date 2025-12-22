"use client";

import { useState } from "react";
import { API_ENDPOINTS } from "../lib/api/endpoints";

interface CreateGroupPayload {
    group_name: string;
    description: string;
    isActive?: boolean;
}

interface CreateGroupResponse {
    success: boolean;
    message?: string;
    data?: any;
}

export default function useCreateGroup() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createGroup = async (
        payload: CreateGroupPayload
    ): Promise<{ success: boolean; data?: any; error?: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(API_ENDPOINTS.groups.addNewGroup, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(payload),
            });

            const data: CreateGroupResponse = await response.json();

            if (!response.ok || !data.success) {
                const errorMsg = data.message || "Grup oluşturulurken bir hata oluştu";
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }

            return { success: true, data: data.data };
        } catch (err: any) {
            const errorMsg = err.message || "Bir hata oluştu";
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createGroup,
        isLoading,
        error,
    };
}
