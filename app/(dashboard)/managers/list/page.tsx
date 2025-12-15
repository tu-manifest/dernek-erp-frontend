"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Eye,
  Phone,
  Users,
  DollarSign,
  Calendar,
  Share2,
  FileText,
  Building2,
  Briefcase,
  Save,
  X as XIcon,
  Trash2,
  Loader2,
} from "lucide-react";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  Admin,
  AdminListResponse,
  AdminResponse,
  UpdateAdminPayload,
  DeleteAdminResponse
} from "@/lib/types/auth.types";

// Modül bilgileri
const SYSTEM_MODULES = [
  { id: "canManageMembers", name: "Üye Yönetimi", icon: Users },
  { id: "canManageDonations", name: "Bağış Yönetimi", icon: DollarSign },
  { id: "canManageAdmins", name: "Yönetici Yönetimi", icon: Shield },
  { id: "canManageEvents", name: "Etkinlik Yönetimi", icon: Calendar },
  { id: "canManageMeetings", name: "Toplantı Yönetimi", icon: Briefcase },
  { id: "canManageSocialMedia", name: "Sosyal Medya Yönetimi", icon: Share2 },
  { id: "canManageFinance", name: "Finansal İşlemler Yönetimi", icon: Building2 },
  { id: "canManageDocuments", name: "Döküman Yönetimi", icon: FileText },
];

export default function ManagerListPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedData, setEditedData] = useState<Admin | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all admins on mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(API_ENDPOINTS.auth.getAllAdmins, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      });

      const data: AdminListResponse = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Yöneticiler yüklenirken bir hata oluştu");
        return;
      }

      setAdmins(data.admins);
    } catch (error) {
      console.error("Fetch admins error:", error);
      toast.error("Yöneticiler yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditedData({ ...admin });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
    setEditedData(null);
  };

  const handleSaveChanges = async () => {
    if (!editedData || !selectedAdmin) return;

    // Validation
    if (!editedData.fullName.trim()) {
      toast.error("Ad Soyad alanı boş bırakılamaz!");
      return;
    }
    if (!editedData.email.trim() || !editedData.email.includes("@")) {
      toast.error("Geçerli bir e-posta adresi giriniz!");
      return;
    }
    if (!editedData.phone.trim()) {
      toast.error("Telefon numarası boş bırakılamaz!");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const payload: UpdateAdminPayload = {
        fullName: editedData.fullName,
        email: editedData.email,
        phone: editedData.phone,
        notes: editedData.notes,
        canManageMembers: editedData.permissions.canManageMembers,
        canManageDonations: editedData.permissions.canManageDonations,
        canManageAdmins: editedData.permissions.canManageAdmins,
        canManageEvents: editedData.permissions.canManageEvents,
        canManageMeetings: editedData.permissions.canManageMeetings,
        canManageSocialMedia: editedData.permissions.canManageSocialMedia,
        canManageFinance: editedData.permissions.canManageFinance,
        canManageDocuments: editedData.permissions.canManageDocuments,
      };

      const response = await fetch(API_ENDPOINTS.auth.updateAdmin(selectedAdmin.id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const data: AdminResponse = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Yönetici güncellenirken bir hata oluştu");
        return;
      }

      toast.success("Yönetici bilgileri başarıyla güncellendi!");

      // Update local state
      setAdmins(prev => prev.map(a => a.id === selectedAdmin.id ? data.admin : a));
      handleCloseModal();
    } catch (error) {
      console.error("Update admin error:", error);
      toast.error("Yönetici güncellenirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    if (!editedData) return;

    const permissionKey = permissionId as keyof typeof editedData.permissions;
    setEditedData({
      ...editedData,
      permissions: {
        ...editedData.permissions,
        [permissionKey]: !editedData.permissions[permissionKey],
      },
    });
  };

  const handleDeleteAdmin = (admin: Admin) => {
    setAdminToDelete(admin);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(API_ENDPOINTS.auth.deleteAdmin(adminToDelete.id), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      });

      const data: DeleteAdminResponse = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Yönetici silinirken bir hata oluştu");
        return;
      }

      toast.success(`${adminToDelete.fullName} başarıyla silindi!`);

      // Update local state
      setAdmins(prev => prev.filter(a => a.id !== adminToDelete.id));
      setIsDeleteModalOpen(false);
      setAdminToDelete(null);
    } catch (error) {
      console.error("Delete admin error:", error);
      toast.error("Yönetici silinirken bir hata oluştu");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setAdminToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-600">Yöneticiler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          Yönetici Listesi
        </h1>
        <p className="text-gray-600">
          Sistemdeki tüm yöneticileri görüntüleyin ve detaylarına erişin
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Ad Soyad</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Telefon</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    Henüz yönetici bulunmuyor.
                  </td>
                </tr>
              ) : (
                admins.map((admin, index) => (
                  <tr
                    key={admin.id}
                    className={`transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {admin.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{admin.fullName}</p>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-sm">{admin.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(admin)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Detay Gör"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={20} />
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

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Yönetici Detayları ve Düzenleme"
        size="lg"
      >
        {editedData && (
          <div className="space-y-6">
            {/* Temel Bilgiler */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Temel Bilgiler
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={editedData.fullName}
                    onChange={(e) =>
                      setEditedData({ ...editedData, fullName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ad Soyad"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={editedData.email}
                    onChange={(e) =>
                      setEditedData({ ...editedData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="E-posta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={editedData.phone}
                    onChange={(e) =>
                      setEditedData({ ...editedData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Telefon"
                  />
                </div>
                {editedData.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kayıt Tarihi
                    </label>
                    <input
                      type="text"
                      value={new Date(editedData.createdAt).toLocaleDateString("tr-TR")}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Yetkili Modüller */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Modül Yetkileri
              </h3>
              <div className="space-y-2">
                {SYSTEM_MODULES.map((module) => {
                  const permissionKey = module.id as keyof typeof editedData.permissions;
                  return (
                    <label
                      key={module.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editedData.permissions[permissionKey]}
                        onChange={() => togglePermission(module.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {module.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Notlar */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Notlar
              </h3>
              <textarea
                value={editedData.notes || ""}
                onChange={(e) =>
                  setEditedData({ ...editedData, notes: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Yönetici hakkında notlar..."
              />
            </div>

            {/* Aksiyonlar */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCloseModal}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XIcon size={20} />
                İptal
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Değişiklikleri Kaydet
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        title="Yönetici Silme Onayı"
        size="sm"
      >
        {adminToDelete && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-900 mb-2">
                Bu yöneticiyi silmek istediğinize emin misiniz?
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{adminToDelete.fullName}</span> adlı yönetici kalıcı olarak silinecektir.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
              >
                Hayır
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  "Evet"
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
