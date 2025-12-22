"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

// Üye için borç oluşturma payload'ı
export interface CreateMemberDebtPayload {
    memberId: number;
    debtType: string;
    amount: number;
    currency: string;
    dueDate: string;
    description?: string;
}

// Dış bağışçı için borç oluşturma payload'ı
export interface CreateExternalDebtPayload {
    externalDebtorId: string;
    debtType: string;
    amount: number;
    currency: string;
    dueDate: string;
    description?: string;
}

export type CreateDebtPayload = CreateMemberDebtPayload | CreateExternalDebtPayload;

export interface CreateDebtResult {
    success: boolean;
    data?: any;
    error?: string;
}

export default function useCreateDebt() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createDebt = async (payload: CreateDebtPayload): Promise<CreateDebtResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetcher(API_ENDPOINTS.finance.createDebt, {
                method: 'POST',
                payload,
            });

            setIsLoading(false);
            return { success: true, data: result };
        } catch (err: any) {
            const errorMessage = err.message || 'Borç kaydı oluşturulurken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        createDebt,
        isLoading,
        error,
    };
}
