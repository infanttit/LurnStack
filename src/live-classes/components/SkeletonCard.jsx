export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start animate-pulse">
      <div className="w-full h-36 sm:w-11 sm:h-11 rounded-xl bg-[#f0efe9] flex-shrink-0" />
      <div className="flex-1">
        <div className="h-2.5 w-28 bg-[#f0efe9] rounded mb-2" />
        <div className="h-3.5 w-full max-w-64 bg-[#f0efe9] rounded mb-2" />
        <div className="h-2.5 w-3/4 max-w-48 bg-[#f0efe9] rounded mb-4" />
        <div className="h-8 w-full sm:w-24 bg-[#f0efe9] rounded-xl" />
      </div>
    </div>
  );
}
