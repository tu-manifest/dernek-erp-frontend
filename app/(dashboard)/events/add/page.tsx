//etkinlik oluşturma sayfası

"use client";

import YeniEtkinlikForm from "../../../../components/eventAdd";

export default function YeniEtkinlikPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Yeni Etkinlik Oluştur</h1>
      <p className="text-gray-600 mb-6">Etkinlik bilgilerini doldurun</p>

      <YeniEtkinlikForm />
    </div>
  );
}
