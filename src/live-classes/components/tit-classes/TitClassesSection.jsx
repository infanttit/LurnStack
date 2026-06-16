import React from "react";
import TitClassCard from "./TitClassCard";

export default function TitClassesSection({ titLoading, titClassSessions, now, openTitMeeting }) {
  return (
    <section>
      <div className="pb-4">
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900 sm:text-[36px]">
              TIT class sessions
            </h1>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-700">
              Browse your trainer-led live sessions in the same course card format, with price, schedule, details, and join access in one place.
            </p>
          </div>
          <div className="text-sm font-bold text-slate-500">
            {titLoading ? "Loading..." : `${titClassSessions.length} sessions`}
          </div>
        </div>
      </div>

      {titLoading ? (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : titClassSessions.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-xl font-extrabold text-gray-900">
            No TIT classes available
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Published TIT sessions will appear here once the backend returns them.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {titClassSessions.map((titClass) => (
            <TitClassCard
              key={titClass.id}
              titClass={titClass}
              now={now}
              onOpenMeeting={openTitMeeting}
            />
          ))}
        </div>
      )}
    </section>
  );
}
