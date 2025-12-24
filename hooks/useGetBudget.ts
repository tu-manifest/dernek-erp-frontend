"use client";

import useSWR from 'swr';
import { useMemo } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface BudgetItem {
    id: number;
    type: 'gelir' | 'gider';
    category: string;
    item: string;
    amount: number;
    year?: number;
    description?: string | null;
    itemName?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface CategoryGroup {
    category: string;
    items: BudgetItem[];
    subtotal: number;
}

export interface BudgetResponse {
    success: boolean;
    data: {
        year: number;
        items: BudgetItem[];
        income: {
            categories: CategoryGroup[];
            total: number;
        };
        expense: {
            categories: CategoryGroup[];
            total: number;
        };
        summary: {
            totalIncome: number;
            totalExpense: number;
            balance: number;
            status: string;
            statusText: string;
        };
    };
}

// Boş dizi için sabit referans - her render'da yeni dizi oluşturmayı önler
const EMPTY_ARRAY: BudgetItem[] = [];

export default function useGetBudget(year: number) {
    const { data, error, isLoading, mutate } = useSWR<BudgetResponse>(
        year ? API_ENDPOINTS.budget.getByYear(year) : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
        }
    );

    // API'den gelen kategorileri düz dizilere dönüştür
    const gelirItems = useMemo(() => {
        if (!data?.data?.income?.categories) return EMPTY_ARRAY;

        const items: BudgetItem[] = [];
        data.data.income.categories.forEach(cat => {
            cat.items.forEach(item => {
                items.push({
                    ...item,
                    category: cat.category,
                    type: 'gelir',
                });
            });
        });
        return items.length > 0 ? items : EMPTY_ARRAY;
    }, [data?.data?.income?.categories]);

    const giderItems = useMemo(() => {
        if (!data?.data?.expense?.categories) return EMPTY_ARRAY;

        const items: BudgetItem[] = [];
        data.data.expense.categories.forEach(cat => {
            cat.items.forEach(item => {
                items.push({
                    ...item,
                    category: cat.category,
                    type: 'gider',
                });
            });
        });
        return items.length > 0 ? items : EMPTY_ARRAY;
    }, [data?.data?.expense?.categories]);

    return {
        budget: data?.data || null,
        gelirItems,
        giderItems,
        totalGelir: data?.data?.summary?.totalIncome || 0,
        totalGider: data?.data?.summary?.totalExpense || 0,
        netBalance: data?.data?.summary?.balance || 0,
        isLoading,
        isError: !!error,
        refetch: mutate,
    };
}
