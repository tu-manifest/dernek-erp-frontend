// lib/api/eventService.ts

import fetcher from './fetcher';
import { API_ENDPOINTS } from './endpoints';

// Backend'den gelen etkinlik veri tipi
export interface Event {
    id: number;
    eventName: string;
    date: string;
    time: string;
    quota: number;
    eventType: 'Fiziksel' | 'Çevrimiçi';
    location: string | null;
    platform: string | null;
    eventLink: string | null;
    description: string;
    status: 'Planlandı' | 'Devam Ediyor' | 'Tamamlandı' | 'İptal';
    createdAt: string;
    updatedAt: string;
}

// Yeni etkinlik oluşturma payload tipi
export interface CreateEventPayload {
    eventName: string;
    date: string;
    time: string;
    quota?: number;
    eventType: 'Fiziksel' | 'Çevrimiçi';
    location?: string;
    platform?: string;
    eventLink?: string;
    description: string;
}

// Etkinlik güncelleme payload tipi
export interface UpdateEventPayload extends Partial<CreateEventPayload> { }

// API Response tipi
export interface EventsResponse {
    success: boolean;
    count: number;
    stats: {
        totalEvents: number;
        plannedEvents: number;
        completedEvents: number;
        onlineEvents: number;
        offlineEvents: number;
    };
    data: Event[];
}

// 1. Tüm Etkinlikleri Çekme Fonksiyonu (GET)
export const fetchAllEvents = async (): Promise<EventsResponse> => {
    const url = API_ENDPOINTS.events.getAllEvents;
    return fetcher(url, { method: 'GET' });
};

// 2. Filtrelenmiş Etkinlikleri Çekme (GET with status filter)
export const fetchEventsByStatus = async (status: string): Promise<EventsResponse> => {
    const url = API_ENDPOINTS.events.getEventsByStatus(status);
    return fetcher(url, { method: 'GET' });
};

// 3. ID'ye Göre Etkinlik Çekme (GET)
export const fetchEventById = async (id: number): Promise<{ success: boolean; data: Event }> => {
    const url = API_ENDPOINTS.events.getEventById(id);
    return fetcher(url, { method: 'GET' });
};

// 4. Yeni Etkinlik Oluşturma (POST)
export const createEvent = async (data: CreateEventPayload) => {
    const url = API_ENDPOINTS.events.createEvent;
    return fetcher(url, {
        method: 'POST',
        payload: data,
    });
};

// 5. Etkinlik Güncelleme (PUT)
export const updateEvent = async (id: number, data: UpdateEventPayload) => {
    const url = API_ENDPOINTS.events.updateEvent(id);
    return fetcher(url, {
        method: 'PUT',
        payload: data,
    });
};

// 6. Etkinlik Silme (DELETE)
export const deleteEvent = async (id: number) => {
    const url = API_ENDPOINTS.events.deleteEvent(id);
    return fetcher(url, { method: 'DELETE' });
};

// 7. Etkinlik Durumu Güncelleme (PATCH)
export const updateEventStatus = async (id: number, status: string) => {
    const url = API_ENDPOINTS.events.updateEventStatus(id);
    return fetcher(url, {
        method: 'PUT', // Backend PATCH yerine PUT kabul edebilir, kontrol edin
        payload: { status },
    });
};
