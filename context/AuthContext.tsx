"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Admin, AdminPermissions, AuthResponse, LoginPayload, MeResponse } from "@/lib/types/auth.types";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

interface AuthContextType {
    admin: Admin | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isDemo: boolean;
    login: (payload: LoginPayload) => Promise<AuthResponse>;
    demoLogin: () => void;
    logout: () => void;
    checkAuth: () => Promise<boolean>;
    hasPermission: (permission: keyof AdminPermissions) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo admin with all permissions
const DEMO_ADMIN: Admin = {
    id: -1,
    fullName: "Demo Kullanıcı",
    email: "admin@derp.com",
    phone: "0000000000",
    notes: "Bu bir demo hesabıdır.",
    permissions: {
        canManageMembers: true,
        canManageDonations: true,
        canManageAdmins: true,
        canManageEvents: true,
        canManageMeetings: true,
        canManageSocialMedia: true,
        canManageFinance: true,
        canManageDocuments: true,
    },
    isActive: true,
};

const DEMO_CREDENTIALS = {
    email: "admin@derp.com",
    password: "123456",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);

    // Check if user is authenticated
    const isAuthenticated = !!token && !!admin;

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        const storedAdmin = localStorage.getItem("admin");
        const storedIsDemo = localStorage.getItem("isDemo");

        if (storedToken) {
            setToken(storedToken);
            if (storedIsDemo === "true") {
                setIsDemo(true);
            }
            if (storedAdmin) {
                try {
                    setAdmin(JSON.parse(storedAdmin));
                } catch (e) {
                    console.error("Failed to parse stored admin:", e);
                }
            }
        }
        setIsLoading(false);
    }, []);

    // Login function
    const login = useCallback(async (payload: LoginPayload): Promise<AuthResponse> => {
        const response = await fetch(API_ENDPOINTS.auth.login, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data: AuthResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Giriş başarısız");
        }

        if (data.success && data.token) {
            // Save to state
            setToken(data.token);
            setAdmin(data.admin);

            // Persist to localStorage
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("admin", JSON.stringify(data.admin));
            localStorage.setItem("userEmail", data.admin.email);
        }

        return data;
    }, []);

    // Demo login function
    const demoLogin = useCallback(() => {
        const demoToken = "demo-token-" + Date.now();
        setToken(demoToken);
        setAdmin(DEMO_ADMIN);
        setIsDemo(true);
        localStorage.setItem("authToken", demoToken);
        localStorage.setItem("admin", JSON.stringify(DEMO_ADMIN));
        localStorage.setItem("userEmail", DEMO_ADMIN.email);
        localStorage.setItem("isDemo", "true");
    }, []);

    // Logout function
    const logout = useCallback(() => {
        setToken(null);
        setAdmin(null);
        setIsDemo(false);
        localStorage.removeItem("authToken");
        localStorage.removeItem("admin");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("isDemo");
    }, []);

    // Check auth with /me endpoint
    const checkAuth = useCallback(async (): Promise<boolean> => {
        const storedToken = localStorage.getItem("authToken");

        if (!storedToken) {
            setIsLoading(false);
            return false;
        }

        try {
            const response = await fetch(API_ENDPOINTS.auth.me, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${storedToken}`,
                },
            });

            if (!response.ok) {
                logout();
                return false;
            }

            const data: MeResponse = await response.json();

            if (data.success && data.admin) {
                setToken(storedToken);
                setAdmin(data.admin);
                localStorage.setItem("admin", JSON.stringify(data.admin));
                return true;
            } else {
                logout();
                return false;
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            logout();
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [logout]);

    // Check if user has specific permission
    const hasPermission = useCallback((permission: keyof AdminPermissions): boolean => {
        if (!admin || !admin.permissions) return false;
        return admin.permissions[permission] === true;
    }, [admin]);

    const value: AuthContextType = {
        admin,
        token,
        isLoading,
        isAuthenticated,
        isDemo,
        login,
        demoLogin,
        logout,
        checkAuth,
        hasPermission,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthContext;
