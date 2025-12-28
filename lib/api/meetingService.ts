// lib/api/meetingService.ts

import fetcher from './fetcher';
import { API_ENDPOINTS } from './endpoints';

// Toplantı Türleri
export type MeetingType = 'Yönetim Kurulu' | 'Genel Kurul' | 'Komisyon' | 'Diğer';

// Toplantı Durumları
export type MeetingStatus = 'Planlandı' | 'Devam Ediyor' | 'Tamamlandı' | 'İptal';

// Backend'den gelen toplantı veri tipi
export interface Meeting {
    id: number;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    meetingType: MeetingType;
    locationType: 'Fiziksel' | 'Çevrimiçi';
    location: string | null;
    platform: string | null;
    meetingLink: string | null;
    agenda: string;
    minutes: string | null;
    status: MeetingStatus;
    participantCount: number;
    createdAt: string;
    updatedAt: string;
}

// Yeni toplantı oluşturma payload tipi
export interface CreateMeetingPayload {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    meetingType: MeetingType;
    locationType: 'Fiziksel' | 'Çevrimiçi';
    location?: string;
    platform?: string;
    meetingLink?: string;
    agenda: string;
    participantCount?: number;
}

// Toplantı güncelleme payload tipi
export interface UpdateMeetingPayload extends Partial<CreateMeetingPayload> {
    minutes?: string;
    status?: MeetingStatus;
}

// API Response tipi
export interface MeetingsResponse {
    success: boolean;
    count: number;
    stats: {
        totalMeetings: number;
        plannedMeetings: number;
        completedMeetings: number;
        cancelledMeetings: number;
        thisMonthMeetings: number;
    };
    data: Meeting[];
}

// Tek toplantı response tipi
export interface MeetingResponse {
    success: boolean;
    data: Meeting;
}

// 1. Tüm Toplantıları Çekme Fonksiyonu (GET)
export const fetchAllMeetings = async (): Promise<MeetingsResponse> => {
    const url = API_ENDPOINTS.meetings.getAllMeetings;
    return fetcher(url, { method: 'GET' });
};

// 2. Filtrelenmiş Toplantıları Çekme (GET with status filter)
export const fetchMeetingsByStatus = async (status: string): Promise<MeetingsResponse> => {
    const url = API_ENDPOINTS.meetings.getMeetingsByStatus(status);
    return fetcher(url, { method: 'GET' });
};

// 3. ID'ye Göre Toplantı Çekme (GET)
export const fetchMeetingById = async (id: number): Promise<MeetingResponse> => {
    const url = API_ENDPOINTS.meetings.getMeetingById(id);
    return fetcher(url, { method: 'GET' });
};

// 4. Yeni Toplantı Oluşturma (POST)
export const createMeeting = async (data: CreateMeetingPayload): Promise<MeetingResponse> => {
    const url = API_ENDPOINTS.meetings.createMeeting;
    return fetcher(url, {
        method: 'POST',
        payload: data,
    });
};

// 5. Toplantı Güncelleme (PUT)
export const updateMeeting = async (id: number, data: UpdateMeetingPayload): Promise<MeetingResponse> => {
    const url = API_ENDPOINTS.meetings.updateMeeting(id);
    return fetcher(url, {
        method: 'PUT',
        payload: data,
    });
};

// 6. Toplantı Silme (DELETE)
export const deleteMeeting = async (id: number): Promise<{ success: boolean; message: string }> => {
    const url = API_ENDPOINTS.meetings.deleteMeeting(id);
    return fetcher(url, { method: 'DELETE' });
};

// 7. Toplantı Durumu Güncelleme (PUT)
export const updateMeetingStatus = async (id: number, status: MeetingStatus): Promise<MeetingResponse> => {
    const url = API_ENDPOINTS.meetings.updateMeetingStatus(id);
    return fetcher(url, {
        method: 'PUT',
        payload: { status },
    });
};
