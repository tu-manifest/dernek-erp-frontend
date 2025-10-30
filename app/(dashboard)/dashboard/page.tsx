import React from 'react';
import { Users, Calendar, FileText, DollarSign, BarChart3, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dernek Yönetim Sistemi</h1>
        <p className="text-gray-600">Hoş geldiniz! Sisteminizin genel durumu aşağıda özetlenmiştir.</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Üye</p>
              <p className="text-2xl font-bold text-gray-900">245</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+12 bu ay</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Etkinlik</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>3 yeni</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Döküman</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <FileText className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+7 bu hafta</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aylık Gelir</p>
              <p className="text-2xl font-bold text-gray-900">₺24,580</p>
            </div>
            <DollarSign className="h-8 w-8 text-red-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+15.2%</span>
          </div>
        </div>
      </div>

      {/* Son Aktiviteler ve Hızlı Erişim */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Yeni üye kaydedildi: Ahmet Yılmaz</p>
                <p className="text-xs text-gray-500">2 saat önce</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Yeni etkinlik oluşturuldu: Genel Kurul</p>
                <p className="text-xs text-gray-500">4 saat önce</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Finansal rapor güncellendi</p>
                <p className="text-xs text-gray-500">1 gün önce</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Erişim</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 text-left">
              <Users className="h-6 w-6 text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Yeni Üye Ekle</p>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 text-left">
              <Calendar className="h-6 w-6 text-green-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Etkinlik Oluştur</p>
            </button>
            <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors duration-200 text-left">
              <FileText className="h-6 w-6 text-yellow-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Döküman Yükle</p>
            </button>
            <button className="p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 text-left">
              <BarChart3 className="h-6 w-6 text-red-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Raporları Görüntüle</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
