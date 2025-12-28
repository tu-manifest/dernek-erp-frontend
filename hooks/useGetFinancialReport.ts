"use client";

import useSWR from "swr";
import fetcher from "@/lib/api/fetcher";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

// API Response Types
export interface MonthlyBalance {
    current: number;
    previousMonth: number;
    changeAmount: number;
    changePercent: number;
}

export interface CategoryAmount {
    name: string;
    amount: number;
}

export interface FinancialSummary {
    totalIncome: number;
    totalExpense: number;
    topIncomeCategory: CategoryAmount;
    topExpenseCategory: CategoryAmount;
}

export interface MonthlyTrendItem {
    month: string;
    monthName: string;
    income: number;
    expense: number;
    balance: number;
}

export interface BreakdownItem {
    category: string;
    subCategory: string;
    amount: number;
}

export interface CurrentMonthBreakdown {
    income: BreakdownItem[];
    expense: BreakdownItem[];
}

export interface FixedAssetSummary {
    totalBookValue: number;
    currentYearDepreciation: number;
    totalAssets: number;
}

export interface BudgetComplianceItem {
    id: number;
    type: string;
    category: string;
    itemName: string;
    planned: number;
    actual: number;
    difference: number;
    compliancePercent: number;
}

export interface Period {
    currentMonth: string;
    year: number;
}

export interface NetWorkingCapital {
    currentAssets: number;
    currentLiabilities: number;
    netWorkingCapital: number;
}

export interface FinancialReportData {
    monthlyBalance: MonthlyBalance;
    netWorkingCapital: NetWorkingCapital;
    summary: FinancialSummary;
    monthlyTrend: MonthlyTrendItem[];
    currentMonthBreakdown: CurrentMonthBreakdown;
    fixedAssetSummary: FixedAssetSummary;
    budgetCompliance: BudgetComplianceItem[];
    period: Period;
}

interface FinancialReportResponse {
    success: boolean;
    data: FinancialReportData;
}

export default function useGetFinancialReport() {
    const { data, error, isLoading, mutate } = useSWR<FinancialReportResponse>(
        API_ENDPOINTS.financialReport.get,
        (url: string) => fetcher(url),
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // 1 dakika cache
        }
    );

    return {
        report: data?.data || null,
        isLoading,
        isError: !!error,
        error: error?.message,
        refetch: mutate,
    };
}
