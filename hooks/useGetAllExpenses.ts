"use client";

import useSWR from 'swr';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

// Expense veri tipi (API response formatında)
export interface Expense {
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
}

// API Response tipi
export interface ExpensesResponse {
    success: boolean;
    data: Expense[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export default function useGetAllExpenses() {
    const { data, error, isLoading, mutate } = useSWR<ExpensesResponse>(
        API_ENDPOINTS.expenses.getAll,
        fetcher,
        {
            revalidateOnFocus: false,
            refreshInterval: 30000, // 30 saniye aralıklarla canlı veri akışı
            dedupingInterval: 2000,
        }
    );

    // Giderleri güvenli şekilde çıkar
    let expenses: Expense[] = [];
    if (data?.success && Array.isArray(data.data)) {
        expenses = data.data;
    } else if (Array.isArray(data)) {
        expenses = data as unknown as Expense[];
    }

    // Toplam tutarı hesapla
    const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0);

    // Bu ayın giderlerini hesapla
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.expenseDate);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0);

    // Kategorilere göre özet
    const categorySummary = expenses.reduce((acc, expense) => {
        acc[expense.mainCategory] = (acc[expense.mainCategory] || 0) + parseFloat(expense.amount || '0');
        return acc;
    }, {} as Record<string, number>);

    return {
        expenses,
        pagination: data?.pagination,
        summary: {
            totalExpenses: expenses.length,
            totalAmount,
            thisMonthTotal,
            thisMonthCount: thisMonthExpenses.length,
            categorySummary,
        },
        isLoading,
        isError: !!error,
        refetch: mutate,
    };
}
