"use client";

import { useState } from "react";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface UpdateMemberPayload {
    fullName?: string;
    tcNumber?: string;
    birthDate?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    duesAmount?: string;
    duesFrequency?: 'monthly' | 'quarterly' | 'annual';
    paymentStatus?: 'pending' | 'paid' | 'overdue';
    group_id?: number;
}

interface UpdateMemberResponse {
    success: boolean;
    message?: string;
    data?: any;
}

export default function useUpdateMember() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateMember = async (
        id: string,
        payload: UpdateMemberPayload
    ): Promise<{ success: boolean; data?: any; error?: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(API_ENDPOINTS.members.updateMember(id), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(payload),
            });

            const data: UpdateMemberResponse = await response.json();

            if (!response.ok || !data.success) {
                const errorMsg = data.message || "Üye güncellenirken bir hata oluştu";
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
        updateMember,
        isLoading,
        error,
    };
}
