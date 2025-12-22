import useSWR from 'swr';
import fetcher from '../lib/api/fetcher';
import { API_ENDPOINTS } from '../lib/api/endpoints';

export default function useGetGroups() {
  const { data, error, isLoading, mutate } = useSWR(
    API_ENDPOINTS.groups.getAllGroups,
    fetcher,
    {
      revalidateOnFocus: false, // Tarayıcı odaklandığında tekrar istek atma
      refreshInterval: 30000, // 30 saniye aralıklarla veriyi yenile
      dedupingInterval: 2000, // 2 saniye içinde tekrarlanan istekleri engelle
    }
  );

  // API response'unu kontrol et ve güvenli array döndür
  let groups = [];
  if (data) {
    if (Array.isArray(data)) {
      groups = data;
    } else if (data.data && Array.isArray(data.data)) {
      groups = data.data;
    } else if (data.groups && Array.isArray(data.groups)) {
      groups = data.groups;
    } else if (data.results && Array.isArray(data.results)) {
      groups = data.results;
    }
  }

  return {
    groups,
    isLoading,
    isError: error,
    refetch: mutate,
  };
}