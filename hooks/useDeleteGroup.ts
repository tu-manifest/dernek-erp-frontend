"use client";

import { useState } from "react";
import { API_ENDPOINTS } from "../lib/api/endpoints";

interface DeleteGroupResponse {
    success: boolean;
    message?: string;
}

export default function useDeleteGroup() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteGroup = async (
        id: number
    ): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(API_ENDPOINTS.groups.deleteGroup(String(id)), {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            const data: DeleteGroupResponse = await response.json();

            if (!response.ok || !data.success) {
                const errorMsg = data.message || "Grup silinirken bir hata oluştu";
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }

            return { success: true };
        } catch (err: any) {
            const errorMsg = err.message || "Bir hata oluştu";
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        deleteGroup,
        isLoading,
        error,
    };
}
