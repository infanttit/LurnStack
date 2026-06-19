import React from "react";
import { FiAward, FiXCircle, FiDollarSign } from "react-icons/fi";

function StatCard({ label, value, tone, icon: Icon }) {
  const tones = {
    green: "bg-gradient-to-br from-emerald-50 to-white text-emerald-800 border-emerald-100/70 shadow-sm hover:shadow-md hover:shadow-emerald-50/50 hover:border-emerald-200 transition-all duration-300",
    amber: "bg-gradient-to-br from-amber-50 to-white text-amber-800 border-amber-100/70 shadow-sm hover:shadow-md hover:shadow-amber-50/50 hover:border-amber-200 transition-all duration-300",
    gray: "bg-gradient-to-br from-slate-50 to-white text-slate-700 border-slate-100/70 shadow-sm hover:shadow-md hover:shadow-slate-50/50 hover:border-slate-200 transition-all duration-300",
  };

  return (
    <div className={["rounded-3xl border p-6 flex flex-col justify-between h-28 group", tones[tone] || tones.gray].join(" ")}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-75">
          {label}
        </span>
        <div className="p-2 rounded-xl bg-white/70 shadow-sm group-hover:scale-110 transition-transform duration-300">
          <Icon className="text-base" />
        </div>
      </div>
      <div className="mt-auto text-[28px] font-black tracking-tight">{value}</div>
    </div>
  );
}

export default function CertificationStats({ courses, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-3xl bg-slate-50" />
        ))}
      </div>
    );
  }

  const getStatus = (c) => typeof c.eligibility === "string" ? c.eligibility : (c.eligibility?.status || "NONE");

  const freeCount = courses.filter((c) => getStatus(c) === "FREE").length;
  const paidCount = courses.filter((c) => getStatus(c) === "PAID").length;
  const noneCount = courses.filter((c) => {
    const status = getStatus(c);
    return status === "NONE" || status === "NOT_ELIGIBLE" || status === "INELIGIBLE";
  }).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <StatCard label="Free eligible" value={freeCount} tone="green" icon={FiAward} />
      <StatCard label="Paid eligible" value={paidCount} tone="amber" icon={FiDollarSign} />
      <StatCard label="Not eligible" value={noneCount} tone="gray" icon={FiXCircle} />
    </div>
  );
}
