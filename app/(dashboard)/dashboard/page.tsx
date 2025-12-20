"use client";

import React from 'react';
import { Users, Calendar, FileText, DollarSign, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { isDemo } = useAuth();

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
        <p className="text-gray-600">Hoş geldiniz! Sisteminizin genel durumu aşağıda özetlenmiştir.</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Üye</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>

        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Etkinlik</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>

        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Yönetici</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
            <FileText className="h-8 w-8 text-yellow-500" />
          </div>

        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aylık Gelir</p>
              <p className="text-2xl font-bold text-gray-900">₺-500</p>
            </div>
            <DollarSign className="h-8 w-8 text-red-500" />
          </div>

        </div>
      </div>

      {/* Son Aktiviteler ve Hızlı Erişim */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Son Aktiviteler */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h2>

          <ul className="space-y-3">
            <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="mt-2 w-2 h-2 bg-green-500 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 leading-relaxed break-words">
                  <span className="font-semibold text-blue-600">Numan Test</span>
                  <span className="text-gray-700"> tarafından yeni üye eklendi: </span>
                  <span className="font-medium">Deneme User</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">1 dakika önce</p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="mt-2 w-2 h-2 bg-blue-500 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 leading-relaxed break-words">
                  <span className="font-semibold text-blue-600">Numan Test</span>
                  <span className="text-gray-700"> tarafından yeni etkinlik oluşturuldu: </span>
                  <span className="font-medium">ETKİNLİK VAR GELİNNN</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">53 dakika önce</p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="mt-2 w-2 h-2 bg-yellow-500 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 leading-relaxed break-words">
                  <span className="font-semibold text-blue-600">Numan Test</span>
                  <span className="text-gray-700"> tarafından yeni yönetici eklendi: </span>
                  <span className="font-medium">Batuhan Çelik</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">2  saat önce</p>
              </div>
            </li>
          </ul>
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
