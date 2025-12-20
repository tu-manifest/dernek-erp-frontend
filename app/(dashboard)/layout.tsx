"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      const isDemo = localStorage.getItem("isDemo");

      if (!token) {
        router.push("/login");
        return;
      }

      // Skip API check for demo mode
      if (isDemo === "true") {
        setIsChecking(false);
        return;
      }

      try {
        // Verify token with /me endpoint
        const response = await fetch(API_ENDPOINTS.auth.me, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Token is invalid, clear storage and redirect
          localStorage.removeItem("authToken");
          localStorage.removeItem("admin");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("isDemo");
          router.push("/login");
          return;
        }

        const data = await response.json();
        if (data.success && data.admin) {
          // Update admin info in localStorage
          localStorage.setItem("admin", JSON.stringify(data.admin));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // On error, allow user to continue (token might still be valid)
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Toaster position="top-right" richColors />
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
