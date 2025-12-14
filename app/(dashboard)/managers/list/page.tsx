"use client";

import React, { useState } from "react";
import {
  Shield,
  Eye,
  Phone,
  Mail,
  User,
  Calendar,
  Users,
  DollarSign,
  Share2,
  FileText,
  Building2,
  Briefcase,
  Save,
  X as XIcon,
  Trash2,
} from "lucide-react";
import Modal from "@/components/Modal";
import { toast } from "sonner";

// Manager interface
interface Manager {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  createdAt: string;
  modules: string[];
  notes?: string;
}

// Mock data
const MOCK_MANAGERS: Manager[] = [
  {
    id: "1",
    fullName: "Ahmet Yılmaz",
    username: "ahmet_yilmaz",
    email: "ahmet@dernek.com",
    phone: "+90 555 123 45 67",
    createdAt: "2024-01-15",
    modules: ["members", "donations", "events", "finance"],
    notes: "Yönetim kurulu başkanı, tüm finansal işlemlerden sorumlu.",
  },
  {
    id: "2",
    fullName: "Ayşe Demir",
    username: "ayse_demir",
    email: "ayse@dernek.com",
    phone: "+90 555 234 56 78",
    createdAt: "2024-02-20",
    modules: ["members", "events", "social"],
    notes: "Etkinlik koordinatörü ve sosyal medya yöneticisi.",
  },
  {
    id: "3",
    fullName: "Mehmet Kaya",
    username: "mehmet_kaya",
    email: "mehmet@dernek.com",
    phone: "+90 555 345 67 89",
    createdAt: "2024-03-10",
    modules: ["documents", "meetings"],
    notes: "Döküman arşivi ve toplantı tutanakları sorumlusu.",
  },
  {
    id: "4",
    fullName: "Fatma Şahin",
    username: "fatma_sahin",
    email: "fatma@dernek.com",
    phone: "+90 555 456 78 90",
    createdAt: "2024-04-05",
    modules: ["members", "donations"],
    notes: "Bağış kampanyaları koordinatörü.",
  },
  {
    id: "5",
    fullName: "Ali Çelik",
    username: "ali_celik",
    email: "ali@dernek.com",
    phone: "+90 555 567 89 01",
    createdAt: "2024-05-12",
    modules: ["managers", "finance", "documents"],
    notes: "IT ve sistem yönetimi sorumlusu.",
  },
];

// Modül bilgileri
const SYSTEM_MODULES = [
  { id: "members", name: "Üye Yönetimi", icon: Users },
  { id: "donations", name: "Bağış Yönetimi", icon: DollarSign },
  { id: "managers", name: "Yönetici Yönetimi", icon: Shield },
  { id: "events", name: "Etkinlik Yönetimi", icon: Calendar },
  { id: "meetings", name: "Toplantı Yönetimi", icon: Briefcase },
  { id: "social", name: "Sosyal Medya Yönetimi", icon: Share2 },
  { id: "finance", name: "Finansal İşlemler Yönetimi", icon: Building2 },
  { id: "documents", name: "Döküman Yönetimi", icon: FileText },
];

export default function ManagerListPage() {
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedData, setEditedData] = useState<Manager | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<Manager | null>(null);

  const handleViewDetails = (manager: Manager) => {
    setSelectedManager(manager);
    setEditedData({ ...manager });
    setSelectedModules([...manager.modules]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedManager(null);
    setEditedData(null);
    setSelectedModules([]);
  };

  const handleSaveChanges = () => {
    if (!editedData) return;

    // Validation
    if (!editedData.fullName.trim()) {
      toast.error("Ad Soyad alanı boş bırakılamaz!");
      return;
    }
    if (!editedData.username.trim()) {
      toast.error("Kullanıcı adı boş bırakılamaz!");
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

    // Simulate save
    console.log("Kaydedilen veri:", { ...editedData, modules: selectedModules });
    toast.success("Yönetici bilgileri başarıyla güncellendi!");
    handleCloseModal();
  };

  const toggleModule = (moduleId: string) => {
    if (selectedModules.includes(moduleId)) {
      setSelectedModules(selectedModules.filter((m) => m !== moduleId));
    } else {
      setSelectedModules([...selectedModules, moduleId]);
    }
  };

  const handleDeleteManager = (manager: Manager) => {
    setManagerToDelete(manager);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (managerToDelete) {
      console.log("Silinen yönetici:", managerToDelete);
      toast.success(`${managerToDelete.fullName} başarıyla silindi!`);
      setIsDeleteModalOpen(false);
      setManagerToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setManagerToDelete(null);
  };

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
              {MOCK_MANAGERS.map((manager, index) => (
                <tr
                  key={manager.id}
                  className={`transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {manager.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{manager.fullName}</p>
                        <p className="text-sm text-gray-500">@{manager.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-sm">{manager.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewDetails(manager)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Detay Gör"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteManager(manager)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                    Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    value={editedData.username}
                    onChange={(e) =>
                      setEditedData({ ...editedData, username: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Kullanıcı Adı"
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
              </div>
            </div>

            {/* Yetkili Modüller */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Modül Yetkileri
              </h3>
              <div className="space-y-2">
                {SYSTEM_MODULES.map((module) => (
                  <label
                    key={module.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(module.id)}
                      onChange={() => toggleModule(module.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {module.name}
                    </span>
                  </label>
                ))}
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
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <XIcon size={20} />
                İptal
              </button>
              <button
                onClick={handleSaveChanges}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Değişiklikleri Kaydet
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
        {managerToDelete && (
          <div className="space-y-6">
            <div className="text-center">
            
              <p className="text-lg text-gray-900 mb-2">
                Bu kullanıcıyı silmek istiyor musunuz?
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{managerToDelete.fullName}</span> adlı yönetici kalıcı olarak silinecektir.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Hayır
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Evet
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
