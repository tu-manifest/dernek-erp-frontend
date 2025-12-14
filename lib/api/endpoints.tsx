const API_BASE_URL = "http://localhost:8000/api"; // Base API URL
const AUTH_API_BASE_URL = "http://localhost:8000/api"; // Auth API URL

export const API_ENDPOINTS = {
  auth: {
    // POST - Login
    login: `${AUTH_API_BASE_URL}/auth/login`,

    // GET - Get current admin (requires Bearer token)
    me: `${AUTH_API_BASE_URL}/auth/me`,

    // POST - Register new admin
    register: `${AUTH_API_BASE_URL}/auth/register`,

    // GET - Get all admins (protected)
    getAllAdmins: `${AUTH_API_BASE_URL}/auth/admins`,

    // GET - Get admin by ID (protected)
    getAdmin: (id: number) => `${AUTH_API_BASE_URL}/auth/admins/${id}`,

    // PUT - Update admin (protected)
    updateAdmin: (id: number) => `${AUTH_API_BASE_URL}/auth/admins/${id}`,

    // DELETE - Delete admin (protected)
    deleteAdmin: (id: number) => `${AUTH_API_BASE_URL}/auth/admins/${id}`,
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
};