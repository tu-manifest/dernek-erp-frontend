// Auth Types

export interface AdminPermissions {
    canManageMembers: boolean;
    canManageDonations: boolean;
    canManageAdmins: boolean;
    canManageEvents: boolean;
    canManageMeetings: boolean;
    canManageSocialMedia: boolean;
    canManageFinance: boolean;
    canManageDocuments: boolean;
}

export interface Admin {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    notes: string;
    permissions: AdminPermissions;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    admin: Admin;
    token: string;
    expiresIn: string;
}

export interface MeResponse {
    success: boolean;
    message: string;
    admin: Admin;
}

export interface RegisterPayload {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    notes?: string;
    canManageMembers: boolean;
    canManageDonations: boolean;
    canManageAdmins: boolean;
    canManageEvents: boolean;
    canManageMeetings: boolean;
    canManageSocialMedia: boolean;
    canManageFinance: boolean;
    canManageDocuments: boolean;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    admin?: Admin;
}
