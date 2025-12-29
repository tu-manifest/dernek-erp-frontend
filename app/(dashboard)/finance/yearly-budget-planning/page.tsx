"use client";

import { useState, useEffect } from "react";
import useGetBudget, { BudgetItem } from "../../../../hooks/useGetBudget";
import useGetBudgetYears from "../../../../hooks/useGetBudgetYears";
import useDeleteBudget from "../../../../hooks/useDeleteBudget";
import useSaveBudget from "../../../../hooks/useSaveBudget";
import useDeleteBudgetItem from "../../../../hooks/useDeleteBudgetItem";
import Modal from "../../../../components/Modal";
import { toast } from "sonner";

interface LocalBudgetItem {
  id: string;
  type: "gelir" | "gider";
  category: string;
  item: string;
  amount: number;
  apiId?: number; // API'den gelen kayıtlar için
}

const gelirKalemleri = {
  "A. Temel ve Düzenli Gelirler": [
    "Üyelik Aidatları (Yıllık)",
    "Üyelik Giriş Aidatları (Tek Seferlik)",
    "Genel Bağış ve Yardımlar (Nakdi)",
    "SMS Bağışları",
    "Online Genel Bağışlar",
    "Kasa/Elden Tahsil Edilen Bağışlar",
    "Sponsorluk Gelirleri",
    "Kurumsal Ana Sponsorluk Gelirleri",
    "Etkinlik Sponsorluk Gelirleri",
  ],
  "B. Proje ve Faaliyet Gelirleri": [
    "Proje Hibe ve Fon Gelirleri (Yurt İçi)",
    "KOSGEB / Kalkınma Ajansı Fonları",
    "Belediyelerden Alınan Proje Destekleri",
    "Proje Hibe ve Fon Gelirleri (Yurt Dışı)",
    "AB / BM Fonları ve Hibeleri",
    "Yabancı Kurum/Kuruluş Bağışları",
    "Eğitim, Seminer ve Yayın Gelirleri",
    "Eğitim ve Kurs Katılım Ücretleri",
    "Yayın/Kitap Satış Gelirleri",
    "Sosyal Etkinlik Gelirleri",
    "Kermes Gelirleri",
    "Konser/Gösteri Bilet Satış Gelirleri",
    "İhale ve Açık Artırma Gelirleri",
  ],
  "C. Mali ve Varlık Gelirleri": [
    "İktisadi İşletme Gelirleri",
    "Mal/Hizmet Satışından Doğan Hasılat",
    "Reklam Gelirleri (İktisadi İşletme Kapsamında)",
    "Faiz Gelirleri (Mali Gelirler)",
    "Banka Mevduat Faizleri",
    "Tahvil/Bono Faizleri",
    "Kira Gelirleri (Gayrimenkul/Demirbaş Kiralamadan)",
    "Menkul Kıymet Satış Karları",
    "Varlık Satış Gelirleri",
  ],
  "D. Diğer Olağanüstü Gelirler": [
    "Diğer Çeşitli Gelirler",
    "Ceza ve Tazminat Gelirleri",
    "Gelecek Yıllara Ait Gelirler",
    "Geçmiş Yıl Gelirleri",
  ],
};

const giderKalemleri = {
  "1. Personel Giderleri": [
    "Maaş ve Ücretler",
    "Sosyal Güvenlik İşveren Payı",
    "Kıdem ve İhbar Tazminatı Karşılığı",
    "Yolluk, Harcırah ve Gündelikler",
  ],
  "2. İdari ve Genel Giderler": [
    "Kira Gideri (Merkez/Şube)",
    "Büro Malzemeleri ve Kırtasiye",
    "Isıtma, Aydınlatma, Su Giderleri",
    "Haberleşme Giderleri",
    "Bakım ve Onarım Giderleri",
    "Temizlik ve Güvenlik Hizmeti",
    "Hukuk ve Mali Müşavirlik Ücretleri",
    "Vergi, Resim ve Harçlar",
    "Sigorta Giderleri",
  ],
  "3. Esas Amaç Giderleri": [
    "Proje A - Faaliyet Maliyetleri",
    "Ayni Yardım Giderleri",
    "Araştırma ve Geliştirme Giderleri",
    "Burs ve Sosyal Yardım Ödemeleri",
    "Yayın, Tanıtım ve Temsil Gid.",
  ],
  "4. Fon Toplama Giderleri": [
    "Etkinlik Organizasyon Giderleri",
    "Pazarlama ve Tanıtım Gid.",
    "Fon Toplama Personel Gideri",
  ],
  "5. Mali ve Duran Varlık Giderleri": [
    "Banka Komisyon Giderleri",
    "Finansman Giderleri (Borç Faizleri)",
    "Amortisman Giderleri",
    "Demirbaş Alımları (Gider Yazılan)",
  ],
  "6. Diğer ve Olağanüstü Giderler": [
    "Kanunen Kabul Edilmeyen Giderler (KKEG)",
    "Diğer Çeşitli Giderler",
    "Geçmiş Yıl Zararları",
  ],
};

export default function BudgetPlanningPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedType, setSelectedType] = useState<"gelir" | "gider">("gelir");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [gelirItems, setGelirItems] = useState<LocalBudgetItem[]>([]);
  const [giderItems, setGiderItems] = useState<LocalBudgetItem[]>([]);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // API Hooks
  const { gelirItems: apiGelirItems, giderItems: apiGiderItems, isLoading: budgetLoading, refetch: refetchBudget } = useGetBudget(selectedYear);
  const { years: availableYears, isLoading: yearsLoading, refetch: refetchYears } = useGetBudgetYears();
  const { deleteBudget, isLoading: deleteLoading } = useDeleteBudget();
  const { saveBudget, isLoading: saveLoading } = useSaveBudget();
  const { deleteBudgetItem, isLoading: deleteItemLoading } = useDeleteBudgetItem();

  // API'den gelen verileri local state'e yükle
  // JSON karşılaştırması ile gereksiz güncellemeleri önle
  useEffect(() => {
    const mappedItems: LocalBudgetItem[] = apiGelirItems.map((item: BudgetItem) => ({
      id: item.id.toString(),
      type: 'gelir' as const,
      category: item.category,
      item: item.item,
      amount: item.amount,
      apiId: item.id,
    }));

    // Sadece gerçekten değişiklik varsa güncelle
    setGelirItems(prev => {
      const prevJson = JSON.stringify(prev.map(p => ({ apiId: p.apiId, category: p.category, item: p.item, amount: p.amount })));
      const newJson = JSON.stringify(mappedItems.map(n => ({ apiId: n.apiId, category: n.category, item: n.item, amount: n.amount })));
      return prevJson === newJson ? prev : mappedItems;
    });
  }, [apiGelirItems]);

  useEffect(() => {
    const mappedItems: LocalBudgetItem[] = apiGiderItems.map((item: BudgetItem) => ({
      id: item.id.toString(),
      type: 'gider' as const,
      category: item.category,
      item: item.item,
      amount: item.amount,
      apiId: item.id,
    }));

    // Sadece gerçekten değişiklik varsa güncelle
    setGiderItems(prev => {
      const prevJson = JSON.stringify(prev.map(p => ({ apiId: p.apiId, category: p.category, item: p.item, amount: p.amount })));
      const newJson = JSON.stringify(mappedItems.map(n => ({ apiId: n.apiId, category: n.category, item: n.item, amount: n.amount })));
      return prevJson === newJson ? prev : mappedItems;
    });
  }, [apiGiderItems]);

  // NOT: SWR, selectedYear değiştiğinde otomatik olarak yeni veriyi çeker
  // çünkü API_ENDPOINTS.budget.getByYear(year) URL'i year'a bağlıdır.
  // Bu nedenle manuel refetch'e gerek yoktur.

  const currentKalemler =
    selectedType === "gelir" ? gelirKalemleri : giderKalemleri;
  const availableItems = selectedCategory
    ? currentKalemler[selectedCategory as keyof typeof currentKalemler] || []
    : [];

  // Yıl seçenekleri oluştur (mevcut yıl -2 ile +5 arası)
  const yearOptions = [];
  for (let y = currentYear - 2; y <= currentYear + 5; y++) {
    yearOptions.push(y);
  }

  const handleAddItem = () => {
    if (!selectedCategory || !selectedItem || !amount) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    const newItem: LocalBudgetItem = {
      id: Date.now().toString(),
      type: selectedType,
      category: selectedCategory,
      item: selectedItem,
      amount: parseFloat(amount),
    };

    if (selectedType === "gelir") {
      setGelirItems([...gelirItems, newItem]);
    } else {
      setGiderItems([...giderItems, newItem]);
    }

    // Reset form
    setSelectedCategory("");
    setSelectedItem("");
    setAmount("");
  };

  const handleDeleteItem = async (id: string, type: "gelir" | "gider") => {
    const items = type === "gelir" ? gelirItems : giderItems;
    const itemToDelete = items.find(item => item.id === id);

    // Eğer API'den gelen bir kayıt ise API'den de sil
    if (itemToDelete?.apiId) {
      const result = await deleteBudgetItem(itemToDelete.apiId);
      if (!result.success) {
        toast.error(`Silme hatası: ${result.error}`);
        return;
      }
    }

    if (type === "gelir") {
      setGelirItems(gelirItems.filter((item) => item.id !== id));
    } else {
      setGiderItems(giderItems.filter((item) => item.id !== id));
    }
  };

  const calculateTotal = (items: LocalBudgetItem[]) => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const totalGelir = calculateTotal(gelirItems);
  const totalGider = calculateTotal(giderItems);
  const netBalance = totalGelir - totalGider;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    const allItems = [
      ...gelirItems.map(item => ({
        type: 'gelir' as const,
        category: item.category,
        item: item.item,
        amount: item.amount,
      })),
      ...giderItems.map(item => ({
        type: 'gider' as const,
        category: item.category,
        item: item.item,
        amount: item.amount,
      })),
    ];

    const result = await saveBudget({
      year: selectedYear,
      items: allItems,
    });

    setIsSaving(false);

    if (result.success) {
      toast.success('Bütçe planı başarıyla kaydedildi!');
      setSaveMessage({ type: 'success', text: 'Bütçe planı başarıyla kaydedildi!' });
      refetchBudget();
      refetchYears();
    } else {
      toast.error(result.error || 'Kaydetme sırasında bir hata oluştu.');
      setSaveMessage({ type: 'error', text: result.error || 'Kaydetme sırasında bir hata oluştu.' });
    }

    // Mesajı 3 saniye sonra kaldır
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleExport = () => {
    const budgetData = {
      year: selectedYear,
      gelirItems,
      giderItems,
      totalGelir,
      totalGider,
      netBalance,
      exportedAt: new Date().toLocaleString("tr-TR"),
    };

    const dataStr = JSON.stringify(budgetData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `butce-plani-${selectedYear}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleNewPlan = () => {
    if (gelirItems.length > 0 || giderItems.length > 0) {
      setShowNewPlanModal(true);
    } else {
      // Eğer mevcut plan boşsa direkt yeni plan başlat
      setGelirItems([]);
      setGiderItems([]);
      setSelectedCategory("");
      setSelectedItem("");
      setAmount("");
    }
  };

  const confirmNewPlan = async () => {
    // Sadece mevcut yılın bütçesini sil, yeni plan oluşturma
    const result = await deleteBudget(selectedYear);

    if (result.success) {
      setGelirItems([]);
      setGiderItems([]);
      setSelectedCategory("");
      setSelectedItem("");
      setAmount("");
      setShowNewPlanModal(false);
      refetchBudget();
      refetchYears();
    } else {
      toast.error(`Plan silinirken hata: ${result.error}`);
    }
  };

  const isLoading = budgetLoading || yearsLoading;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Yıllık Bütçe Planlama</h1>

          {/* Yıl Seçici */}
          <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border-none bg-transparent font-semibold text-lg focus:outline-none cursor-pointer"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {availableYears.includes(selectedYear) && (
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                Mevcut
              </span>
            )}
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex gap-3">
          <button
            onClick={handleNewPlan}
            disabled={deleteLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z"
                clipRule="evenodd"
              />
            </svg>
            Yeni Plan
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || saveLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {(isSaving || saveLoading) ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
              </svg>
            )}
            Kaydet
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Dışa Aktar
          </button>
        </div>
      </div>

      {/* Kaydetme Mesajı */}
      {saveMessage && (
        <div className={`mb-4 p-4 rounded-lg ${saveMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}

      {/* Mevcut Yıllar Gösterimi */}
      {availableYears.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">
            <strong>Kayıtlı Bütçe Yılları:</strong>{" "}
            {availableYears.map((year, index) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`mx-1 px-2 py-1 rounded ${selectedYear === year ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-800 hover:bg-blue-300'}`}
              >
                {year}
              </button>
            ))}
          </span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Bütçe verileri yükleniyor...</p>
        </div>
      )}

      {/* Form Section */}
      {!isLoading && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Kalem Ekle</h2>

            {/* Modern Gelir/Gider Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Kalem Türü</label>
              <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                <button
                  onClick={() => {
                    setSelectedType("gelir");
                    setSelectedCategory("");
                    setSelectedItem("");
                  }}
                  className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${selectedType === "gelir"
                    ? "bg-green-600 text-white shadow-md"
                    : "text-gray-600 hover:text-green-600"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Gelir
                  </div>
                </button>
                <button
                  onClick={() => {
                    setSelectedType("gider");
                    setSelectedCategory("");
                    setSelectedItem("");
                  }}
                  className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${selectedType === "gider"
                    ? "bg-red-600 text-white shadow-md"
                    : "text-gray-600 hover:text-red-600"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Gider
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Kategori Seçimi */}
              <div>
                <label className="block text-sm font-medium mb-2">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedItem("");
                  }}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Kategori Seçin</option>
                  {Object.keys(currentKalemler).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kalem Seçimi */}
              <div>
                <label className="block text-sm font-medium mb-2">Kalem</label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  disabled={!selectedCategory}
                >
                  <option value="">Kalem Seçin</option>
                  {availableItems.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tutar */}
              <div>
                <label className="block text-sm font-medium mb-2">Tutar (₺)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              {/* Ekle Butonu */}
              <div className="flex items-end">
                <button
                  onClick={handleAddItem}
                  className="w-full bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700 transition"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Gelir Tablosu */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">
              Gelir Kalemleri
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-50">
                    <th className="border border-gray-300 p-2 text-left">
                      Kategori
                    </th>
                    <th className="border border-gray-300 p-2 text-left">Kalem</th>
                    <th className="border border-gray-300 p-2 text-right">
                      Tutar (₺)
                    </th>
                    <th className="border border-gray-300 p-2 text-center w-24">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gelirItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="border border-gray-300 p-4 text-center text-gray-500"
                      >
                        Henüz gelir kalemi eklenmedi
                      </td>
                    </tr>
                  ) : (
                    gelirItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2">
                          {item.category}
                        </td>
                        <td className="border border-gray-300 p-2">{item.item}</td>
                        <td className="border border-gray-300 p-2 text-right">
                          {item.amount.toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <button
                            onClick={() => handleDeleteItem(item.id, "gelir")}
                            disabled={deleteItemLoading}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm disabled:opacity-50"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  {gelirItems.length > 0 && (
                    <tr className="bg-green-100 font-semibold">
                      <td
                        colSpan={2}
                        className="border border-gray-300 p-2 text-right"
                      >
                        TOPLAM GELİR:
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {totalGelir.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gider Tablosu */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-red-700">
              Gider Kalemleri
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-red-50">
                    <th className="border border-gray-300 p-2 text-left">
                      Kategori
                    </th>
                    <th className="border border-gray-300 p-2 text-left">Kalem</th>
                    <th className="border border-gray-300 p-2 text-right">
                      Tutar (₺)
                    </th>
                    <th className="border border-gray-300 p-2 text-center w-24">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {giderItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="border border-gray-300 p-4 text-center text-gray-500"
                      >
                        Henüz gider kalemi eklenmedi
                      </td>
                    </tr>
                  ) : (
                    giderItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2">
                          {item.category}
                        </td>
                        <td className="border border-gray-300 p-2">{item.item}</td>
                        <td className="border border-gray-300 p-2 text-right">
                          {item.amount.toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <button
                            onClick={() => handleDeleteItem(item.id, "gider")}
                            disabled={deleteItemLoading}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm disabled:opacity-50"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  {giderItems.length > 0 && (
                    <tr className="bg-red-100 font-semibold">
                      <td
                        colSpan={2}
                        className="border border-gray-300 p-2 text-right"
                      >
                        TOPLAM GİDER:
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {totalGider.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Bakiye */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Net Bakiye ({selectedYear})</h2>
              <div
                className={`text-3xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
              >
                {netBalance >= 0 ? "+" : ""}
                {netBalance.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ₺
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-gray-600">Toplam Gelir</div>
                <div className="text-xl font-semibold text-green-600">
                  {totalGelir.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  ₺
                </div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-gray-600">Toplam Gider</div>
                <div className="text-xl font-semibold text-red-600">
                  {totalGider.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  ₺
                </div>
              </div>
              <div
                className={`text-center p-3 rounded ${netBalance >= 0 ? "bg-blue-50" : "bg-orange-50"
                  }`}
              >
                <div className="text-gray-600">
                  {netBalance >= 0 ? "Fazla" : "Açık"}
                </div>
                <div
                  className={`text-xl font-semibold ${netBalance >= 0 ? "text-blue-600" : "text-orange-600"
                    }`}
                >
                  {Math.abs(netBalance).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  ₺
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Yeni Plan Onay Modalı */}
      <Modal
        isOpen={showNewPlanModal}
        onClose={() => setShowNewPlanModal(false)}
        title="Eski Planı Silmek İstiyor Musunuz?"
        size="md"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-gray-700">
            <strong>{selectedYear}</strong> yılına ait mevcut bütçe planı silinecek ve yeni bir plan oluşturulacaktır.
            Bu işlem geri alınamaz.
          </p>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={() => setShowNewPlanModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            İptal
          </button>
          <button
            onClick={confirmNewPlan}
            disabled={deleteLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {deleteLoading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            Evet, Sil ve Yeni Plan Oluştur
          </button>
        </div>
      </Modal>
    </div>
  );
}
