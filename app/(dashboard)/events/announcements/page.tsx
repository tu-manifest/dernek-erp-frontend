// duyuru gönderme sayfası

"use client";

import { useState } from "react";
import { Send, Mail, MessageCircle, Settings, X } from "lucide-react";
import useGetGroups from "@/hooks/useGetGroups";
import Modal from "@/components/Modal";
import WhatsAppConnection from "@/components/WhatsAppConnection";

interface SelectedGroup {
  id: number;
  name: string;
}

export default function DuyuruGonder() {
  const [activeTab, setActiveTab] = useState<"whatsapp" | "email">("whatsapp");
  
  // WhatsApp Ayarları Modal State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Groups hook'unu kullan
  const { groups, isLoading: groupsLoading, isError: groupsError } = useGetGroups();

  // Seçili gruplar için state
  const [selectedEmailGroups, setSelectedEmailGroups] = useState<SelectedGroup[]>([]);
  const [selectedWhatsappGroups, setSelectedWhatsappGroups] = useState<SelectedGroup[]>([]);

  // Email form verileri
  const [emailForm, setEmailForm] = useState({
    konu: "",
    icerik: "",
  });

  // WhatsApp form verileri
  const [whatsappForm, setWhatsappForm] = useState({
    mesaj: "",
  });

  // API'den gelen grupları parse et
  let groupsData: any[] = [];
  if (groups) {
    if (Array.isArray(groups)) {
      groupsData = groups;
    } else if (groups.groups && Array.isArray(groups.groups)) {
      groupsData = groups.groups;
    } else if (groups.data && Array.isArray(groups.data)) {
      groupsData = groups.data;
    }
  }

  // Email için grup ekleme
  const handleAddEmailGroup = (group: any) => {
    // "Tüm Üyeler" zaten seçiliyse diğer grupları ekleme
    if (selectedEmailGroups.some(g => g.id === 0)) {
      alert('Tüm Üyeler zaten seçili. Önce onu kaldırmalısınız.');
      return;
    }

    const newGroup: SelectedGroup = {
      id: group.id,
      name: group.group_name || group.groupName || group.name
    };
    
    if (!selectedEmailGroups.some(g => g.id === newGroup.id)) {
      setSelectedEmailGroups([...selectedEmailGroups, newGroup]);
    }
  };

  // Email için grup çıkarma
  const handleRemoveEmailGroup = (groupId: number) => {
    setSelectedEmailGroups(selectedEmailGroups.filter(g => g.id !== groupId));
  };

  // WhatsApp için grup ekleme
  const handleAddWhatsappGroup = (group: any) => {
    // "Tüm Üyeler" zaten seçiliyse diğer grupları ekleme
    if (selectedWhatsappGroups.some(g => g.id === 0)) {
      alert('Tüm Üyeler zaten seçili. Önce onu kaldırmalısınız.');
      return;
    }

    const newGroup: SelectedGroup = {
      id: group.id,
      name: group.group_name || group.groupName || group.name
    };
    
    if (!selectedWhatsappGroups.some(g => g.id === newGroup.id)) {
      setSelectedWhatsappGroups([...selectedWhatsappGroups, newGroup]);
    }
  };

  // WhatsApp için grup çıkarma
  const handleRemoveWhatsappGroup = (groupId: number) => {
    setSelectedWhatsappGroups(selectedWhatsappGroups.filter(g => g.id !== groupId));
  };

  // Tüm üyeleri seç (Email)
  const handleSelectAllEmail = () => {
    // Başka gruplar seçiliyse önce onları temizle
    if (selectedEmailGroups.length > 0) {
      const confirm = window.confirm('Diğer seçili gruplar kaldırılacak. Devam etmek istiyor musunuz?');
      if (!confirm) return;
    }
    setSelectedEmailGroups([{ id: 0, name: "Tüm Üyeler" }]);
  };

  // Tüm üyeleri seç (WhatsApp)
  const handleSelectAllWhatsapp = () => {
    // Başka gruplar seçiliyse önce onları temizle
    if (selectedWhatsappGroups.length > 0) {
      const confirm = window.confirm('Diğer seçili gruplar kaldırılacak. Devam etmek istiyor musunuz?');
      if (!confirm) return;
    }
    setSelectedWhatsappGroups([{ id: 0, name: "Tüm Üyeler" }]);
  };

  const handleEmailGonder = () => {
    console.log("📧 Email Gönderiliyor:", {
      ...emailForm,
      gruplar: selectedEmailGroups
    });
    alert(`E-posta ${selectedEmailGroups.length} gruba gönderildi!`);
  };

  const handleWhatsappGonder = () => {
    console.log("💬 WhatsApp Mesajı Gönderiliyor:", {
      ...whatsappForm,
      gruplar: selectedWhatsappGroups
    });
    alert(`WhatsApp mesajı ${selectedWhatsappGroups.length} gruba gönderildi!`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Duyuru Yönetimi</h1>
      </div>

      {/* Sekme Seçimi */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 ${
              activeTab === "email"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Mail size={18} />
            E-Posta Gönder
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 ${
              activeTab === "whatsapp"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageCircle size={18} />
            WhatsApp Gönder
          </button>
        </div>
      </div>
          {/* WhatsApp Gönderme Alanı */}
      {activeTab === "whatsapp" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Mesaj İçeriği
            </label>
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-medium"
            >
              <Settings size={16} />
              WhatsApp Bağlantısı
            </button>
          </div>

          <textarea
            value={whatsappForm.mesaj}
            onChange={(e) =>
              setWhatsappForm({ ...whatsappForm, mesaj: e.target.value })
            }
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            placeholder="Gönderilecek mesajı yazın"
          ></textarea>

          {/* Kime - Seçili Gruplar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kime
            </label>
            
            {/* Seçili Gruplar - Her zaman görünür textbox benzeri alan */}
            <div className="min-h-[60px] mb-3 flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-green-400 focus-within:border-transparent">
              {selectedWhatsappGroups.length > 0 ? (
                selectedWhatsappGroups.map((group) => (
                  <div
                    key={group.id}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    <span>{group.name}</span>
                    <button
                      onClick={() => handleRemoveWhatsappGroup(group.id)}
                      className="hover:bg-green-700 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-gray-400 text-sm py-1">
                  Alıcı grubu seçmek için aşağıdaki butonları kullanın
                </span>
              )}
            </div>

            {/* Grup Seçenekleri */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-2">Grup seçiniz:</p>
              
              {/* Loading durumu */}
              {groupsLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-gray-600">Gruplar yükleniyor...</span>
                </div>
              )}

              {/* Error durumu */}
              {groupsError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">Gruplar yüklenirken hata oluştu</p>
                </div>
              )}

              {/* Grup Butonları */}
              {!groupsLoading && !groupsError && (
                <div className="flex flex-wrap gap-2">
                  {/* Tüm Üyeler */}
                  <button
                    onClick={handleSelectAllWhatsapp}
                    disabled={
                      selectedWhatsappGroups.some(g => g.id === 0) ||
                      (selectedWhatsappGroups.length > 0 && !selectedWhatsappGroups.some(g => g.id === 0))
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedWhatsappGroups.some(g => g.id === 0) ||
                      (selectedWhatsappGroups.length > 0 && !selectedWhatsappGroups.some(g => g.id === 0))
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    Tüm Üyeler
                  </button>

                  {/* Dinamik Gruplar */}
                  {groupsData.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => handleAddWhatsappGroup(group)}
                      disabled={
                        selectedWhatsappGroups.some(g => g.id === group.id) ||
                        selectedWhatsappGroups.some(g => g.id === 0)
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedWhatsappGroups.some(g => g.id === group.id) ||
                        selectedWhatsappGroups.some(g => g.id === 0)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {group.group_name || group.groupName || group.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Gönder Butonu */}
          <div className="flex justify-center">
            <button
              onClick={handleWhatsappGonder}
              disabled={selectedWhatsappGroups.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                selectedWhatsappGroups.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Send size={18} />
              {selectedWhatsappGroups.length > 0 
                ? `${selectedWhatsappGroups.length} Gruba Gönder` 
                : 'Grup Seçiniz'}
            </button>
          </div>
        </div>
      )}


      {/* Email Gönderme Alanı */}
      {activeTab === "email" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          {/* Konu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konu
            </label>
            <input
              type="text"
              value={emailForm.konu}
              onChange={(e) =>
                setEmailForm({ ...emailForm, konu: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Mail konusu girin"
            />
          </div>

          {/* İçerik */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İçerik
            </label>
            <textarea
              value={emailForm.icerik}
              onChange={(e) =>
                setEmailForm({ ...emailForm, icerik: e.target.value })
              }
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="E-posta içeriğini yazın"
            ></textarea>
          </div>

          {/* Kime - Seçili Gruplar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kime
            </label>
            
            {/* Seçili Gruplar - Her zaman görünür textbox benzeri alan */}
            <div className="min-h-[60px] mb-3 flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent">
              {selectedEmailGroups.length > 0 ? (
                selectedEmailGroups.map((group) => (
                  <div
                    key={group.id}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    <span>{group.name}</span>
                    <button
                      onClick={() => handleRemoveEmailGroup(group.id)}
                      className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-gray-400 text-sm py-1">
                  Alıcı grubu seçmek için aşağıdaki butonları kullanın
                </span>
              )}
            </div>

            {/* Grup Seçenekleri */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-2">Grup seçiniz:</p>
              
              {/* Loading durumu */}
              {groupsLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Gruplar yükleniyor...</span>
                </div>
              )}

              {/* Error durumu */}
              {groupsError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">Gruplar yüklenirken hata oluştu</p>
                </div>
              )}

              {/* Grup Butonları */}
              {!groupsLoading && !groupsError && (
                <div className="flex flex-wrap gap-2">
                  {/* Tüm Üyeler */}
                  <button
                    onClick={handleSelectAllEmail}
                    disabled={
                      selectedEmailGroups.some(g => g.id === 0) ||
                      (selectedEmailGroups.length > 0 && !selectedEmailGroups.some(g => g.id === 0))
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedEmailGroups.some(g => g.id === 0) ||
                      (selectedEmailGroups.length > 0 && !selectedEmailGroups.some(g => g.id === 0))
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Tüm Üyeler
                  </button>

                  {/* Dinamik Gruplar */}
                  {groupsData.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => handleAddEmailGroup(group)}
                      disabled={
                        selectedEmailGroups.some(g => g.id === group.id) ||
                        selectedEmailGroups.some(g => g.id === 0)
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedEmailGroups.some(g => g.id === group.id) ||
                        selectedEmailGroups.some(g => g.id === 0)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {group.group_name || group.groupName || group.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Gönder Butonu */}
          <div className="flex justify-center">
            <button
              onClick={handleEmailGonder}
              disabled={selectedEmailGroups.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                selectedEmailGroups.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Send size={18} />
              {selectedEmailGroups.length > 0 
                ? `${selectedEmailGroups.length} Gruba Gönder` 
                : 'Grup Seçiniz'}
            </button>
          </div>
        </div>
      )}

  
      {/* WhatsApp Bağlantı Modal */}
      <Modal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        title="WhatsApp Bağlantısı"
        size="lg"
      >
        <WhatsAppConnection onClose={() => setIsWhatsAppModalOpen(false)} />
      </Modal>
    </div>
  );
}