"use client";

import DonationCampaignForm from "../../../../components/donationCampaignForm";

export default function CreateDonationPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Yeni Kampanya Oluştur</h1>
      <p className="text-gray-600 mb-6">Bağış kampanyası bilgilerini doldurun</p>

      <DonationCampaignForm />
    </div>
  );
}
