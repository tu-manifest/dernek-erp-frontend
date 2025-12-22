"use client";

import { useState } from 'react';
import { API_ENDPOINTS } from "../lib/api/endpoints";

export interface UploadImageResult {
    success: boolean;
    data?: any;
    error?: string;
}

export default function useUploadFixedAssetImage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImage = async (assetId: number, imageFile: File): Promise<UploadImageResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(API_ENDPOINTS.fixedAssets.uploadImage(assetId), {
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
            return { success: true, data: result };
        } catch (err: any) {
            const errorMessage = err.message || 'Resim yüklenirken bir hata oluştu';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    };

    return {
        uploadImage,
        isLoading,
        error,
    };
}
