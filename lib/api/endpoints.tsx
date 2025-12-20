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
    addNewGroup: `${API_BASE_URL}/groups/add-new-group`,

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

  // 🚀 SENİN EKLEDİĞİN DONATIONS KISMI
  donations: {
    // CREATE - Yeni kampanya oluştur (POST /donations)
    createCampaign: `${API_BASE_URL}/donations`,

    // READ - Tüm kampanyaları getir (GET /donations)
    getAllCampaigns: `${API_BASE_URL}/donations`,

    // READ - ID'ye göre kampanya getir (GET /donations/:id)
    getCampaignById: (id: string) => `${API_BASE_URL}/donations/${id}`,
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
};