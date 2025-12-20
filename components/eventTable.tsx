"use client";

import { useState } from "react";
import { Search, Download, Plus, Calendar, MapPin, Users, Clock, Edit, Trash2, Loader2, AlertCircle, Save, X, Globe, Info } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useGetAllEvents from "../hooks/useGetAllEvents";
import { Event, deleteEvent, updateEvent, UpdateEventPayload } from "../lib/api/eventService";
import Modal from "../components/Modal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EventTableProps {
  onAddNew?: () => void;
}

export default function EventTable({ onAddNew }: EventTableProps) {
  const router = useRouter();
  const { events, stats, isLoading, isError, refetch } = useGetAllEvents();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"Tümü" | "Planlandı" | "Geçmiş">("Tümü");
  const [sortField, setSortField] = useState<"eventName" | "date">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedEtkinlikler, setSelectedEtkinlikler] = useState<number[]>([]);

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    eventName: "",
    date: "",
    time: "",
    eventType: "Fiziksel" as "Fiziksel" | "Çevrimiçi",
    location: "",
    platform: "",
    eventLink: "",
    description: "",
    quota: "",
    status: "Planlandı" as "Planlandı" | "Devam Ediyor" | "Tamamlandı" | "İptal"
  });

  // API Error states
  const [editApiError, setEditApiError] = useState<string | null>(null);
  const [deleteApiError, setDeleteApiError] = useState<string | null>(null);


  const filteredEtkinlikler = events
    .filter((etkinlik) => {
      const matchesSearch =
        etkinlik.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (etkinlik.location?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

      const today = new Date();
      const etkinlikTarihi = new Date(etkinlik.date);

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

  const handleSort = (field: "eventName" | "date") => {
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

  const formatTime = (timeString: string) => {
    // "14:00:00" formatından "14:00" formatına çevir
    return timeString ? timeString.substring(0, 5) : "";
  };

  const getTotalKatilimci = () => {
    return filteredEtkinlikler.reduce((total, e) => total + (e.quota || 0), 0);
  };

  // Edit Modal Handlers
  const handleEditClick = (etkinlik: Event) => {
    setSelectedEvent(etkinlik);
    setEditFormData({
      eventName: etkinlik.eventName,
      date: etkinlik.date,
      time: etkinlik.time ? etkinlik.time.substring(0, 5) : "",
      eventType: etkinlik.eventType,
      location: etkinlik.location || "",
      platform: etkinlik.platform || "",
      eventLink: etkinlik.eventLink || "",
      description: etkinlik.description || "",
      quota: etkinlik.quota?.toString() || "",
      status: etkinlik.status
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setEditApiError(null);

    setIsUpdating(true);
    try {
      const payload: UpdateEventPayload = {
        eventName: editFormData.eventName,
        date: editFormData.date,
        time: editFormData.time,
        eventType: editFormData.eventType,
        description: editFormData.description,
        quota: editFormData.quota ? parseInt(editFormData.quota) : undefined,
      };

      if (editFormData.eventType === "Fiziksel") {
        payload.location = editFormData.location;
      } else {
        payload.platform = editFormData.platform;
        payload.eventLink = editFormData.eventLink;
      }

      await updateEvent(selectedEvent.id, payload);
      setIsEditModalOpen(false);
      setSelectedEvent(null);
      toast.success("Etkinlik başarıyla güncellendi!");
      refetch();
    } catch (error: any) {
      console.error("Etkinlik güncellenirken hata:", error);
      toast.error(error.message || "Etkinlik güncellenirken bir hata oluştu!");
      setEditApiError(error.message || "Etkinlik güncellenirken bir hata oluştu!");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Modal Handlers
  const handleDeleteClick = (etkinlik: Event) => {
    setSelectedEvent(etkinlik);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return;
    setDeleteApiError(null);

    setIsDeleting(true);
    try {
      await deleteEvent(selectedEvent.id);
      setIsDeleteModalOpen(false);
      setSelectedEvent(null);
      toast.success("Etkinlik başarıyla silindi!");
      refetch();
    } catch (error: any) {
      console.error("Etkinlik silinirken hata:", error);
      toast.error(error.message || "Etkinlik silinirken bir hata oluştu!");
      setDeleteApiError(error.message || "Etkinlik silinirken bir hata oluştu!");
    } finally {
      setIsDeleting(false);
    }
  };

  // Excel Export fonksiyonu
  const handleExportExcel = () => {
    if (!filteredEtkinlikler.length) {
      alert("Listelenecek etkinlik bulunamadı!");
      return;
    }

    const exportData = filteredEtkinlikler.map((etkinlik) => ({
      "Etkinlik Adı": etkinlik.eventName,
      "Tarih": formatDate(etkinlik.date),
      "Saat": formatTime(etkinlik.time),
      "Tür": etkinlik.eventType === "Çevrimiçi" ? "Online" : "Offline",
      "Yer": etkinlik.location || etkinlik.platform || "",
      "Açıklama": etkinlik.description,
      "Kontenjan": etkinlik.quota,
      "Durum": etkinlik.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Etkinlikler");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `EtkinlikListesi_${new Date().toLocaleDateString("tr-TR")}.xlsx`);
  };

  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
    } else {
      router.push("/events/add");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Etkinlikler yükleniyor...</h3>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Bir hata oluştu</h3>
        <p className="text-gray-500 mb-4">Etkinlikler yüklenirken bir sorun oluştu.</p>
        <button
          onClick={refetch}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Etkinlik Yönetimi</h2>

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



              {/* Export Button */}
              <button
                onClick={handleExportExcel}
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
                    {stats.plannedEvents}
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
                  <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
                  <p className="text-xl font-bold text-gray-900">{stats.completedEvents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Globe className="text-purple-600" size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Online</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.onlineEvents}
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
                  <p className="text-sm font-medium text-gray-600">Fiziksel</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.offlineEvents}
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
                  onClick={() => handleSort('eventName')}
                >
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>Etkinlik Adı</span>
                    {sortField === 'eventName' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>Tarih & Saat</span>
                    {sortField === 'date' && (
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
                    <span>Kontenjan</span>
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
                  className={`hover:bg-gray-50 transition-colors ${selectedEtkinlikler.includes(etkinlik.id) ? 'bg-blue-50' : ''
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
                    <div className="font-medium text-gray-900">{etkinlik.eventName}</div>
                    <div className="text-sm text-gray-500 mt-1 line-clamp-1">{etkinlik.description}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{formatDate(etkinlik.date)}</div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <Clock size={14} className="mr-1" />
                      {formatTime(etkinlik.time)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${etkinlik.eventType === "Çevrimiçi"
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-orange-100 text-orange-800'
                        }`}>
                        {etkinlik.eventType === "Çevrimiçi" ? "Online" : "Offline"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {etkinlik.location || etkinlik.platform || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-blue-600">{etkinlik.quota || 0}</span>
                      <span className="text-sm text-gray-500 ml-1">kişi</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDurumRenk(
                        etkinlik.status
                      )}`}
                    >
                      {etkinlik.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEditClick(etkinlik)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(etkinlik)}
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
              onClick={handleAddNew}
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
              <span className="text-sm text-gray-700">Toplam: {stats.totalEvents} etkinlik</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Etkinlik Sil"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <Trash2 className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Etkinliği silmek istediğinize emin misiniz?
          </h3>
          <p className="text-gray-500 mb-4">
            <strong>"{selectedEvent?.eventName}"</strong> etkinliği kalıcı olarak silinecektir. Bu işlem geri alınamaz.
          </p>

          {/* Delete Error Alert */}
          {deleteApiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-600 text-sm">{deleteApiError}</p>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isDeleting}
            >
              İptal
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Sil
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Etkinlik Düzenle"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-6">
          {/* Edit Error Alert */}
          {editApiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="text-red-800 font-medium">Hata</h4>
                <p className="text-red-600 text-sm mt-1">{editApiError}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditApiError(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Temel Bilgiler */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Info size={20} />
              Temel Bilgiler
            </h3>

            <div className="space-y-4">
              {/* Etkinlik İsmi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etkinlik İsmi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={editFormData.eventName}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Tarih ve Saat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Tarih <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={editFormData.date}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock size={16} className="inline mr-1" />
                    Saat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={editFormData.time}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Kontenjan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kontenjan
                </label>
                <input
                  type="number"
                  name="quota"
                  value={editFormData.quota}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>

              {/* Durum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Planlandı">Planlandı</option>
                  <option value="Devam Ediyor">Devam Ediyor</option>
                  <option value="Tamamlandı">Tamamlandı</option>
                  <option value="İptal">İptal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Etkinlik Türü ve Yer */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Etkinlik Türü ve Konum
            </h3>

            <div className="space-y-4">
              {/* Etkinlik Türü */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etkinlik Türü <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="eventType"
                      value="Fiziksel"
                      checked={editFormData.eventType === "Fiziksel"}
                      onChange={handleEditFormChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Fiziksel (Offline)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="eventType"
                      value="Çevrimiçi"
                      checked={editFormData.eventType === "Çevrimiçi"}
                      onChange={handleEditFormChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Çevrimiçi (Online)</span>
                  </label>
                </div>
              </div>

              {/* Fiziksel - Yer Bilgisi */}
              {editFormData.eventType === "Fiziksel" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etkinlik Yeri
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editFormData.location}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Örn: Merkez Ofis, İstanbul"
                  />
                </div>
              )}

              {/* Online - Platform ve Link */}
              {editFormData.eventType === "Çevrimiçi" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe size={16} className="inline mr-1" />
                      Platform
                    </label>
                    <select
                      name="platform"
                      value={editFormData.platform}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Platform Seçiniz</option>
                      <option value="Google Meet">Google Meet</option>
                      <option value="Zoom">Zoom</option>
                      <option value="Microsoft Teams">Microsoft Teams</option>
                      <option value="YouTube Live">YouTube Canlı Yayın</option>
                      <option value="Twitch">Twitch</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Etkinlik Linki
                    </label>
                    <input
                      type="url"
                      name="eventLink"
                      value={editFormData.eventLink}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etkinlik Açıklaması
            </label>
            <textarea
              name="description"
              value={editFormData.description}
              onChange={handleEditFormChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Etkinlik hakkında detaylı bilgi verin..."
            />
          </div>

          {/* Butonlar */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              disabled={isUpdating}
            >
              <X size={18} />
              İptal
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isUpdating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}