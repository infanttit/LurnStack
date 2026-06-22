import React from "react";
import { FiAward, FiXCircle, FiDollarSign } from "react-icons/fi";

function StatCard({ label, value, tone, icon: Icon }) {
  const tones = {
    green: {
      card: "bg-gradient-to-br from-emerald-500/[0.03] to-emerald-500/[0.08] text-emerald-800 border-emerald-500/10 hover:border-emerald-500/20 hover:shadow-emerald-500/[0.03]",
      iconBg: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
    },
    amber: {
      card: "bg-gradient-to-br from-amber-500/[0.03] to-amber-500/[0.08] text-amber-800 border-amber-500/10 hover:border-amber-500/20 hover:shadow-amber-500/[0.03]",
      iconBg: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
    },
    gray: {
      card: "bg-gradient-to-br from-slate-500/[0.03] to-slate-500/[0.08] text-slate-700 border-slate-500/10 hover:border-slate-500/20 hover:shadow-slate-500/[0.03]",
      iconBg: "bg-slate-500/10 text-slate-500 border border-slate-500/20",
    },
  };

  const selectedTone = tones[tone] || tones.gray;

  return (
    <div className={[
      "relative overflow-hidden rounded-2xl border p-6 flex flex-col justify-between h-28 group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg backdrop-blur-sm",
      selectedTone.card
    ].join(" ")}>
      {/* Background soft glow decoration */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-current opacity-[0.02] blur-xl group-hover:scale-125 transition-transform duration-500" />
      
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <div className={["p-2.5 rounded-xl transition-all duration-300 group-hover:scale-105", selectedTone.iconBg].join(" ")}>
          <Icon className="text-base" />
        </div>
      </div>
      <div className="mt-auto text-[28px] font-extrabold tracking-tight text-slate-800 leading-none">{value}</div>
    </div>
  );
}

export default function CertificationStats({ courses, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-100 bg-slate-50/50" />
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
