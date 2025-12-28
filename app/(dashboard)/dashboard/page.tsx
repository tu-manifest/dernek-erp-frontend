"use client";

import React from 'react';
import { Users, Calendar, FileText, DollarSign, BarChart3, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import useGetRecentActivityLogs from '@/hooks/useGetRecentActivityLogs';
import useGetDashboardStats from '@/hooks/useGetDashboardStats';
import { useRouter } from 'next/navigation';

// Aktivite tipine göre renk belirleme
const getActionColor = (action: string): string => {
  switch (action) {
    case 'CREATE':
      return 'bg-green-500';
    case 'UPDATE':
      return 'bg-blue-500';
    case 'DELETE':
      return 'bg-red-500';
    case 'STATUS_CHANGE':
      return 'bg-yellow-500';
    case 'LOGIN':
      return 'bg-purple-500';
    case 'LOGOUT':
      return 'bg-gray-500';
    default:
      return 'bg-gray-400';
  }
};

// Türkçe aksiyon açıklamaları
const getActionLabel = (action: string): string => {
  switch (action) {
    case 'CREATE':
      return 'oluşturdu';
    case 'UPDATE':
      return 'güncelledi';
    case 'DELETE':
      return 'sildi';
    case 'STATUS_CHANGE':
      return 'durumunu değiştirdi';
    case 'LOGIN':
      return 'giriş yaptı';
    case 'LOGOUT':
      return 'çıkış yaptı';
    default:
      return action;
  }
};

// Entity tipi için Türkçe karşılık
const getEntityTypeLabel = (entityType: string): string => {
  const labels: Record<string, string> = {
    'Member': 'üye',
    'Event': 'etkinlik',
    'Campaign': 'kampanya',
    'Donor': 'bağışçı',
    'FixedAsset': 'sabit varlık',
    'Document': 'döküman',
    'Debt': 'borç',
    'Collection': 'tahsilat',
    'Admin': 'yönetici',
    'Group': 'grup',
  };
  return labels[entityType] || entityType;
};

// Zaman formatı
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return date.toLocaleDateString('tr-TR');
};

// Para formatı
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DashboardPage() {
  const { isDemo } = useAuth();
  const router = useRouter();
  const { activityLogs, isLoading: isLogsLoading, isError: isLogsError } = useGetRecentActivityLogs(3);
  const { stats, isLoading: isStatsLoading, isError: isStatsError } = useGetDashboardStats();

  return (
    <div className="p-6">
      {/* Demo Modu Bilgilendirmesi */}
      {isDemo && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-800">Demo Modundasınız</h3>
              <p className="text-sm text-amber-700 mt-1">
                Şu anda demo hesabı ile giriş yaptınız. Bu mod sadece test amaçlıdır ve veriler gerçek veritabanına kaydedilmez. Tüm yetkilere sahipsiniz.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dernek Yönetim Sistemi</h1>
        <p className="text-gray-600">
          Hoş geldiniz! Sisteminizin genel durumu aşağıda özetlenmiştir.
          {stats?.period && (
            <span className="ml-2 text-sm text-blue-600 font-medium">
              ({stats.period.month} {stats.period.year})
            </span>
          )}
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Toplam Üye */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Üye</p>
              {isStatsLoading ? (
                <div className="flex items-center gap-2 mt-1">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                </div>
              ) : isStatsError ? (
                <p className="text-lg font-bold text-red-500">Hata</p>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{stats?.totalMembers ?? 0}</p>
              )}
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        {/* Aktif Etkinlik */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Etkinlik</p>
              {isStatsLoading ? (
                <div className="flex items-center gap-2 mt-1">
                  <Loader2 className="h-5 w-5 text-green-500 animate-spin" />
                </div>
              ) : isStatsError ? (
                <p className="text-lg font-bold text-red-500">Hata</p>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{stats?.activeEvents ?? 0}</p>
              )}
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </div>

        {/* Toplam Döküman */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Döküman</p>
              {isStatsLoading ? (
                <div className="flex items-center gap-2 mt-1">
                  <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
                </div>
              ) : isStatsError ? (
                <p className="text-lg font-bold text-red-500">Hata</p>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{stats?.totalDocuments ?? 0}</p>
              )}
            </div>
            <FileText className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        {/* Aylık Gelir */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aylık Gelir</p>
              {isStatsLoading ? (
                <div className="flex items-center gap-2 mt-1">
                  <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                </div>
              ) : isStatsError ? (
                <p className="text-lg font-bold text-red-500">Hata</p>
              ) : (
                <p className={`text-2xl font-bold ${(stats?.monthlyIncome ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats?.monthlyIncome ?? 0)}
                </p>
              )}
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Son Aktiviteler ve Hızlı Erişim */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Son Aktiviteler */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h2>
            <button
              onClick={() => router.push('/activity-logs')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              Tümünü Gör
              <Clock className="h-4 w-4" />
            </button>
          </div>

          {isLogsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-600">Yükleniyor...</span>
            </div>
          ) : isLogsError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Aktiviteler yüklenirken hata oluştu</p>
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Henüz aktivite kaydı bulunmuyor</p>
            </div>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {activityLogs.map((log) => (
                <li key={log.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className={`mt-2 w-2 h-2 ${getActionColor(log.action)} rounded-full shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 leading-relaxed break-words">
                      <span className="font-semibold text-blue-600">{log.adminName}</span>
                      <span className="text-gray-700"> {getEntityTypeLabel(log.entityType)} {getActionLabel(log.action)}</span>
                      {log.entityName && (
                        <span className="font-medium">: {log.entityName}</span>
                      )}
                    </p>
                    {log.description && (
                      <p className="text-xs text-gray-600 mt-0.5">{log.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(log.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>


        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Erişim</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/members/add')}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 text-left"
            >
              <Users className="h-6 w-6 text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Yeni Üye Ekle</p>
            </button>
            <button
              onClick={() => router.push('/events/add')}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 text-left"
            >
              <Calendar className="h-6 w-6 text-green-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Etkinlik Oluştur</p>
            </button>
            <button
              onClick={() => router.push('/documents/upload')}
              className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors duration-200 text-left"
            >
              <FileText className="h-6 w-6 text-yellow-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Döküman Yükle</p>
            </button>
            <button
              onClick={() => router.push('/finance/reports')}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 text-left"
            >
              <BarChart3 className="h-6 w-6 text-purple-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Raporları Görüntüle</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
