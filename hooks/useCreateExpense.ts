"use client";

import { useState } from 'react';
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface CreateExpensePayload {
    mainCategory: string;
    subCategory: string;
    amount: string;
    currency: string;
    expenseDate: string;
    paymentMethod: string;
    invoiceNumber?: string;
    supplierName: string;
    department?: string;
    description: string;
    isRecurring: boolean;
    file?: File;
}

export interface CreateExpenseResult {
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

export default function useCreateExpense() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createExpense = async (payload: CreateExpensePayload): Promise<CreateExpenseResult> => {
        setIsLoading(true);
        setError(null);

        try {
            // localStorage'dan token'ı al
            let authToken: string | null = null;
            if (typeof window !== "undefined") {
                authToken = localStorage.getItem("authToken");
            }

            const formData = new FormData();
            formData.append('mainCategory', payload.mainCategory);
            formData.append('subCategory', payload.subCategory);
            formData.append('amount', payload.amount);
            formData.append('currency', payload.currency);
            formData.append('expenseDate', payload.expenseDate);
            formData.append('paymentMethod', payload.paymentMethod);
            formData.append('supplierName', payload.supplierName);
            formData.append('description', payload.description);
            formData.append('isRecurring', String(payload.isRecurring));

            if (payload.invoiceNumber) {
                formData.append('invoiceNumber', payload.invoiceNumber);
            }
            if (payload.department) {
                formData.append('department', payload.department);
            }
            if (payload.file) {
                formData.append('file', payload.file);
            }

            const response = await fetch(API_ENDPOINTS.expenses.create, {
                method: 'POST',
                body: formData,
                headers: {
                    // Token varsa Authorization header'ı ekle
                    ...(authToken && { Authorization: `Bearer ${authToken}` }),
                },
                // FormData için Content-Type header'ı otomatik ayarlanır
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
            const errorMessage = err.message || 'Gider kaydedilirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        createExpense,
        isLoading,
        error,
    };
}
