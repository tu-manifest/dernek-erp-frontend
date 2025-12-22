"use client";

import useSWR from 'swr';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

// Document veri tipi (API response formatında)
export interface Document {
    id: number;
    name: string;
    category: string;
    description: string;
    fileName: string;
    fileMimeType: string;
    fileSize: number;
    createdAt: string;
    updatedAt: string;
}

// API Response tipi
export interface DocumentsResponse {
    success: boolean;
    data: Document[];
}

export default function useGetAllDocuments() {
    const { data, error, isLoading, mutate } = useSWR<DocumentsResponse>(
        API_ENDPOINTS.documents.getAll,
        fetcher,
        {
            revalidateOnFocus: false,
            refreshInterval: 30000, // 30 saniye aralıklarla canlı veri akışı
            dedupingInterval: 2000,
        }
    );

    // Dökümanları güvenli şekilde çıkar
    let documents: Document[] = [];
    if (data?.success && Array.isArray(data.data)) {
        documents = data.data;
    } else if (Array.isArray(data)) {
        documents = data as unknown as Document[];
    }

    // Kategorilere göre özet
    const categorySummary = documents.reduce((acc, doc) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        documents,
        summary: {
            totalDocuments: documents.length,
            categorySummary,
        },
        isLoading,
        isError: !!error,
        refetch: mutate,
    };
}
