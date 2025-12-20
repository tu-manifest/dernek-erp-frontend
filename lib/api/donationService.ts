// lib/api/donationService.ts

import fetcher from './fetcher';
import { API_ENDPOINTS } from './endpoints';

// Backend'e gönderilecek verinin tipini tanımlayalım
export interface CampaignPayload {
  name: string;
  type: string;
  targetAmount: number; // Frontend'den string gelse de, göndermeden önce number yapmalıyız
  description: string;
  duration: string; // duration yerine startDate ve endDate kullanıyorsunuz, bu kısma dikkat!
  iban: string;
}

// 1. Yeni Kampanya Oluşturma Fonksiyonu (POST)
export const createDonationCampaign = async (data: CampaignPayload) => {
  const url = API_ENDPOINTS.donations.createCampaign;

  return fetcher(url, {
    method: 'POST',
    payload: data,
  });
};

// 2. Tüm Kampanyaları Çekme Fonksiyonu (GET)
export const fetchAllDonationCampaigns = async () => {
  const url = API_ENDPOINTS.donations.getAllCampaigns;

  return fetcher(url, { method: 'GET' });
};