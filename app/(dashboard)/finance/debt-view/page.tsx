"use client"
import React, { useState } from 'react';
import { 
  Eye, 
  Search, 
  Filter, 
  Download,
  CreditCard,
  Calendar,
  Users,
  Building2,
  AlertCircle
} from 'lucide-react';
import Modal from '../../../../components/Modal';
import Link from 'next/link';

interface Debt {
  id: string;
  borcluId: string;
  borcluAd: string;
  borcluTur: 'uye' | 'dis_kurum';
  borcBedeli: number;
  vadeTarihi: string;
  borcTuru: string;
  aciklama: string;
  odemeler: {
    id: string;
    miktar: number;
    tarih: string;
    odemeYontemi: string;
  }[];
}

// Mock data
const mockDebts: Debt[] = [
  {
    id: '1',
    borcluId: 'U001',
    borcluAd: 'Ahmet Yılmaz',
    borcluTur: 'uye',
    borcBedeli: 1500,
    vadeTarihi: '2025-12-15',
    borcTuru: 'Aidat',
    aciklama: '2025 yılı aidat ödemesi',
    odemeler: [
      {
        id: 'O1',
        miktar: 500,
        tarih: '2025-09-15',
        odemeYontemi: 'Havale'
      }
    ]
  },
  {
    id: '2',
    borcluId: 'D001',
    borcluAd: 'ABC Şirketi',
    borcluTur: 'dis_kurum',
    borcBedeli: 5000,
    vadeTarihi: '2025-11-30',
    borcTuru: 'Sponsorluk',
    aciklama: 'Yıllık sponsorluk ödemesi',
    odemeler: []
  },
  {
    id: '3',
    borcluId: 'U002',
    borcluAd: 'Fatma Demir',
    borcluTur: 'uye',
    borcBedeli: 2000,
    vadeTarihi: '2025-10-30',
    borcTuru: 'Etkinlik Katılım',
    aciklama: 'Yaz kampı katılım ücreti',
    odemeler: [
      {
        id: 'O2',
        miktar: 1000,
        tarih: '2025-09-01',
        odemeYontemi: 'Kredi Kartı'
      }
    ]
  }
];

export default function Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsModalOpen(true);
  };

  const filteredDebts = mockDebts.filter(debt => {
    if (filterType !== 'all' && debt.borcluTur !== filterType) return false;
    return debt.borcluAd.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Borç Listesi</h2>
              <p className="text-blue-100">Toplam {filteredDebts.length} borç kaydı</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Borçlu ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              
              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Borçlular</option>
                <option value="uye">Sadece Üyeler</option>
                <option value="dis_kurum">Sadece Dış Kurumlar</option>
              </select>

              {/* Export Button */}
              <button className="bg-white text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium">
                <Download size={18} />
                <span>Dışa Aktar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Users size={16} />
                      <span>Borçlu</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <CreditCard size={16} />
                      <span>Borç Bedeli</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>Vade Tarihi</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDebts.map((debt) => (
                  <tr key={debt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {debt.borcluTur === 'uye' ? (
                          <Users size={16} className="text-blue-600 mr-2" />
                        ) : (
                          <Building2 size={16} className="text-purple-600 mr-2" />
                        )}
                        <span className="text-gray-900">{debt.borcluAd}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">₺{debt.borcBedeli.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{new Date(debt.vadeTarihi).toLocaleDateString('tr-TR')}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetails(debt)}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        <Eye size={16} className="mr-1" />
                        Detay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Borç Detayı - ${selectedDebt?.borcluAd}`}
        size="lg"
      >
        {selectedDebt && (
          <div className="grid grid-cols-3 gap-6">
            {/* Sol taraf - Borç Bilgileri */}
            <div className="col-span-2">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  {selectedDebt.borcluTur === 'uye' ? (
                    <Users size={20} className="text-blue-600" />
                  ) : (
                    <Building2 size={20} className="text-purple-600" />
                  )}
                  <h3 className="text-lg font-semibold">
                    {selectedDebt.borcluTur === 'uye' ? 'Üye' : 'Dış Kurum'}
                  </h3>
                </div>
                <p className="text-gray-600">{selectedDebt.borcluAd}</p>
              </div>

              {/* Ödemeler Tablosu */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-4 py-3 border-b">
                  <h4 className="font-semibold">Ödeme Geçmişi</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miktar</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ödeme Yöntemi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedDebt.odemeler.map(odeme => (
                        <tr key={odeme.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(odeme.tarih).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            ₺{odeme.miktar.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{odeme.odemeYontemi}</td>
                        </tr>
                      ))}
                      {selectedDebt.odemeler.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-sm text-gray-500 text-center">
                            Henüz ödeme yapılmamış
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sağ taraf - Özet ve Aksiyonlar */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Borç Özeti</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Borç Türü</span>
                    <span className="font-medium">{selectedDebt.borcTuru}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Toplam Borç</span>
                    <span className="font-medium text-lg">₺{selectedDebt.borcBedeli.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Vade Tarihi</span>
                    <span className="font-medium">{new Date(selectedDebt.vadeTarihi).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/finance/collection/new?debtId=${selectedDebt.id}`}
                  className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CreditCard size={18} />
                  <span>Borç Öde</span>
                </Link>

                <button className="w-full border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  Düzenle
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}