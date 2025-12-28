"use client";

import { useState } from 'react';
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface UpdateExpensePayload {
    mainCategory?: string;
    subCategory?: string;
    amount?: string;
    currency?: string;
    expenseDate?: string;
    paymentMethod?: string;
    invoiceNumber?: string;
    supplierName?: string;
    department?: string;
    description?: string;
    isRecurring?: boolean;
    file?: File;
}

export interface UpdateExpenseResult {
    success: boolean;
    data?: {
        id: number;
        mainCategory: string;
        subCategory: string;
        amount: string;
        currency: string;
        expenseDate: string;
        paymentMethod: string;
        invoiceNumber: string;
        supplierName: string;
        department: string;
        description: string;
        isRecurring: boolean;
        fileName?: string;
        fileMimeType?: string;
        fileSize?: number;
        hasDocument: boolean;
        createdAt: string;
        updatedAt: string;
    };
    error?: string;
}

export default function useUpdateExpense() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateExpense = async (id: number, payload: UpdateExpensePayload): Promise<UpdateExpenseResult> => {
        setIsLoading(true);
        setError(null);

        try {
            // localStorage'dan token'ı al
            let authToken: string | null = null;
            if (typeof window !== "undefined") {
                authToken = localStorage.getItem("authToken");
            }

            const formData = new FormData();

            if (payload.mainCategory) formData.append('mainCategory', payload.mainCategory);
            if (payload.subCategory) formData.append('subCategory', payload.subCategory);
            if (payload.amount) formData.append('amount', payload.amount);
            if (payload.currency) formData.append('currency', payload.currency);
            if (payload.expenseDate) formData.append('expenseDate', payload.expenseDate);
            if (payload.paymentMethod) formData.append('paymentMethod', payload.paymentMethod);
            if (payload.supplierName) formData.append('supplierName', payload.supplierName);
            if (payload.description) formData.append('description', payload.description);
            if (payload.isRecurring !== undefined) formData.append('isRecurring', String(payload.isRecurring));
            if (payload.invoiceNumber) formData.append('invoiceNumber', payload.invoiceNumber);
            if (payload.department) formData.append('department', payload.department);
            if (payload.file) formData.append('file', payload.file);

            const response = await fetch(API_ENDPOINTS.expenses.update(id), {
                method: 'PUT',
                body: formData,
                headers: {
                    ...(authToken && { Authorization: `Bearer ${authToken}` }),
                },
            });

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status} - ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    // JSON parse edilemezse devam et
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            setIsLoading(false);
            return { success: true, data: result.data };
        } catch (err: any) {
            const errorMessage = err.message || 'Gider güncellenirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        updateExpense,
        isLoading,
        error,
    };
}
