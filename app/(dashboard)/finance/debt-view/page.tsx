"use client"
import React, { useState } from 'react';
import {
  Eye,
  Search,
  Download,
  Users,
  Building2,
  X
} from 'lucide-react';
import Modal from '../../../../components/Modal';
import Link from 'next/link';
import useGetDebtors, { Debtor } from '../../../../hooks/useGetDebtors';
import useGetDebtorSummary from '../../../../hooks/useGetDebtorSummary';

// --- Debtor Detail Modal Content ---
const DebtorDetailContent = ({ type, id }: { type: 'MEMBER' | 'EXTERNAL', id: number }) => {
  const { summary, isLoading, isError } = useGetDebtorSummary(type, id);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
  if (isError || !summary) return <div className="p-8 text-center text-red-500">Detaylar yüklenirken hata oluştu.</div>;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-gray-800 mb-1">
            {summary.debtor.type === 'MEMBER' ? <Users size={20} className="text-blue-600" /> : <Building2 size={20} className="text-purple-600" />}
            <h3 className="text-xl font-bold">{summary.debtor.name}</h3>
          </div>
          <div className="text-sm text-gray-500 space-y-0.5">
            <p>{summary.debtor.email || 'E-posta yok'}</p>
            <p>{summary.debtor.phone || 'Telefon yok'}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-gray-500">Toplam Kalan Borç</span>
          <span className="text-2xl font-bold text-red-600">
            {(summary.remainingDebt ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Toplam Borç</p>
          <p className="text-lg font-bold text-gray-800">
            {(summary.totalDebt ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Toplam Ödenen</p>
          <p className="text-lg font-bold text-green-600">
            {(summary.totalPaid ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Kalan Bakiye</p>
          <p className="text-lg font-bold text-red-600">
            {(summary.remainingDebt ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </p>
        </div>
      </div>

      {/* Debts Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="font-semibold text-gray-700">Borç Detayları</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Tür</th>
                <th className="px-4 py-3">Vade</th>
                <th className="px-4 py-3">Tutar</th>
                <th className="px-4 py-3">Ödenen</th>
                <th className="px-4 py-3">Kalan</th>
                <th className="px-4 py-3 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summary.debts && summary.debts.length > 0 ? (
                summary.debts.map((debt) => (
                  <tr key={debt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{debt.debtType}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(debt.dueDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {(debt.amount ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </td>
                    <td className="px-4 py-3 text-green-600">
                      {(debt.collectedAmount ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </td>
                    <td className="px-4 py-3 text-red-600 font-medium">
                      {(debt.remainingAmount ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${debt.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        debt.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {debt.status === 'Paid' ? 'Ödendi' : debt.status === 'Partial' ? 'Kısmi' : 'Bekliyor'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Borç kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


export default function Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, MEMBER, EXTERNAL

  const [selectedDebtor, setSelectedDebtor] = useState<{ type: 'MEMBER' | 'EXTERNAL', id: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { debtors, isLoading, isError } = useGetDebtors();

  const handleViewDetails = (debtor: Debtor) => {
    setSelectedDebtor({ type: debtor.type, id: debtor.id });
    setIsModalOpen(true);
  };

  const filteredDebtors = debtors.filter(debtor => {
    const matchesSearch = debtor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || debtor.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Borçlu Listesi</h2>
              <p className="text-blue-100">
                Toplam {filteredDebtors.length} borçlu görüntüleniyor
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="İsim ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 shadow-sm"
                />
              </div>

              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm cursor-pointer"
              >
                <option value="all">Tümü</option>
                <option value="MEMBER">Üyeler</option>
                <option value="EXTERNAL">Dış Kurumlar</option>
              </select>

              {/* Export Button */}
              <button className="bg-white/10 text-white border border-white/20 px-4 py-2.5 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center space-x-2 font-medium backdrop-blur-sm">
                <Download size={18} />
                <span>Dışa Aktar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Borçlu
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Borç Sayısı
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Toplam Borç
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ödenen
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Kalan Bakiye
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Yükleniyor...</td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-red-500">Veriler yüklenirken hata oluştu.</td>
                  </tr>
                ) : filteredDebtors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Kayıt bulunamadı.</td>
                  </tr>
                ) : (
                  filteredDebtors.map((debtor, index) => (
                    <tr key={`${debtor.type}-${debtor.id}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {debtor.type === 'MEMBER' ? (
                            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md mr-3">
                              <Users size={16} />
                            </div>
                          ) : (
                            <div className="p-1.5 bg-purple-100 text-purple-600 rounded-md mr-3">
                              <Building2 size={16} />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {debtor.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {debtor.type === 'MEMBER' ? 'Üye' : 'Dış Bağışçı'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {debtor.debtCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {debtor.totalDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-green-600">
                          {debtor.totalPaid.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-red-600">
                          {debtor.totalOutstanding.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDetails(debtor)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
                          title="Detay Görüntüle"
                        >
                          <Eye size={18} />
                          <span className="text-xs font-medium">Detay</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Borçlu Detayı"
        size="lg"
      >
        {selectedDebtor && (
          <DebtorDetailContent
            type={selectedDebtor.type}
            id={selectedDebtor.id}
          />
        )}
      </Modal>
    </div>
  );
}