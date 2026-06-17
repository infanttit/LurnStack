import React from "react";
import { FiAward, FiXCircle, FiDollarSign } from "react-icons/fi";

function StatCard({ label, value, tone, icon: Icon }) {
  const tones = {
    green: "bg-emerald-50 text-[#3B6D11] border-emerald-100",
    amber: "bg-amber-50 text-[#854F0B] border-amber-100",
    gray: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <div className={["rounded-2xl border p-4", tones[tone] || tones.gray].join(" ")}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-extrabold uppercase tracking-widest opacity-75">
          {label}
        </span>
        <Icon className="text-lg opacity-80" />
      </div>
      <div className="mt-3 text-[24px] font-medium">{value}</div>
    </div>
  );
}

export default function CertificationStats({ courses, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  const freeCount = courses.filter((c) => c.eligibility === "FREE").length;
  const paidCount = courses.filter((c) => c.eligibility === "PAID").length;
  const noneCount = courses.filter((c) => c.eligibility === "NONE").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <StatCard label="Free eligible" value={freeCount} tone="green" icon={FiAward} />
      <StatCard label="Paid eligible" value={paidCount} tone="amber" icon={FiDollarSign} />
      <StatCard label="Not eligible" value={noneCount} tone="gray" icon={FiXCircle} />
    </div>
  );
}
