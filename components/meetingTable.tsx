"use client";

import { useState } from "react";
import { Search, Download, Calendar, MapPin, Users, Clock, Edit, Trash2, Loader2, AlertCircle, Save, X, Globe, Info, FileText, Briefcase } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useGetAllMeetings from "../hooks/useGetAllMeetings";
import { Meeting, updateMeeting, deleteMeeting, UpdateMeetingPayload, MeetingType, MeetingStatus } from "../lib/api/meetingService";
import Modal from "../components/Modal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MeetingTableProps {
    onAddNew?: () => void;
}

export default function MeetingTable({ onAddNew }: MeetingTableProps) {
    const router = useRouter();
    const { meetings, stats, isLoading, isError, refetch } = useGetAllMeetings();

    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"Tümü" | "Planlandı" | "Tamamlandı" | "İptal">("Tümü");
    const [sortField, setSortField] = useState<"title" | "date">("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [selectedMeetings, setSelectedMeetings] = useState<number[]>([]);

    // Modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Edit form state
    const [editFormData, setEditFormData] = useState({
        title: "",
        date: "",
        startTime: "",
        endTime: "",
        meetingType: "Yönetim Kurulu" as MeetingType,
        meetingFormat: "Fiziksel" as "Fiziksel" | "Çevrimiçi",
        location: "",
        platform: "",
        meetingLink: "",
        agenda: "",
        minutes: "",
        participantCount: "",
        status: "Planlandı" as MeetingStatus
    });

    // API Error states
    const [editApiError, setEditApiError] = useState<string | null>(null);
    const [deleteApiError, setDeleteApiError] = useState<string | null>(null);


    const filteredMeetings = meetings
        .filter((meeting) => {
            const matchesSearch =
                meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (meeting.location?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                (meeting.agenda?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

            let matchesFilter = true;
            if (filterType !== "Tümü") {
                matchesFilter = meeting.status === filterType;
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

    const handleSort = (field: "title" | "date") => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleSelectMeeting = (id: number) => {
        setSelectedMeetings((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedMeetings.length === filteredMeetings.length) {
            setSelectedMeetings([]);
        } else {
            setSelectedMeetings(filteredMeetings.map(m => m.id));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
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

    const getMeetingTypeColor = (type: string) => {
        switch (type) {
            case "Yönetim Kurulu":
                return "bg-blue-100 text-blue-800";
            case "Genel Kurul":
                return "bg-blue-100 text-blue-800";
            case "Komisyon":
                return "bg-orange-100 text-orange-800";
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
        return timeString ? timeString.substring(0, 5) : "";
    };

    // Edit Modal Handlers
    const handleEditClick = (meeting: Meeting) => {
        setSelectedMeeting(meeting);
        setEditFormData({
            title: meeting.title,
            date: meeting.date,
            startTime: meeting.startTime ? meeting.startTime.substring(0, 5) : "",
            endTime: meeting.endTime ? meeting.endTime.substring(0, 5) : "",
            meetingType: meeting.meetingType,
            meetingFormat: meeting.meetingFormat,
            location: meeting.location || "",
            platform: meeting.platform || "",
            meetingLink: meeting.meetingLink || "",
            agenda: meeting.agenda || "",
            minutes: meeting.minutes || "",
            participantCount: meeting.participantCount?.toString() || "",
            status: meeting.status
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
        if (!selectedMeeting) return;
        setEditApiError(null);

        setIsUpdating(true);
        try {
            const payload: UpdateMeetingPayload = {
                title: editFormData.title,
                date: editFormData.date,
                startTime: editFormData.startTime,
                endTime: editFormData.endTime,
                meetingType: editFormData.meetingType,
                meetingFormat: editFormData.meetingFormat,
                agenda: editFormData.agenda,
                minutes: editFormData.minutes || undefined,
                status: editFormData.status,
                participantCount: editFormData.participantCount ? parseInt(editFormData.participantCount) : undefined,
            };

            if (editFormData.meetingFormat === "Fiziksel") {
                payload.location = editFormData.location;
            } else {
                payload.platform = editFormData.platform;
                payload.meetingLink = editFormData.meetingLink;
            }

            await updateMeeting(selectedMeeting.id, payload);
            setIsEditModalOpen(false);
            setSelectedMeeting(null);
            toast.success("Toplantı başarıyla güncellendi!");
            refetch();
        } catch (error: any) {
            console.error("Toplantı güncellenirken hata:", error);
            toast.error(error.message || "Toplantı güncellenirken bir hata oluştu!");
            setEditApiError(error.message || "Toplantı güncellenirken bir hata oluştu!");
        } finally {
            setIsUpdating(false);
        }
    };

    // Delete Modal Handlers
    const handleDeleteClick = (meeting: Meeting) => {
        setSelectedMeeting(meeting);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedMeeting) return;
        setDeleteApiError(null);

        setIsDeleting(true);
        try {
            await deleteMeeting(selectedMeeting.id);
            setIsDeleteModalOpen(false);
            setSelectedMeeting(null);
            toast.success("Toplantı başarıyla silindi!");
            refetch();
        } catch (error: any) {
            console.error("Toplantı silinirken hata:", error);
            toast.error(error.message || "Toplantı silinirken bir hata oluştu!");
            setDeleteApiError(error.message || "Toplantı silinirken bir hata oluştu!");
        } finally {
            setIsDeleting(false);
        }
    };

    // Excel Export fonksiyonu
    const handleExportExcel = () => {
        if (!filteredMeetings.length) {
            toast.error("Listelenecek toplantı bulunamadı!");
            return;
        }

        const exportData = filteredMeetings.map((meeting) => ({
            "Toplantı Başlığı": meeting.title,
            "Tür": meeting.meetingType,
            "Tarih": formatDate(meeting.date),
            "Başlangıç": formatTime(meeting.startTime),
            "Bitiş": formatTime(meeting.endTime),
            "Şekil": meeting.meetingFormat,
            "Yer/Platform": meeting.location || meeting.platform || "",
            "Katılımcı": meeting.participantCount || "",
            "Durum": meeting.status,
            "Gündem": meeting.agenda,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Toplantılar");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `ToplantiListesi_${new Date().toLocaleDateString("tr-TR")}.xlsx`);
    };

    const handleAddNew = () => {
        if (onAddNew) {
            onAddNew();
        } else {
            router.push("/meetings/schedule");
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Toplantılar yükleniyor...</h3>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Bir hata oluştu</h3>
                <p className="text-gray-500 mb-4">Toplantılar yüklenirken bir sorun oluştu.</p>
                <button
                    onClick={refetch}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Tekrar Dene
                </button>
            </div>
        );
    }

    const meetingTypes: MeetingType[] = ["Yönetim Kurulu", "Genel Kurul", "Komisyon", "Diğer"];
    const meetingStatuses: MeetingStatus[] = ["Planlandı", "Devam Ediyor", "Tamamlandı", "İptal"];

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Toplantı Yönetimi</h2>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Toplantı ara..."
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
                                <option value="Tümü">Tüm Toplantılar</option>
                                <option value="Planlandı">Planlandı</option>
                                <option value="Tamamlandı">Tamamlandı</option>
                                <option value="İptal">İptal Edildi</option>
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
                                    <Briefcase className="text-blue-600" size={20} />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Planlanan</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {stats.plannedMeetings}
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
                                    <p className="text-xl font-bold text-gray-900">{stats.completedMeetings}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <X className="text-red-600" size={20} />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">İptal Edilen</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {stats.cancelledMeetings}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Calendar className="text-blue-600" size={20} />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Bu Ay</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {stats.thisMonthMeetings}
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
                                        checked={selectedMeetings.length === filteredMeetings.length && filteredMeetings.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </th>
                                <th
                                    className="px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSort('title')}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Briefcase size={16} />
                                        <span>Toplantı</span>
                                        {sortField === 'title' && (
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
                                        <span>Konum</span>
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
                            {filteredMeetings.map((meeting) => (
                                <tr
                                    key={meeting.id}
                                    className={`hover:bg-gray-50 transition-colors ${selectedMeetings.includes(meeting.id) ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedMeetings.includes(meeting.id)}
                                            onChange={() => handleSelectMeeting(meeting.id)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="font-medium text-gray-900">{meeting.title}</div>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getMeetingTypeColor(meeting.meetingType)}`}>
                                                {meeting.meetingType}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-sm text-gray-900">{formatDate(meeting.date)}</div>
                                        <div className="text-sm text-gray-500 flex items-center mt-1">
                                            <Clock size={14} className="mr-1" />
                                            {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${meeting.meetingFormat === "Çevrimiçi"
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                {meeting.meetingFormat === "Çevrimiçi" ? "Online" : "Fiziksel"}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {meeting.location || meeting.platform || "-"}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center">
                                            <span className="text-2xl font-bold text-blue-600">{meeting.participantCount || 0}</span>
                                            <span className="text-sm text-gray-500 ml-1">kişi</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                meeting.status
                                            )}`}
                                        >
                                            {meeting.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => handleEditClick(meeting)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(meeting)}
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
                {filteredMeetings.length === 0 && (
                    <div className="text-center py-12">
                        <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Toplantı bulunamadı</h3>
                        <p className="text-gray-500 mb-4">Arama kriterlerinize uygun toplantı bulunmamaktadır.</p>
                        <button
                            onClick={handleAddNew}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            İlk Toplantıyı Planla
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="text-sm text-gray-700">
                            {selectedMeetings.length > 0 && (
                                <span className="font-medium">{selectedMeetings.length} toplantı seçildi</span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">Toplam: {stats.totalMeetings} toplantı</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Toplantı Sil"
                size="sm"
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                        <Trash2 className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Toplantıyı silmek istediğinize emin misiniz?
                    </h3>
                    <p className="text-gray-500 mb-4">
                        <strong>"{selectedMeeting?.title}"</strong> toplantısı kalıcı olarak silinecektir. Bu işlem geri alınamaz.
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
                title="Toplantı Düzenle"
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
                            {/* Toplantı Başlığı */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Toplantı Başlığı <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editFormData.title}
                                    onChange={handleEditFormChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Toplantı Türü ve Durum */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Toplantı Türü
                                    </label>
                                    <select
                                        name="meetingType"
                                        value={editFormData.meetingType}
                                        onChange={handleEditFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {meetingTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

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
                                        {meetingStatuses.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Tarih ve Saatler */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        Başlangıç <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={editFormData.startTime}
                                        onChange={handleEditFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Clock size={16} className="inline mr-1" />
                                        Bitiş <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={editFormData.endTime}
                                        onChange={handleEditFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Katılımcı Sayısı */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Katılımcı Sayısı
                                </label>
                                <input
                                    type="number"
                                    name="participantCount"
                                    value={editFormData.participantCount}
                                    onChange={handleEditFormChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    min="1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Konum Bilgileri */}
                    <div className="border-b pb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin size={20} />
                            Konum Bilgileri
                        </h3>

                        <div className="space-y-4">
                            {/* Konum Tipi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Toplantı Şekli
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="meetingFormat"
                                            value="Fiziksel"
                                            checked={editFormData.meetingFormat === "Fiziksel"}
                                            onChange={handleEditFormChange}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-gray-700">Fiziksel</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="meetingFormat"
                                            value="Çevrimiçi"
                                            checked={editFormData.meetingFormat === "Çevrimiçi"}
                                            onChange={handleEditFormChange}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-gray-700">Çevrimiçi</span>
                                    </label>
                                </div>
                            </div>

                            {/* Fiziksel - Konum */}
                            {editFormData.meetingFormat === "Fiziksel" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Toplantı Yeri
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={editFormData.location}
                                        onChange={handleEditFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Örn: Dernek Merkezi"
                                    />
                                </div>
                            )}

                            {/* Online - Platform ve Link */}
                            {editFormData.meetingFormat === "Çevrimiçi" && (
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
                                            <option value="Discord">Discord</option>
                                            <option value="Diğer">Diğer</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Toplantı Linki
                                        </label>
                                        <input
                                            type="url"
                                            name="meetingLink"
                                            value={editFormData.meetingLink}
                                            onChange={handleEditFormChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Gündem ve Tutanak */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FileText size={16} className="inline mr-1" />
                                Gündem
                            </label>
                            <textarea
                                name="agenda"
                                value={editFormData.agenda}
                                onChange={handleEditFormChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FileText size={16} className="inline mr-1" />
                                Toplantı Tutanağı / Notlar
                            </label>
                            <textarea
                                name="minutes"
                                value={editFormData.minutes}
                                onChange={handleEditFormChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Toplantı sonrası notları buraya ekleyebilirsiniz..."
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            disabled={isUpdating}
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
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
