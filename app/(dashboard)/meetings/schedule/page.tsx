"use client";

import MeetingScheduleForm from "../../../../components/meetingScheduleForm";

export default function MeetingSchedulePage() {
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 ml-7">Yeni Toplantı Planla</h1>
            <p className="text-gray-600 mb-6 ml-7">Toplantı bilgilerini doldurun</p>

            <MeetingScheduleForm />
        </div>
    );
}
