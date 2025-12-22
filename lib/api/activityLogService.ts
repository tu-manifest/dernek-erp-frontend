// lib/api/activityLogService.ts

import fetcher from './fetcher';
import { API_ENDPOINTS } from './endpoints';

// Aktivite log veri tipi
export interface ActivityLog {
    id: number;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'LOGIN' | 'LOGOUT';
    entityType: string; // 'Member', 'Event', 'Campaign', 'Donor', 'FixedAsset', 'Document', 'Debt', 'Collection', 'Admin'
    entityId: number | null;
    entityName: string | null;
    description: string;
    details: Record<string, any> | null;
    adminId: number;
    adminName: string;
    ipAddress: string | null;
    createdAt: string;
}

// Filtreleme parametreleri
export interface ActivityLogFilters {
    page?: number;
    limit?: number;
    entityType?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
}

// İstatistik verileri
export interface ActivityLogStats {
    totalLogs: number;
    todayLogs: number;
    weekLogs: number;
    monthLogs: number;
    byAction: Record<string, number>;
    byEntityType: Record<string, number>;
}

// Son aktiviteler response tipi
export interface RecentActivityLogsResponse {
    success: boolean;
    count: number;
    data: ActivityLog[];
}

// Tüm loglar response tipi (sayfalama destekli)
export interface ActivityLogsResponse {
    success: boolean;
    count: number;
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
    data: ActivityLog[];
}

// İstatistik response tipi
export interface ActivityLogStatsResponse {
    success: boolean;
    data: ActivityLogStats;
}

// 1. Son Aktivite Loglarını Çekme (GET)
export const fetchRecentActivityLogs = async (limit: number = 10): Promise<RecentActivityLogsResponse> => {
    const url = API_ENDPOINTS.activityLogs.getRecent(limit);
    return fetcher(url, { method: 'GET' });
};

// 2. Tüm Aktivite Loglarını Çekme (GET with filters)
export const fetchActivityLogs = async (filters: ActivityLogFilters = {}): Promise<ActivityLogsResponse> => {
    const url = API_ENDPOINTS.activityLogs.getAll;
    const queryParams: Record<string, string> = {};

    if (filters.page) queryParams.page = filters.page.toString();
    if (filters.limit) queryParams.limit = filters.limit.toString();
    if (filters.entityType) queryParams.entityType = filters.entityType;
    if (filters.action) queryParams.action = filters.action;
    if (filters.startDate) queryParams.startDate = filters.startDate;
    if (filters.endDate) queryParams.endDate = filters.endDate;

    return fetcher(url, { method: 'GET', payload: queryParams });
};

// 3. Entity Bazlı Logları Çekme (GET)
export const fetchActivityLogsByEntity = async (
    entityType: string,
    entityId: number
): Promise<RecentActivityLogsResponse> => {
    const url = API_ENDPOINTS.activityLogs.getByEntity(entityType, entityId);
    return fetcher(url, { method: 'GET' });
};

// 4. İstatistik Verilerini Çekme (GET)
export const fetchActivityLogStats = async (): Promise<ActivityLogStatsResponse> => {
    const url = API_ENDPOINTS.activityLogs.getStats;
    return fetcher(url, { method: 'GET' });
};
