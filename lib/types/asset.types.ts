// Sabit Varlık Yönetimi - Types

// VUK Ana Sınıflar
export type AssetMainClass =
    | "binalar"      // 252
    | "tesis"        // 253
    | "tasitlar"     // 254
    | "demirbaslar"  // 255
    | "ozel"         // 264
    | "maddi_olmayan"; // 260/267

// Varlık Durumları
export type AssetStatus = "active" | "broken" | "scrapped" | "sold";

// VUK Varlık Alt Sınıfları
export interface AssetSubClass {
    id: string;
    mainClass: AssetMainClass;
    name: string;
    usefulLife: number;
    depreciationRate: number;
    description: string;
    hasSerialNo?: boolean;
    hasPlate?: boolean;
}

// VUK Uyumlu Amortisman Kuralları
export const VUK_ASSET_CLASSES: AssetSubClass[] = [
    // Binalar (252)
    { id: "bina_beton", mainClass: "binalar", name: "Beton, Çelik Konstrüksiyon Binalar", usefulLife: 50, depreciationRate: 2.00, description: "Dernek merkezi, sosyal tesis binaları" },
    { id: "bina_kagir", mainClass: "binalar", name: "Yarı Kâgir ve Ahşap Binalar", usefulLife: 40, depreciationRate: 2.50, description: "Eski yapılar, tadilata müsait binalar" },
    { id: "bina_prefabrik", mainClass: "binalar", name: "Diğer Binalar (Prefabrik vb.)", usefulLife: 20, depreciationRate: 5.00, description: "Geçici yapılar, depo, eklenti" },

    // Tesis, Makine ve Cihazlar (253)
    { id: "tesis_jenerator", mainClass: "tesis", name: "Jeneratör, Kompresör, Pompalar", usefulLife: 10, depreciationRate: 10.00, description: "Elektrik kesintilerine karşı yedek güç üniteleri" },
    { id: "tesis_guvenlik", mainClass: "tesis", name: "Güvenlik, Alarm ve Yangın Sistemleri", usefulLife: 5, depreciationRate: 20.00, description: "Kamera, kartlı geçiş, duman dedektörleri" },
    { id: "tesis_klima", mainClass: "tesis", name: "Klima ve Havalandırma Sistemleri", usefulLife: 8, depreciationRate: 12.50, description: "Merkez ve şube ofislerinin iklimlendirilmesi" },

    // Taşıtlar (254)
    { id: "tasit_binek", mainClass: "tasitlar", name: "Binek Otomobiller", usefulLife: 5, depreciationRate: 20.00, description: "Yönetim, saha/proje ekipleri için", hasPlate: true },
    { id: "tasit_minibus", mainClass: "tasitlar", name: "Minibüsler, Otobüsler", usefulLife: 7, depreciationRate: 14.28, description: "Üye taşıma, gezi, sosyal faaliyetler", hasPlate: true },

    // Demirbaşlar (255)
    { id: "demirbas_mobilya", mainClass: "demirbaslar", name: "Mobilya ve Dekorasyon Malzemeleri", usefulLife: 5, depreciationRate: 20.00, description: "Masa, sandalye, koltuk takımı, dolaplar" },
    { id: "demirbas_bilgisayar", mainClass: "demirbaslar", name: "Bilgisayar, Yazıcı, Sunucu (IT Donanımı)", usefulLife: 4, depreciationRate: 25.00, description: "Ofis ekipmanları, eğitim salonu donanımları", hasSerialNo: true },
    { id: "demirbas_ses_goruntu", mainClass: "demirbaslar", name: "Ses, Görüntü, Kamera Donanımları", usefulLife: 5, depreciationRate: 20.00, description: "Toplantı salonu, etkinlik ekipmanları", hasSerialNo: true },
    { id: "demirbas_kitaplik", mainClass: "demirbaslar", name: "Kitaplıklar, Arşivleme Sistemleri", usefulLife: 10, depreciationRate: 10.00, description: "Kütüphane kuran dernekler için" },
    { id: "demirbas_egitim", mainClass: "demirbaslar", name: "Eğitim Materyalleri ve Simülatörler", usefulLife: 5, depreciationRate: 20.00, description: "Mesleki veya sosyal eğitim veren dernekler için" },

    // Özel Maliyetler (264)
    { id: "ozel_tadilat", mainClass: "ozel", name: "Kiralanan Yerdeki Tadilat Giderleri", usefulLife: 5, depreciationRate: 20.00, description: "Kiralanan dernek merkezine yapılan faydalı harcamalar" },

    // Maddi Olmayan Duran Varlıklar (260/267)
    { id: "maddi_olmayan_lisans", mainClass: "maddi_olmayan", name: "Lisans, Telif Hakkı (Yazılım vb.)", usefulLife: 5, depreciationRate: 20.00, description: "Muhasebe programı, ofis yazılımları, yönetim sistemi lisansları" },
    { id: "maddi_olmayan_web", mainClass: "maddi_olmayan", name: "Web Sitesi Kurulum ve Tasarım Giderleri", usefulLife: 5, depreciationRate: 20.00, description: "Derneğin tanıtımı ve faaliyetleri için kurulan web sitesi" },
];

// Ana Sınıf Görüntüleme İsimleri
export const MAIN_CLASS_NAMES: Record<AssetMainClass, string> = {
    binalar: "Binalar (252)",
    tesis: "Tesis, Makine ve Cihazlar (253)",
    tasitlar: "Taşıtlar (254)",
    demirbaslar: "Demirbaşlar (255)",
    ozel: "Özel Maliyetler (264)",
    maddi_olmayan: "Maddi Olmayan Duran Varlıklar (260/267)",
};

// Lokasyonlar
export const LOCATIONS = [
    "Genel Merkez",
    "Muhasebe Ofisi",
    "Etkinlik Salonu",
    "Toplantı Odası",
    "Depo",
    "Şube - 1",
    "Şube - 2",
    "Dış Saha",
];

// Para Birimleri
export const CURRENCIES = [
    { code: "TRY", name: "Türk Lirası (₺)" },
    { code: "USD", name: "Amerikan Doları ($)" },
    { code: "EUR", name: "Euro (€)" },
];

// Durum Etiketleri
export const STATUS_LABELS: Record<AssetStatus, { label: string; color: string }> = {
    active: { label: "Kullanımda", color: "green" },
    broken: { label: "Arızalı", color: "yellow" },
    scrapped: { label: "Hurdaya Ayrıldı", color: "red" },
    sold: { label: "Satıldı", color: "gray" },
};

// Sabit Varlık Interface
export interface Asset {
    id: string;

    // Tanımlayıcı Bilgiler
    code: string;              // Sicil No
    name: string;              // Varlık Adı
    subClassId: string;        // Alt Sınıf ID
    serialOrPlate?: string;    // Seri No veya Plaka
    brandModel?: string;       // Marka / Model

    // Finansal Bilgiler
    costValue: number;         // Maliyet Bedeli
    currency: string;          // Para Birimi
    acquisitionDate: string;   // Edinme Tarihi
    invoiceNo?: string;        // Fatura Numarası
    supplier?: string;         // Satıcı / Tedarikçi

    // Amortisman Bilgileri
    usefulLife: number;        // Faydalı Ömür (Yıl)
    depreciationRate: number;  // Amortisman Oranı (%)
    depreciationMethod: string;// Amortisman Yöntemi
    salvageValue?: number;     // Hurda Değeri / Kalıntı Değeri
    depreciationStartDate: string; // Amortisman Başlangıç Tarihi

    // Operasyonel Bilgiler
    location: string;          // Bulunduğu Lokasyon
    responsiblePerson?: string;// Sorumlu Kişi
    status: AssetStatus;       // Durumu
    warrantyEndDate?: string;  // Garanti Bitiş Tarihi

    // Ek Bilgiler
    revaluationApplied?: boolean; // Yeniden Değerleme Yapıldı mı
    notes?: string;            // Açıklama / Notlar
    documents?: string[];      // Belge Ekleri

    // Hesaplanan Değerler
    accumulatedDepreciation: number; // Birikmiş Amortisman
    netBookValue: number;      // Net Defter Değeri

    // Meta
    createdAt?: string;
    updatedAt?: string;
}

// Form için payload
export interface CreateAssetPayload {
    code: string;
    name: string;
    subClassId: string;
    serialOrPlate?: string;
    brandModel?: string;
    costValue: number;
    currency: string;
    acquisitionDate: string;
    invoiceNo?: string;
    supplier?: string;
    salvageValue?: number;
    depreciationStartDate: string;
    location: string;
    responsiblePerson?: string;
    warrantyEndDate?: string;
    revaluationApplied?: boolean;
    notes?: string;
}

// API Response Types
export interface AssetListResponse {
    success: boolean;
    message: string;
    assets: Asset[];
}

export interface AssetResponse {
    success: boolean;
    message: string;
    asset: Asset;
}
