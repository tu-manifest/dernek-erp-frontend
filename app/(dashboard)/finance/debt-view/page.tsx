"use client"
import React, { useState, useEffect } from 'react';
import {
  Eye,
  Search,
  Download,
  CreditCard,
  Calendar,
  Users,
  Building2,
  AlertCircle,
  Pencil,
  X
} from 'lucide-react';
import Modal from '../../../../components/Modal';
import Link from 'next/link';
import useGetAllDebts, { Debt } from '../../../../hooks/useGetAllDebts';
import useGetDebtDetail from '../../../../hooks/useGetDebtDetail';
import useUpdateDebt, { UpdateDebtPayload } from '../../../../hooks/useUpdateDebt';

// --- Edit Modal Component ---
interface EditDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
  onUpdate: () => void; // Listeyi yenilemek için
}

const EditDebtModal = ({ isOpen, onClose, debt, onUpdate }: EditDebtModalProps) => {
  const { updateDebt, isLoading, error } = useUpdateDebt();
  const [formData, setFormData] = useState<UpdateDebtPayload>({});

  useEffect(() => {
    if (debt) {
      setFormData({
        debtType: debt.debtType,
        amount: parseFloat(debt.amount),
        currency: debt.currency,
        dueDate: debt.dueDate.split('T')[0], // Tarih formatı düzeltmesi
        description: debt.description,
        status: debt.status as any
      });
    }
  }, [debt]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debt) return;

    const result = await updateDebt(debt.id, formData);
    if (result.success) {
      onUpdate();
      onClose();
      // alert("Borç başarıyla güncellendi.");
    } else {
      alert(result.error);
    }
  };

  if (!isOpen || !debt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 opacity-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Borç Düzenle</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Hata Mesajı */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Borç Türü</label>
              <input
                type="text"
                name="debtType"
                value={formData.debtType || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tutar</label>
              <input
                type="number"
                name="amount"
                value={formData.amount || ''}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
              <select
                name="currency"
                value={formData.currency || 'TL'}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="TL">TL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vade Tarihi</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
            <select
              name="status"
              value={formData.status || 'Pending'}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="Pending">Bekliyor</option>
              <option value="Partial">Kısmi Ödenmiş</option>
              <option value="Paid">Ödendi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg mr-2 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading ? 'Güncelleniyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Detay modalı için ayrı bileşen
const DebtDetailContent = ({ debtId, onEdit }: { debtId: number, onEdit: () => void }) => {
  const { debtDetail, isLoading, isError } = useGetDebtDetail(debtId);

  if (isLoading) return <div className="p-4 text-center">Yükleniyor...</div>;
  if (isError || !debtDetail) return <div className="p-4 text-center text-red-500">Detaylar yüklenirken hata oluştu.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sol taraf - Borç Bilgileri */}
      <div className="lg:col-span-2">
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            {debtDetail.debtorType === 'MEMBER' ? (
              <Users size={20} className="text-blue-600" />
            ) : (
              <Building2 size={20} className="text-purple-600" />
            )}
            <h3 className="text-lg font-semibold">
              {debtDetail.debtorType === 'MEMBER' ? 'Üye' : 'Dış Bağışçı'}
            </h3>
          </div>
          <p className="text-gray-600 text-lg font-medium">
            {debtDetail.debtorType === 'MEMBER' ? debtDetail.member?.fullName : debtDetail.externalDebtor?.name}
          </p>
          <div className='text-sm text-gray-500 mt-1 space-y-1'>
            <p>{debtDetail.debtorType === 'MEMBER' ? debtDetail.member?.email : debtDetail.externalDebtor?.email}</p>
            {debtDetail.description && <p className='italic'>"{debtDetail.description}"</p>}
          </div>
        </div>

        {/* Ödemeler Tablosu */}
        <div className="bg-white rounded-lg shadow border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100">
            <h4 className="font-semibold text-gray-800">Ödeme Geçmişi</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miktar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yöntem</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Not</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {debtDetail.collections && debtDetail.collections.length > 0 ? (
                  debtDetail.collections.map((collection) => (
                    <tr key={collection.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(collection.collectionDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">
                        +{parseFloat(collection.amountPaid).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {debtDetail.currency}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{collection.paymentMethod}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-[150px]">{collection.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-sm text-gray-500 text-center">
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
        <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
          <h4 className="font-semibold mb-4 text-blue-900 border-b border-blue-200 pb-2">Borç Özeti</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Borç Türü</span>
              <span className="font-medium text-gray-900 text-right">{debtDetail.debtType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vade Tarihi</span>
              <span className="font-medium text-gray-900">
                {new Date(debtDetail.dueDate).toLocaleDateString('tr-TR')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Durum</span>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${debtDetail.status === 'Paid'
                  ? 'bg-green-100 text-green-700'
                  : debtDetail.status === 'Partial'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                {debtDetail.status === 'Paid' ? 'Ödendi' : debtDetail.status === 'Partial' ? 'Kısmi Ödeme' : 'Bekliyor'}
              </span>
            </div>
            <div className="h-px bg-blue-200 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Toplam</span>
              <span className="font-bold text-lg text-gray-800">
                {parseFloat(debtDetail.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {debtDetail.currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ödenen</span>
              <span className="font-medium text-green-600">
                {parseFloat(debtDetail.collectedAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {debtDetail.currency}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 bg-blue-100/50 p-2 rounded">
              <span className="text-blue-800 font-medium">Kalan</span>
              <span className="font-bold text-xl text-red-600">
                {(parseFloat(debtDetail.amount) - parseFloat(debtDetail.collectedAmount)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {debtDetail.currency}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {debtDetail.status !== 'Paid' && (
            <Link
              href={`/finance/collection?debtId=${debtDetail.id}`}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md flex items-center justify-center space-x-2 font-medium"
            >
              <CreditCard size={18} />
              <span>Ödeme Yap</span>
            </Link>
          )}

          <button
            onClick={onEdit}
            className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Pencil size={18} />
            Düzenle
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, MEMBER, EXTERNAL
  const [selectedDebtId, setSelectedDebtId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const { debts, isLoading, isError, mutate } = useGetAllDebts();

  const handleViewDetails = (id: number) => {
    setSelectedDebtId(id);
    setIsModalOpen(true);
  };

  const handleEditFromTable = (debt: Debt) => {
    setEditingDebt(debt);
    setIsEditModalOpen(true);
  };

  const handleEditFromDetail = () => {
    // Detay modalında zaten id var, ama full debt objesi lazım.
    // Listeden bulabiliriz
    const debt = debts.find(d => d.id === selectedDebtId);
    if (debt) {
      setEditingDebt(debt);
      setIsEditModalOpen(true);
      setIsModalOpen(false); // Detay modalını kapat
    }
  };

  const filteredDebts = debts.filter(debt => {
    const debtorName = debt.debtorType === 'MEMBER'
      ? debt.member?.fullName
      : debt.externalDebtor?.name;

    const matchesSearch = debtorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || debt.debtorType === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
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
                  placeholder="Borçlu adı ile ara..."
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
                <option value="all">Tüm Borçlular</option>
                <option value="MEMBER">Sadece Üyeler</option>
                <option value="EXTERNAL">Sadece Dış Bağışçılar</option>
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
                    <div className="flex items-center space-x-2">
                      <Users size={14} />
                      <span>Borçlu</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Borç Türü
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <CreditCard size={14} />
                      <span>Tutar</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Kalan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} />
                      <span>Vade</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">Yükleniyor...</td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-red-500">Veriler yüklenirken hata oluştu.</td>
                  </tr>
                ) : filteredDebts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">Kayıt bulunamadı.</td>
                  </tr>
                ) : (
                  filteredDebts.map((debt, index) => (
                    <tr key={debt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {debt.debtorType === 'MEMBER' ? (
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
                              {debt.debtorType === 'MEMBER' ? debt.member?.fullName : debt.externalDebtor?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {debt.debtorType === 'MEMBER' ? 'Üye' : 'Dış Bağışçı'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {debt.debtType}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {parseFloat(debt.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {debt.currency}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-red-600">
                          {(parseFloat(debt.amount) - parseFloat(debt.collectedAmount)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {debt.currency}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(debt.dueDate).toLocaleDateString('tr-TR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${debt.status === 'Paid'
                            ? 'bg-green-100 text-green-700'
                            : debt.status === 'Partial'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                          {debt.status === 'Paid' ? 'Ödendi' : debt.status === 'Partial' ? 'Kısmi' : 'Bekliyor'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(debt.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Detay"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEditFromTable(debt)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Düzenle"
                          >
                            <Pencil size={18} />
                          </button>
                        </div>
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
        title="Borç Detayı"
        size="lg"
      >
        {selectedDebtId && <DebtDetailContent debtId={selectedDebtId} onEdit={handleEditFromDetail} />}
      </Modal>

      {/* Edit Modal */}
      <EditDebtModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        debt={editingDebt}
        onUpdate={() => {
          mutate(); // Listeyi yenile
        }}
      />
    </div>
  );
}