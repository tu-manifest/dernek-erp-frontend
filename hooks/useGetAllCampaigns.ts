"use client";

import { useState, useEffect } from "react";

export interface Campaign {
    id: string;
    name: string;
    type: string;
    targetAmount: number;
    collectedAmount?: number;
    description: string;
    duration: string;
    iban: string;
    status?: 'active' | 'completed' | 'paused';
    createdAt?: string;
    updatedAt?: string;
}

// Mock data - Backend hazır olduğunda fetchAllDonationCampaigns ile değiştirilecek
const mockCampaigns: Campaign[] = [
    {
        id: "1",
        name: "Ramazan Yardım Kampanyası",
        type: "Genel Bağış",
        targetAmount: 100000,
        collectedAmount: 75000,
        description: "Ramazan ayı boyunca ihtiyaç sahibi ailelere yardım dağıtım kampanyası",
        duration: "2025-03-01 - 2025-04-01",
        iban: "TR330006100519786457841326",
        status: "active",
        createdAt: "2025-02-15"
    },
    {
        id: "2",
        name: "Kurban Bağış Kampanyası 2025",
        type: "Kurban",
        targetAmount: 250000,
        collectedAmount: 180000,
        description: "Kurban bayramı için hisse bağış kampanyası",
        duration: "2025-05-01 - 2025-06-15",
        iban: "TR330006100519786457841326",
        status: "active",
        createdAt: "2025-04-01"
    },
    {
        id: "3",
        name: "Eğitim Burs Programı",
        type: "Eğitim",
        targetAmount: 50000,
        collectedAmount: 50000,
        description: "Üniversite öğrencilerine burs desteği sağlama programı",
        duration: "2024-09-01 - 2025-06-30",
        iban: "TR440006100519786457841327",
        status: "completed",
        createdAt: "2024-08-15"
    },
    {
        id: "4",
        name: "Su Kuyusu Projesi - Afrika",
        type: "Su",
        targetAmount: 75000,
        collectedAmount: 32000,
        description: "Afrika'da temiz su kuyusu açma projesi",
        duration: "2025-01-01 - 2025-12-31",
        iban: "TR550006100519786457841328",
        status: "active",
        createdAt: "2024-12-20"
    },
    {
        id: "5",
        name: "Afet Yardım Fonu",
        type: "Afet Yardım",
        targetAmount: 500000,
        collectedAmount: 420000,
        description: "Doğal afetlerden etkilenen bölgelere acil yardım fonu",
        duration: "2025-01-01 - 2025-12-31",
        iban: "TR660006100519786457841329",
        status: "active",
        createdAt: "2025-01-05"
    },
    {
        id: "6",
        name: "Zekat Toplama Kampanyası",
        type: "Zekat",
        targetAmount: 200000,
        collectedAmount: 85000,
        description: "Yıllık zekat toplama ve dağıtım kampanyası",
        duration: "2025-01-01 - 2025-12-31",
        iban: "TR770006100519786457841330",
        status: "active",
        createdAt: "2025-01-01"
    },
    {
        id: "7",
        name: "Sağlık Desteği Kampanyası",
        type: "Sağlık",
        targetAmount: 150000,
        collectedAmount: 45000,
        description: "Tedavi masraflarını karşılayamayan hastalara destek",
        duration: "2025-02-01 - 2025-08-31",
        iban: "TR880006100519786457841331",
        status: "paused",
        createdAt: "2025-01-20"
    },
    {
        id: "8",
        name: "Sosyal Destek Programı",
        type: "Sosyal Destek",
        targetAmount: 80000,
        collectedAmount: 62000,
        description: "Yaşlı ve engelli vatandaşlara sosyal destek programı",
        duration: "2025-03-01 - 2025-09-30",
        iban: "TR990006100519786457841332",
        status: "active",
        createdAt: "2025-02-25"
    }
];

export default function useGetAllCampaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setIsLoading(true);

                // Mock data ile simülasyon - 500ms gecikme
                await new Promise(resolve => setTimeout(resolve, 500));
                setCampaigns(mockCampaigns);

                /* 
                // Backend hazır olduğunda bu kısmı aktif edin:
                const response = await fetchAllDonationCampaigns();
                
                if (Array.isArray(response)) {
                  setCampaigns(response);
                } else if (response?.data && Array.isArray(response.data)) {
                  setCampaigns(response.data);
                } else if (response?.campaigns && Array.isArray(response.campaigns)) {
                  setCampaigns(response.campaigns);
                } else {
                  setCampaigns([]);
                }
                */

                setIsError(false);
            } catch (error) {
                console.error("Kampanyalar yüklenirken hata oluştu:", error);
                setIsError(true);
                setCampaigns([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    return { campaigns, isLoading, isError };
}
