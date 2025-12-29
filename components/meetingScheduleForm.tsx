"use client";

import { useState } from "react";
import { Save, Calendar, Clock, MapPin, Globe, Info, Loader2, AlertCircle, X, Users, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createMeeting, CreateMeetingPayload, MeetingType } from "../lib/api/meetingService";
import { toast } from "sonner";

export default function MeetingScheduleForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        meetingType: "Yönetim Kurulu" as MeetingType,
        date: "",
        startTime: "",
        endTime: "",
        meetingFormat: "Fiziksel" as "Fiziksel" | "Çevrimiçi",
        location: "",
        platform: "",
        meetingLink: "",
        agenda: "",
        participantCount: ""
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Hata mesajını temizle
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) newErrors.title = "Toplantı başlığı gereklidir";
        if (!formData.date) newErrors.date = "Tarih gereklidir";
        if (!formData.startTime) newErrors.startTime = "Başlangıç saati gereklidir";
        if (!formData.endTime) newErrors.endTime = "Bitiş saati gereklidir";

        // Bitiş saati başlangıçtan sonra olmalı
        if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
            newErrors.endTime = "Bitiş saati başlangıç saatinden sonra olmalıdır";
        }

        if (formData.meetingFormat === "Fiziksel" && !formData.location.trim()) {
            newErrors.location = "Fiziksel toplantılar için konum gereklidir";
        }

        if (formData.meetingFormat === "Çevrimiçi") {
            if (!formData.platform) newErrors.platform = "Platform seçimi gereklidir";
            if (!formData.meetingLink.trim()) newErrors.meetingLink = "Toplantı linki gereklidir";
        }

        if (!formData.agenda.trim()) newErrors.agenda = "Gündem gereklidir";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(null);

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Form verilerini API formatına dönüştür
            const payload: CreateMeetingPayload = {
                title: formData.title,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                meetingType: formData.meetingType,
                meetingFormat: formData.meetingFormat,
                agenda: formData.agenda,
                participantCount: formData.participantCount ? parseInt(formData.participantCount) : undefined,
            };

            // Konum tipine göre bilgileri ekle
            if (formData.meetingFormat === "Fiziksel") {
                payload.location = formData.location;
            } else {
                payload.platform = formData.platform;
                payload.meetingLink = formData.meetingLink;
            }

            await createMeeting(payload);

            // Başarılı mesajı göster ve listeye yönlendir
            toast.success("Toplantı başarıyla planlandı!");
            router.push("/meetings/list");
        } catch (error: any) {
            console.error("Toplantı planlanırken hata:", error);
            toast.error(error.message || "Toplantı planlanırken bir hata oluştu.");
            setApiError(error.message || "Toplantı planlanırken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const meetingTypes: MeetingType[] = ["Yönetim Kurulu", "Genel Kurul", "Komisyon", "Diğer"];

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                {/* API Error Alert */}
                {apiError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <h4 className="text-red-800 font-medium">Hata</h4>
                            <p className="text-red-600 text-sm mt-1">{apiError}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setApiError(null)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Temel Bilgiler */}
                <div className="border-b pb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Info size={20} />
                        Temel Bilgiler
                    </h2>

                    <div className="space-y-4">
                        {/* Toplantı Başlığı */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Toplantı Başlığı <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? "border-red-500" : "border-gray-300"
                                    } ${isSubmitting ? "bg-gray-100" : ""}`}
                                placeholder="Örn: Yönetim Kurulu Olağan Toplantısı"
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        {/* Toplantı Türü */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FileText size={16} className="inline mr-1" />
                                Toplantı Türü <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="meetingType"
                                value={formData.meetingType}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isSubmitting ? "bg-gray-100" : ""}`}
                            >
                                {meetingTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tarih ve Saatler */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar size={16} className="inline mr-1" />
                                    Tarih <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.date ? "border-red-500" : "border-gray-300"
                                        } ${isSubmitting ? "bg-gray-100" : ""}`}
                                />
                                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Clock size={16} className="inline mr-1" />
                                    Başlangıç <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.startTime ? "border-red-500" : "border-gray-300"
                                        } ${isSubmitting ? "bg-gray-100" : ""}`}
                                />
                                {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Clock size={16} className="inline mr-1" />
                                    Bitiş <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.endTime ? "border-red-500" : "border-gray-300"
                                        } ${isSubmitting ? "bg-gray-100" : ""}`}
                                />
                                {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
                            </div>
                        </div>

                        {/* Katılımcı Sayısı */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Users size={16} className="inline mr-1" />
                                Katılımcı Sayısı (İsteğe Bağlı)
                            </label>
                            <input
                                type="number"
                                name="participantCount"
                                value={formData.participantCount}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isSubmitting ? "bg-gray-100" : ""}`}
                                placeholder="Tahmini katılımcı sayısı"
                                min="1"
                            />
                        </div>
                    </div>
                </div>

                {/* Konum Bilgileri */}
                <div className="border-b pb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin size={20} />
                        Konum Bilgileri
                    </h2>

                    <div className="space-y-4">
                        {/* Konum Tipi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Toplantı Şekli <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="meetingFormat"
                                        value="Fiziksel"
                                        checked={formData.meetingFormat === "Fiziksel"}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-gray-700">Fiziksel (Yüz yüze)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="meetingFormat"
                                        value="Çevrimiçi"
                                        checked={formData.meetingFormat === "Çevrimiçi"}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-gray-700">Çevrimiçi (Online)</span>
                                </label>
                            </div>
                        </div>

                        {/* Fiziksel - Konum Bilgisi */}
                        {formData.meetingFormat === "Fiziksel" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Toplantı Yeri <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.location ? "border-red-500" : "border-gray-300"
                                        } ${isSubmitting ? "bg-gray-100" : ""}`}
                                    placeholder="Örn: Dernek Merkezi Toplantı Salonu"
                                />
                                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                            </div>
                        )}

                        {/* Online - Platform ve Link */}
                        {formData.meetingFormat === "Çevrimiçi" && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Globe size={16} className="inline mr-1" />
                                        Platform <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="platform"
                                        value={formData.platform}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.platform ? "border-red-500" : "border-gray-300"
                                            } ${isSubmitting ? "bg-gray-100" : ""}`}
                                    >
                                        <option value="">Platform Seçiniz</option>
                                        <option value="Google Meet">Google Meet</option>
                                        <option value="Zoom">Zoom</option>
                                        <option value="Microsoft Teams">Microsoft Teams</option>
                                        <option value="Discord">Discord</option>
                                        <option value="Diğer">Diğer</option>
                                    </select>
                                    {errors.platform && <p className="text-red-500 text-sm mt-1">{errors.platform}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Toplantı Linki <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="meetingLink"
                                        value={formData.meetingLink}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.meetingLink ? "border-red-500" : "border-gray-300"
                                            } ${isSubmitting ? "bg-gray-100" : ""}`}
                                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                    />
                                    {errors.meetingLink && <p className="text-red-500 text-sm mt-1">{errors.meetingLink}</p>}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Gündem */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText size={16} className="inline mr-1" />
                        Toplantı Gündemi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="agenda"
                        value={formData.agenda}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        rows={5}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.agenda ? "border-red-500" : "border-gray-300"
                            } ${isSubmitting ? "bg-gray-100" : ""}`}
                        placeholder="1. Açılış ve yoklama&#10;2. Geçen toplantı kararlarının değerlendirilmesi&#10;3. Gündem maddeleri...&#10;4. Dilek ve temenniler&#10;5. Kapanış"
                    />
                    {errors.agenda && <p className="text-red-500 text-sm mt-1">{errors.agenda}</p>}
                </div>

                {/* Butonlar */}
                <div className="flex justify-center gap-4 pt-8">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Toplantıyı Planla
                            </>
                        )}
                    </button>
                    <Link
                        href="/meetings/list"
                        className={`flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
                    >
                        İptal
                    </Link>
                </div>
            </form>
        </div>
    );
}
