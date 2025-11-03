//etkinlik listesi sayfası

"use client";

import EventTable from "../../../../components/eventTable";

export default function EventsPage() {
  const handleEdit = (etkinlik: any) => {
    console.log("Düzenle:", etkinlik);
    // örnek: router.push(`/events/edit/${etkinlik.id}`);
  };

  const handleDelete = (id: number) => {
    console.log("Sil:", id);
    // örnek: deleteEvent(id) çağrısı
  };

  return (
    <div className="p-6">
      <EventTable onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
