// lib/api/endpoint.tsx

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"; // Base API URL

export const API_ENDPOINTS = {
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

  // 🚀 YENİ EKLENEN KISIM 🚀
  donations: {
    // CREATE - Yeni kampanya oluştur (POST /donations)
    createCampaign: `${API_BASE_URL}/donations`,

    // READ - Tüm kampanyaları getir (GET /donations)
    getAllCampaigns: `${API_BASE_URL}/donations`,

    // READ - ID'ye göre kampanya getir (GET /donations/:id)
    getCampaignById: (id: string) => `${API_BASE_URL}/donations/${id}`,
    
    // BACKEND'DEKİ DİĞER METOTLARINIZI BURAYA EKLERSİNİZ
    // ...
  },
};