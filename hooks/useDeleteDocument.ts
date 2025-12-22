"use client";

import { useState } from 'react';
import fetcher from "../lib/api/fetcher";
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface DeleteDocumentResult {
    success: boolean;
    error?: string;
}

export default function useDeleteDocument() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteDocument = async (id: number): Promise<DeleteDocumentResult> => {
        setIsLoading(true);
        setError(null);

        try {
            await fetcher(API_ENDPOINTS.documents.delete(id), {
                method: 'DELETE',
            });

            setIsLoading(false);
            return { success: true };
        } catch (err: any) {
            const errorMessage = err.message || 'Döküman silinirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        deleteDocument,
        isLoading,
        error,
    };
}
