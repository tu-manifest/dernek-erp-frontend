"use client";

import { useState } from 'react';
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface UploadDocumentPayload {
    file: File;
    name: string;
    category: string;
    description?: string;
}

export interface UploadDocumentResult {
    success: boolean;
    data?: {
        id: number;
        name: string;
        category: string;
        description: string;
        fileName: string;
        fileMimeType: string;
        fileSize: number;
        createdAt: string;
        updatedAt: string;
    };
    error?: string;
}

export default function useUploadDocument() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadDocument = async (payload: UploadDocumentPayload): Promise<UploadDocumentResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', payload.file);
            formData.append('name', payload.name);
            formData.append('category', payload.category);
            if (payload.description) {
                formData.append('description', payload.description);
            }

            const response = await fetch(API_ENDPOINTS.documents.upload, {
                method: 'POST',
                body: formData,
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
            const errorMessage = err.message || 'Döküman yüklenirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        uploadDocument,
        isLoading,
        error,
    };
}
