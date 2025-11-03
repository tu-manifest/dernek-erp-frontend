"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Token kontrolü yap
    const token = localStorage.getItem("authToken");
    
    if (token) {
      // Token varsa dashboard'a yönlendir
      router.push("/dashboard");
    } else {
      // Token yoksa login'e yönlendir
      router.push("/login");
    }
  }, [router]);

  // Yönlendirme sırasında loading göster
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 font-medium">Yükleniyor...</p>
      </div>
    </div>
  );
}