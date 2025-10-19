// components/TahsilatListesi.tsx
"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, Download, Filter, Eye, CreditCard, Banknote } from "lucide-react";
import Link from "next/link";

interface Tahsilat {
  id: string;
  borcluAd: string;
  borcTuru: string;
  tahsilatMiktari: number;
  tahsilatTarihi: string;
  tahsilatSekli: "Kasa" | "Banka" | "Kredi Kartı" | "Diğer";
  dekontoNo?: string;
  kalanBorc: number;
  aciklama: string;
}

const initialTahsilatlar: Tahsilat[] = [
  {
    id: "t1",
    borcluAd: "Ahmet Yılmaz",
    borcTuru: "Etkinlik katılım ücreti",
    tahsilatMiktari: 2000,
    tahsilatTarihi: "2025-10-15",
    tahsilatSekli: "Banka",
    dekontoNo: "DK123456",
    kalanBorc: 3000,
    aciklama: "İlk taksit"
  },
  {
    id: "t2",
    borcluAd: "Fatma Demir",
    borcTuru: "Materyal alım ücreti",
    tahsilatMiktari: 1500,
    tahsilatTarihi: "2025-10-12",
    tahsilatSekli: "Kasa",
    kalanBorc: 1000,
    aciklama: "Nakit ödeme"
  },
  {
    id: "t3",
    borcluAd: "ABC Ltd. Şti.",
    borcTuru: "Kiralama/tesis kullanım ücreti",
    tahsilatMiktari: 10000,
    tahsilatTarihi: "2025-10-10",
    tahsilatSekli: "Banka",
    dekontoNo: "DK789012",
    kalanBorc: 0,
    aciklama: "Tam ödeme"
  },
  {
    id: "t4",
    borcluAd: "Mehmet Kaya",
    borcTuru: "Bağış Sözü",
    tahsilatMiktari: 5000,
    tahsilatTarihi: "2025-10-08",
    tahsilatSekli: "Kredi Kartı",
    kalanBorc: 10000,
    aciklama: "Kart ödeme"
  }
];

export default function TahsilatListesi() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSekil, setFilterSekil] = useState<Tahsilat['tahsilatSekli'] | "Tümü">("Tümü");
  const [sortField, setSortField] = useState<"tahsilatTarihi" | "tahsilatMiktari">("tahsilatTarihi");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [tahsilatlar] = useState<Tahsilat[]>(initialTahsilatlar); // Statik örnek veri

  const filteredTahsilatlar = tahsilatlar
    .filter(t => {
      const matchesSearch =
        t.borcluAd.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.borcTuru.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.dekontoNo && t.dekontoNo.includes(searchTerm));

      const matchesFilter = filterSekil === "Tümü" || t.tahsilatSekli === filterSekil;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Tarih ve Miktar karşılaştırması
      if (sortField === "tahsilatTarihi") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (field: "tahsilatTarihi" | "tahsilatMiktari") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc"); // Yeni alana geçince varsayılan olarak azalan sıralama (en yeniler/en büyükler üstte)
    }
  };

  const getTahsilatSekilRengi = (sekil: Tahsilat['tahsilatSekli']) => {
    switch (sekil) {
      case "Kasa":
        return "bg-green-100 text-green-800 border-green-200";
      case "Banka":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Kredi Kartı":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Diğer":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const getTahsilatSekilIcon = (sekil: Tahsilat['tahsilatSekli']) => {
    switch (sekil) {
      case "Kasa":
        return <Banknote size={12} />;
      case "Kredi Kartı":
        return <CreditCard size={12} />;
      default:
        return null;
    }
  };

  const getTotalStats = () => {
    const toplamTahsilat = tahsilatlar.reduce((sum, t) => sum + t.tahsilatMiktari, 0);
    const kasaTahsilat = tahsilatlar
      .filter(t => t.tahsilatSekli === "Kasa")
      .reduce((sum, t) => sum + t.tahsilatMiktari, 0);
    const bankaTahsilat = tahsilatlar
      .filter(t => t.tahsilatSekli === "Banka")
      .reduce((sum, t) => sum + t.tahsilatMiktari, 0);

    return { toplamTahsilat, kasaTahsilat, bankaTahsilat };
  };

  const stats = getTotalStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";
  };
  
  const handleExport = () => {
    // Dışa aktarma mantığı buraya eklenecek (Örn: CSV/Excel oluşturma)
    console.log("Dışa aktarma başlatıldı...");
    alert("Tahsilat listesi dışa aktarılıyor...");
  };
  
  const tahsilatSekilleri: Tahsilat['tahsilatSekli'][] = ["Kasa", "Banka", "Kredi Kartı", "Diğer"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">💰 Finans Yönetimi</h1>
      
      {/* İstatistikler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
          <p className="text-sm text-gray-600 mb-2 font-medium">Toplam Tahsilat</p>
          <p className="text-3xl font-extrabold text-green-700">{formatCurrency(stats.toplamTahsilat)}</p>
          <p className="text-xs text-gray-500 mt-2">{tahsilatlar.length} başarılı işlem</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
          <p className="text-sm text-gray-600 mb-2 font-medium">Kasa Tahsilat</p>
          <p className="text-3xl font-extrabold text-green-600">{formatCurrency(stats.kasaTahsilat)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
          <p className="text-sm text-gray-600 mb-2 font-medium">Banka Tahsilat</p>
          <p className="text-3xl font-extrabold text-blue-600">{formatCurrency(stats.bankaTahsilat)}</p>
        </div>
      </div>

      {/* Tahsilat Tablosu */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        
        {/* Header/Kontrol Paneli */}
        <div className="bg-blue-700/90 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Tahsilat Kayıtları</h2>
              <p className="text-green-100/80 text-sm">Gösterilen: <span className="font-semibold">{filteredTahsilatlar.length}</span> / Toplam: <span className="font-semibold">{tahsilatlar.length}</span></p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Arama */}
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Borçlu, türü, dekont ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-full lg:w-60 transition"
                />
              </div>

              {/* Filtre */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                <select
                  value={filterSekil}
                  onChange={(e) => setFilterSekil(e.target.value as Tahsilat['tahsilatSekli'] | "Tümü")}
                  className="appearance-none pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 cursor-pointer transition"
                >
                  <option value="Tümü">Tüm Şekiller</option>
                  {tahsilatSekilleri.map(sekil => (
                    <option key={sekil} value={sekil}>{sekil}</option>
                  ))}
                </select>
              </div>

              {/* Yeni Tahsilat */}
              <Link
                href="/tahsilat/kaydet"
                className="bg-white text-blue-700 px-4 py-2.5 rounded-lg hover:bg-green-50 transition-colors flex items-center space-x-2 font-semibold shadow-md whitespace-nowrap"
              >
                <Plus size={18} />
                <span>Yeni Kayıt</span>
              </Link>

              {/* Dışa Aktar */}
              <button
                onClick={handleExport}
                className="bg-white/90 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-white transition-colors flex items-center space-x-2 font-medium shadow-sm whitespace-nowrap"
              >
                <Download size={18} />
                <span>Aktar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tablo İçeriği */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Borçlu Adı */}
                <th className="w-1/5 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Borçlu Adı
                </th>
                {/* Borç Türü */}
                <th className="w-1/6 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Borç Türü
                </th>
                {/* Tahsilat Miktarı */}
                <th
                  className="w-1/6 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort("tahsilatMiktari")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Miktar</span>
                    <span className={`text-sm ${sortField === "tahsilatMiktari" ? "text-green-600" : "text-gray-400 group-hover:text-green-400"}`}>
                      {sortField === "tahsilatMiktari" ? (sortDirection === "asc" ? "↑" : "↓") : "⇅"}
                    </span>
                  </div>
                </th>
                {/* Tarih */}
                <th
                  className="w-1/6 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort("tahsilatTarihi")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Tarih</span>
                    <span className={`text-sm ${sortField === "tahsilatTarihi" ? "text-green-600" : "text-gray-400 group-hover:text-green-400"}`}>
                      {sortField === "tahsilatTarihi" ? (sortDirection === "asc" ? "↑" : "↓") : "⇅"}
                    </span>
                  </div>
                </th>
                {/* Tahsilat Şekli */}
                <th className="w-1/8 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Şekil
                </th>
                {/* Kalan Borç */}
                <th className="w-1/8 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Kalan Borç
                </th>
                {/* İşlemler */}
                <th className="w-1/12 px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {filteredTahsilatlar.map(tahsilat => (
                <tr key={tahsilat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {tahsilat.borcluAd}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {tahsilat.borcTuru}
                  </td>
                  <td className="px-4 py-3 font-bold text-lg text-green-700">
                    {formatCurrency(tahsilat.tahsilatMiktari)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(tahsilat.tahsilatTarihi)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getTahsilatSekilRengi(tahsilat.tahsilatSekli)}`}>
                      {getTahsilatSekilIcon(tahsilat.tahsilatSekli)}
                      {tahsilat.tahsilatSekli}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium text-sm ${tahsilat.kalanBorc === 0 ? "text-green-700" : "text-orange-700"}`}>
                      {formatCurrency(tahsilat.kalanBorc)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Detaylar"
                      >
                        <Eye size={18} />
                      </button>
                      <Link
                        href={`/tahsilat/duzenle/${tahsilat.id}`}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        title="Düzenle"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Boş Durum */}
        {filteredTahsilatlar.length === 0 && (
          <div className="text-center py-16">
            <Filter className="mx-auto h-14 w-14 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Tahsilat Bulunamadı</h3>
            <p className="text-gray-500 mb-6">Arama veya filtreleme kriterlerinizi değiştirin.</p>
            <Link
              href="/tahsilat/kaydet"
              className="inline-flex items-center bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
            >
              <Plus size={18} className="mr-2" />
              Yeni Tahsilat Oluştur
            </Link>
          </div>
        )}

        {/* Footer/Sayfalama */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{filteredTahsilatlar.length}</span> tahsilat gösteriliyor.
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">Sayfa başına:</span>
              <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-green-500 focus:border-green-500">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}