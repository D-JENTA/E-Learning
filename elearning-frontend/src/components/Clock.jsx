import React, { useState, useEffect } from "react";

const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="9" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v5l3 2" />
  </svg>
);

export default function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="inline-flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-3">
      <div className="p-2 rounded-xl bg-slate-100 text-[#0d264f]">
        <IconClock />
      </div>
      <div className="leading-tight">
        <p className="text-2xl font-extrabold text-slate-900 tabular-nums tracking-tight">{time}</p>
        <p className="text-xs font-medium text-slate-500">{date}</p>
      </div>
    </div>
  );
}
