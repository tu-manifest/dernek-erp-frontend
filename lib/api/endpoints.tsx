// lib/api/endpoints.tsx

//Genel API için
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export const API_ENDPOINTS = {
  auth: {
    // POST - Login
    login: `${API_BASE_URL}/auth/login`,

    // GET - Get current admin (requires Bearer token)
    me: `${API_BASE_URL}/auth/me`,

    // POST - Register new admin
    register: `${API_BASE_URL}/auth/register`,

    // GET - Get all admins (protected)
    getAllAdmins: `${API_BASE_URL}/auth/admins`,

    // GET - Get admin by ID (protected)
    getAdmin: (id: number) => `${API_BASE_URL}/auth/admins/${id}`,

    // PUT - Update admin (protected)
    updateAdmin: (id: number) => `${API_BASE_URL}/auth/admins/${id}`,

    // DELETE - Delete admin (protected)
    deleteAdmin: (id: number) => `${API_BASE_URL}/auth/admins/${id}`,
  },

  groups: {
    // CREATE - Yeni grup oluştur
    addNewGroup: `${API_BASE_URL}/groups/`,

    // READ - Tüm grupları getir
    getAllGroups: `${API_BASE_URL}/groups`,

    // READ - ID'ye göre grup getir
    getGroupById: (id: string) => `${API_BASE_URL}/groups/${id}`,

    // UPDATE - Grup güncelle
    updateGroup: (id: string) => `${API_BASE_URL}/groups/${id}`,

    // DELETE - Grup sil
    deleteGroup: (id: string) => `${API_BASE_URL}/groups/${id}`,
  },

  members: {
    // CREATE - Yeni üye oluştur
    addNewMember: `${API_BASE_URL}/members/`,

    // READ - Tüm üyeleri getir
    getAllMembers: `${API_BASE_URL}/members`,

    // SEARCH - Üye arama
    searchMembers: `${API_BASE_URL}/members/search`,

    // READ - ID'ye göre üye getir
    getMemberById: (id: string) => `${API_BASE_URL}/members/${id}`,

    // UPDATE - Üye güncelle
    updateMember: (id: string) => `${API_BASE_URL}/members/${id}`,

    // DELETE - Üye kalıcı olarak sil
    deleteMember: (id: string) => `${API_BASE_URL}/members/${id}`,
  },

  // 🚀 KAMPANYA YÖNETİMİ (Campaigns)
  campaigns: {
    // CREATE - Yeni kampanya oluştur (POST /campaigns)
    createCampaign: `${API_BASE_URL}/campaigns`,

    // READ - Tüm kampanyaları getir (GET /campaigns)
    getAllCampaigns: `${API_BASE_URL}/campaigns`,

    // READ - ID'ye göre kampanya getir (GET /campaigns/:id)
    getCampaignById: (id: number) => `${API_BASE_URL}/campaigns/${id}`,

    // UPDATE - Kampanya güncelle (PUT /campaigns/:id)
    updateCampaign: (id: number) => `${API_BASE_URL}/campaigns/${id}`,

    // DELETE - Kampanya sil (DELETE /campaigns/:id)
    deleteCampaign: (id: number) => `${API_BASE_URL}/campaigns/${id}`,

    // READ - Kampanyaya ait bağışları getir (GET /campaigns/:id/donations)
    getCampaignDonations: (id: number) => `${API_BASE_URL}/campaigns/${id}/donations`,
  },

  // 📅 ETKİNLİK YÖNETİMİ
  events: {
    // CREATE - Yeni etkinlik oluştur (POST /events)
    createEvent: `${API_BASE_URL}/events`,

    // READ - Tüm etkinlikleri getir (GET /events)
    getAllEvents: `${API_BASE_URL}/events`,

    // READ - Filtreli liste (GET /events?status=Planlandı)
    getEventsByStatus: (status: string) => `${API_BASE_URL}/events?status=${status}`,

    // READ - ID'ye göre etkinlik getir (GET /events/:id)
    getEventById: (id: number) => `${API_BASE_URL}/events/${id}`,

    // UPDATE - Etkinlik güncelle (PUT /events/:id)
    updateEvent: (id: number) => `${API_BASE_URL}/events/${id}`,

    // DELETE - Etkinlik sil (DELETE /events/:id)
    deleteEvent: (id: number) => `${API_BASE_URL}/events/${id}`,

    // PATCH - Durum güncelle (PATCH /events/:id/status)
    updateEventStatus: (id: number) => `${API_BASE_URL}/events/${id}/status`,
  },

  // 💰 DIŞ BAĞIŞÇI YÖNETİMİ (Donors)
  donors: {
    // CREATE - Yeni bağışçı oluştur (POST /donors)
    createDonor: `${API_BASE_URL}/donors`,

    // READ - Tüm bağışçıları getir (GET /donors)
    getAllDonors: `${API_BASE_URL}/donors`,

    // READ - ID'ye göre bağışçı getir (GET /donors/:id)
    getDonorById: (id: number) => `${API_BASE_URL}/donors/${id}`,

    // UPDATE - Bağışçı güncelle (PUT /donors/:id)
    updateDonor: (id: number) => `${API_BASE_URL}/donors/${id}`,

    // DELETE - Bağışçı sil (DELETE /donors/:id)
    deleteDonor: (id: number) => `${API_BASE_URL}/donors/${id}`,

    // READ - Bağışçının bağışlarını getir (GET /donors/:id/donations)
    getDonorDonations: (id: number) => `${API_BASE_URL}/donors/${id}/donations`,
  },

  // 🏢 SABİT VARLIK YÖNETİMİ (Fixed Assets)
  fixedAssets: {
    // CREATE - Yeni sabit varlık oluştur (POST /fixed-assets)
    create: `${API_BASE_URL}/fixed-assets`,

    // READ - Tüm sabit varlıkları getir (GET /fixed-assets)
    getAll: `${API_BASE_URL}/fixed-assets`,

    // READ - ID'ye göre sabit varlık getir (GET /fixed-assets/:id)
    getById: (id: number) => `${API_BASE_URL}/fixed-assets/${id}`,

    // PUT - Sabit varlık güncelle (PUT /fixed-assets/:id)
    update: (id: number) => `${API_BASE_URL}/fixed-assets/${id}`,

    // PATCH - Sabit varlık durumu güncelle (PATCH /fixed-assets/:id/status)
    updateStatus: (id: number) => `${API_BASE_URL}/fixed-assets/${id}/status`,

    // POST - Sabit varlık resmi yükle (POST /fixed-assets/:id/image)
    uploadImage: (id: number) => `${API_BASE_URL}/fixed-assets/${id}/image`,

    // GET - Sabit varlık resmini getir (GET /fixed-assets/:id/image)
    getImage: (id: number) => `${API_BASE_URL}/fixed-assets/${id}/image`,
  },

  // 📄 DÖKÜMAN YÖNETİMİ (Documents)
  documents: {
    // POST - Döküman yükle (FormData: file, name, category, description)
    upload: `${API_BASE_URL}/documents`,

    // GET - Tüm dökümanları getir
    getAll: `${API_BASE_URL}/documents`,

    // GET - ID'ye göre döküman getir
    getById: (id: number) => `${API_BASE_URL}/documents/${id}`,

    // DELETE - Döküman sil
    delete: (id: number) => `${API_BASE_URL}/documents/${id}`,

    // GET - Döküman indir
    download: (id: number) => `${API_BASE_URL}/documents/${id}/download`,

    // GET - Döküman görüntüle (yeni sekmede)
    view: (id: number) => `${API_BASE_URL}/documents/${id}/view`,
  },

  // 💰 FİNANS YÖNETİMİ (Debt & Collection)
  finance: {
    // Borç (Debt) İşlemleri
    // POST - Yeni borç oluştur
    createDebt: `${API_BASE_URL}/finance/debt`,

    // GET - Tüm borçları getir
    getAllDebts: `${API_BASE_URL}/finance/debt`,

    // GET - ID'ye göre borç detayı getir
    getDebtById: (id: number) => `${API_BASE_URL}/finance/debt/${id}`,

    // PUT - Borç güncelle
    updateDebt: (id: number) => `${API_BASE_URL}/finance/debt/${id}`,

    // DELETE - Borç sil
    deleteDebt: (id: number) => `${API_BASE_URL}/finance/debt/${id}`,

    // GET - Borçlu listesi (özet)
    getDebtors: `${API_BASE_URL}/finance/debtors`,

    // GET - Borçlu özeti (üye veya dış bağışçı)
    getDebtorSummary: (type: 'MEMBER' | 'EXTERNAL', id: number) =>
      `${API_BASE_URL}/finance/debtor/${type}/${id}/summary`,

    // Tahsilat (Collection) İşlemleri
    // POST - Tekil tahsilat kaydı
    createCollection: `${API_BASE_URL}/finance/collection`,

    // POST - Toplu tahsilat kaydı
    createBulkCollection: `${API_BASE_URL}/finance/collection/bulk`,
  },

  // 📊 AKTİVİTE LOG YÖNETİMİ (Activity Logs)
  activityLogs: {
    // GET - Son aktivite logları (limit parametreli)
    getRecent: (limit: number = 10) => `${API_BASE_URL}/activity-logs/recent?limit=${limit}`,

    // GET - Tüm logları getir (filtreleme destekli)
    // Query params: ?page=1&limit=50&entityType=Event&action=CREATE&startDate=2025-01-01&endDate=2025-12-31
    getAll: `${API_BASE_URL}/activity-logs`,

    // GET - Entity bazlı logları getir
    getByEntity: (entityType: string, entityId: number) =>
      `${API_BASE_URL}/activity-logs/entity/${entityType}/${entityId}`,

    // GET - İstatistik verileri
    getStats: `${API_BASE_URL}/activity-logs/stats`,
  },
};