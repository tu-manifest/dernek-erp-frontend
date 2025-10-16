import useSWRMutation from 'swr/mutation';
import { API_ENDPOINTS } from '../lib/api/endpoints';

interface addNewMemberRequest {
    fullName: string;
    tcNumber: string;
    birthDate: string;
    phoneNumber: string;
    email: string;
    address: string;
    group_id: number; // membershipType'ı group_id olarak değiştirdik
    duesAmount: number;
    duesFrequency: 'monthly' | 'quarterly' | 'annual';
    paymentStatus: 'paid' | 'pending' | 'overdue';
    charterApproval: boolean;
    kvkkApproval: boolean;
}

async function addNewMember(url: string, { arg }: { arg: addNewMemberRequest }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Üye eklenirken bir hata oluştu');
  }

  return response.json();
}

export default function useAddNewMember() {
  const { trigger, isMutating, error } = useSWRMutation(
    API_ENDPOINTS.members.addNewMember,
    addNewMember
  );

  return {
    addNewMember: trigger,
    isLoading: isMutating,
    error,
  };
}