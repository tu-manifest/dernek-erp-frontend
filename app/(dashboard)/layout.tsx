"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Auth kontrolü
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      router.push("/login");
    }
  }, [pathname, router]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Toaster position="top-right" richColors />
        {children}
      </main>
    </div>
  );
}
