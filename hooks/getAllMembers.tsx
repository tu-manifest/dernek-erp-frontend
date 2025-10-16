import useSWR from 'swr';
import fetcher from '../lib/api/fetcher';
import { API_ENDPOINTS } from '../lib/api/endpoints';

export default function useGetAllMembers() {
  const { data, error, isLoading } = useSWR(
    API_ENDPOINTS.members.getAllMembers,
    fetcher,
    {
      revalidateOnFocus: false, // Tarayıcı odaklandığında tekrar istek atma
      refreshInterval: 30000, // 30 saniye aralıklarla veriyi yenile
      dedupingInterval: 2000, // 2 saniye içinde tekrarlanan istekleri engelle
    }
  );

  let members = [];
  if (data) {
    if (Array.isArray(data)) {
      members = data;
    } else if (data.data && Array.isArray(data.data)) {
      members = data.data;
    } else if (data.members && Array.isArray(data.members)) {
      members = data.members;
    } else if (data.results && Array.isArray(data.results)) {
      members = data.results;
    }
  }

  return {
    members,
    isLoading,
    isError: error,
  };
}