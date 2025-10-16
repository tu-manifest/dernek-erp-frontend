// duyuru gönderme sayfası

"use client";

import { useState } from "react";
import { Send, Mail, MessageCircle, Settings } from "lucide-react";

export default function DuyuruGonder() {
  const [activeTab, setActiveTab] = useState<"whatsapp" | "email">("email");

  // Email form verileri
  const [emailForm, setEmailForm] = useState({
    konu: "",
    icerik: "",
    kime: "", // backend belirleyecek
  });

  // WhatsApp form verileri
  const [whatsappForm, setWhatsappForm] = useState({
    mesaj: "",
  });

  const handleEmailGonder = () => {
    console.log("📧 Email Gönderiliyor:", emailForm);
    alert("E-posta gönderildi!");
  };

  const handleWhatsappGonder = () => {
    console.log("💬 WhatsApp Mesajı Gönderiliyor:", whatsappForm);
    alert("WhatsApp mesajı gönderildi!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Duyuru Yönetimi</h1>
        {/* <p className="text-gray-600 mt-1">
          Üyelere WhatsApp veya E-posta üzerinden duyuru gönderin
        </p> */}
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

      {/* Email Gönderme Alanı */}
      {activeTab === "email" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Konu
            </label>
            <input
              type="text"
              value={emailForm.konu}
              onChange={(e) =>
                setEmailForm({ ...emailForm, konu: e.target.value })
              }
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Mail konusu girin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              İçerik
            </label>
            <textarea
              value={emailForm.icerik}
              onChange={(e) =>
                setEmailForm({ ...emailForm, icerik: e.target.value })
              }
              rows={6}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="E-posta içeriğini yazın"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kime 
            </label>
            <input
              type="text"
              value={emailForm.kime}
              onChange={(e) =>
                setEmailForm({ ...emailForm, kime: e.target.value })
              }
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="(Backend tarafından belirlenecek)"
            />
          </div>

          <button
            onClick={handleEmailGonder}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Send size={18} />
            Gönder
          </button>
        </div>
      )}

      {/* WhatsApp Gönderme Alanı */}
      {activeTab === "whatsapp" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Mesaj İçeriği
            </label>

            <button
              onClick={() => alert("WhatsApp ayarları ekranı eklenecek")}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
            >
              <Settings size={16} />
              WhatsApp Ayarları
            </button>
          </div>

          <textarea
            value={whatsappForm.mesaj}
            onChange={(e) =>
              setWhatsappForm({ ...whatsappForm, mesaj: e.target.value })
            }
            rows={6}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            placeholder="Gönderilecek mesajı yazın"
          ></textarea>

          <button
            onClick={handleWhatsappGonder}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            <Send size={18} />
            Gönder
          </button>
        </div>
      )}
    </div>
  );
}