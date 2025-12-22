"use client";

import { useState } from "react";
import { API_ENDPOINTS } from "../lib/api/endpoints";

interface UpdateGroupPayload {
    group_name?: string;
    description?: string;
    isActive?: boolean;
}

interface UpdateGroupResponse {
    success: boolean;
    message?: string;
    data?: any;
}

export default function useUpdateGroup() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateGroup = async (
        id: number,
        payload: UpdateGroupPayload
    ): Promise<{ success: boolean; data?: any; error?: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(API_ENDPOINTS.groups.updateGroup(String(id)), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(payload),
            });

            const data: UpdateGroupResponse = await response.json();

            if (!response.ok || !data.success) {
                const errorMsg = data.message || "Grup güncellenirken bir hata oluştu";
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
        updateGroup,
        isLoading,
        error,
    };
}
