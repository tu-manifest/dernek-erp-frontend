"use client";

import { useState } from "react";
import { Search, Download, Plus, Calendar, MapPin, Users, Clock, Edit, Trash2, Eye, Filter } from "lucide-react";

interface Etkinlik {
  id: number;
  isim: string;
  tarih: string;
  saat: string;
  tur: "Online" | "Offline";
  yer: string;
  aciklama: string;
  katilimciSayisi: number;
  durum: "Planlandı" | "Devam Ediyor" | "Tamamlandı" | "İptal";
}

interface EventTableProps {
  onEdit?: (etkinlik: Etkinlik) => void;
  onDelete?: (id: number) => void;
  onAddNew?: () => void;
}

export default function EventTable({ onEdit, onDelete, onAddNew }: EventTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"Tümü" | "Planlandı" | "Geçmiş">("Tümü");
  const [sortField, setSortField] = useState<keyof Etkinlik>("tarih");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedEtkinlikler, setSelectedEtkinlikler] = useState<number[]>([]);

  const [etkinlikler] = useState<Etkinlik[]>([
    {
      id: 1,
      isim: "Yazılım Geliştirme Semineri",
      tarih: "2025-10-15",
      saat: "14:00",
      tur: "Online",
      yer: "Google Meet",
      aciklama: "Modern web teknolojileri üzerine seminer",
      katilimciSayisi: 45,
      durum: "Planlandı"
    },
    {
      id: 2,
      isim: "Yıllık Genel Kurul Toplantısı",
      tarih: "2025-10-20",
      saat: "10:00",
      tur: "Offline",
      yer: "Merkez Ofis, İstanbul",
      aciklama: "2025 yılı değerlendirmesi ve gelecek planları",
      katilimciSayisi: 120,
      durum: "Planlandı"
    },
    {
      id: 3,
      isim: "Sosyal Sorumluluk Projesi",
      tarih: "2025-09-25",
      saat: "09:00",
      tur: "Offline",
      yer: "Çankaya, Ankara",
      aciklama: "Çevre temizliği ve ağaç dikimi",
      katilimciSayisi: 67,
      durum: "Tamamlandı"
    },
    {
      id: 4,
      isim: "Kariyer Günleri",
      tarih: "2025-11-05",
      saat: "13:00",
      tur: "Online",
      yer: "Zoom",
      aciklama: "Kariyer planlama ve iş fırsatları paneli",
      katilimciSayisi: 89,
      durum: "Planlandı"
    }
  ]);

  const filteredEtkinlikler = etkinlikler
    .filter((etkinlik) => {
      const matchesSearch =
        etkinlik.isim.toLowerCase().includes(searchTerm.toLowerCase()) ||
        etkinlik.yer.toLowerCase().includes(searchTerm.toLowerCase());

      const today = new Date();
      const etkinlikTarihi = new Date(etkinlik.tarih);

      let matchesFilter = true;
      if (filterType === "Planlandı") {
        matchesFilter = etkinlikTarihi >= today;
      } else if (filterType === "Geçmiş") {
        matchesFilter = etkinlikTarihi < today;
      }

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (field: keyof Etkinlik) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectEtkinlik = (id: number) => {
    setSelectedEtkinlikler((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEtkinlikler.length === filteredEtkinlikler.length) {
      setSelectedEtkinlikler([]);
    } else {
      setSelectedEtkinlikler(filteredEtkinlikler.map(e => e.id));
    }
  };

  const getDurumRenk = (durum: string) => {
    switch (durum) {
      case "Planlandı":
        return "bg-blue-100 text-blue-800";
      case "Devam Ediyor":
        return "bg-green-100 text-green-800";
      case "Tamamlandı":
        return "bg-gray-100 text-gray-800";
      case "İptal":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const getTotalKatilimci = () => {
    return filteredEtkinlikler.reduce((total, e) => total + e.katilimciSayisi, 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Etkinlik Yönetimi</h2>
            <div className="flex items-center space-x-4 text-blue-100">
              <span>Toplam {filteredEtkinlikler.length} etkinlik</span>
              <span>•</span>
              <span>{getTotalKatilimci()} katılımcı</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Etkinlik ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 bg-white py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Tümü">Tüm Etkinlikler</option>
              <option value="Planlandı">Planlanan</option>
              <option value="Geçmiş">Geçmiş</option>
            </select>
            
            {/* Add New Button */}
            <button 
              onClick={onAddNew}
              className="bg-white text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium"
            >
              <Plus size={18} />
              <span>Yeni Etkinlik</span>
            </button>
            
            {/* Export Button */}
            <button 
              className="bg-white text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium"
            >
              <Download size={18} />
              <span>Dışa Aktar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="bg-gray-50 p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="text-blue-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Planlanan</p>
                <p className="text-xl font-bold text-gray-900">
                  {etkinlikler.filter(e => e.durum === "Planlandı").length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="text-green-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Toplam Katılımcı</p>
                <p className="text-xl font-bold text-gray-900">{getTotalKatilimci()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="text-purple-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Online</p>
                <p className="text-xl font-bold text-gray-900">
                  {etkinlikler.filter(e => e.tur === "Online").length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MapPin className="text-yellow-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Offline</p>
                <p className="text-xl font-bold text-gray-900">
                  {etkinlikler.filter(e => e.tur === "Offline").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="w-12 px-4 py-4">
                <input
                  type="checkbox"
                  checked={selectedEtkinlikler.length === filteredEtkinlikler.length && filteredEtkinlikler.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th 
                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('isim')}
              >
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Etkinlik Adı</span>
                  {sortField === 'isim' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('tarih')}
              >
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Tarih & Saat</span>
                  {sortField === 'tarih' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <span>Tür & Yer</span>
                </div>
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center space-x-2">
                  <Users size={16} />
                  <span>Katılımcı</span>
                </div>
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                Durum
              </th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredEtkinlikler.map((etkinlik) => (
              <tr 
                key={etkinlik.id} 
                className={`hover:bg-gray-50 transition-colors ${
                  selectedEtkinlikler.includes(etkinlik.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedEtkinlikler.includes(etkinlik.id)}
                    onChange={() => handleSelectEtkinlik(etkinlik.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-900">{etkinlik.isim}</div>
                  <div className="text-sm text-gray-500 mt-1 line-clamp-1">{etkinlik.aciklama}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">{formatDate(etkinlik.tarih)}</div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <Clock size={14} className="mr-1" />
                    {etkinlik.saat}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      etkinlik.tur === "Online" 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {etkinlik.tur}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{etkinlik.yer}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-blue-600">{etkinlik.katilimciSayisi}</span>
                    <span className="text-sm text-gray-500 ml-1">kişi</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDurumRenk(
                      etkinlik.durum
                    )}`}
                  >
                    {etkinlik.durum}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => onEdit?.(etkinlik)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete?.(etkinlik.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredEtkinlikler.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Etkinlik bulunamadı</h3>
          <p className="text-gray-500 mb-4">Arama kriterlerinize uygun etkinlik bulunmamaktadır.</p>
          <button 
            onClick={onAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            İlk Etkinliği Oluştur
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700">
            {selectedEtkinlikler.length > 0 && (
              <span className="font-medium">{selectedEtkinlikler.length} etkinlik seçildi</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Sayfa başına:</span>
            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}