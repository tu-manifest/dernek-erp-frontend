"use client";

import useSWR from 'swr';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

// Fixed Asset veri tipi (API response formatında)
export interface FixedAsset {
    id: number;
    registrationNo: string;
    name: string;
    assetClass: string;
    assetSubClass: string;
    brandModel: string;
    costValue: number;
    acquisitionDate: string;
    invoiceNo: string;
    supplierName: string;
    usefulLife: number;
    depreciationRate: number;
    salvageValue: number;
    depreciationStartDate: string;
    responsiblePerson: string;
    warrantyEndDate: string;
    revaluationApplied: boolean;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    accumulatedDepreciation: number;
    netBookValue: number;
    yearsElapsed: number;
}

// Summary tipi
export interface FixedAssetsSummary {
    totalAssets: number;
    totalCost: number;
    totalAccumulatedDepreciation: number;
    totalNetBookValue: number;
}

// API Response tipi
export interface FixedAssetsResponse {
    success: boolean;
    data: FixedAsset[];
    summary: FixedAssetsSummary;
}

export default function useGetAllFixedAssets() {
    const { data, error, isLoading, mutate } = useSWR<FixedAssetsResponse>(
        API_ENDPOINTS.fixedAssets.getAll,
        fetcher,
        {
            revalidateOnFocus: false,
            refreshInterval: 30000, // 30 saniye aralıklarla canlı veri akışı
            dedupingInterval: 2000,
        }
    );

    // Varlıkları güvenli şekilde çıkar
    let assets: FixedAsset[] = [];
    if (data?.success && Array.isArray(data.data)) {
        assets = data.data;
    } else if (Array.isArray(data)) {
        assets = data as unknown as FixedAsset[];
    }

    // Summary'i API'den al veya varsayılan hesapla
    const summary: FixedAssetsSummary = data?.summary || {
        totalAssets: assets.length,
        totalCost: assets.reduce((sum, a) => sum + (a.costValue || 0), 0),
        totalAccumulatedDepreciation: assets.reduce((sum, a) => sum + (a.accumulatedDepreciation || 0), 0),
        totalNetBookValue: assets.reduce((sum, a) => sum + (a.netBookValue || 0), 0),
    };

    return {
        assets,
        summary,
        isLoading,
        isError: !!error,
        refetch: mutate,
    };
}
