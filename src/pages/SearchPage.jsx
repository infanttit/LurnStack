import { Link, useLocation } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function SearchPage() {
  const query = useQuery();
  const q = (query.get("q") || "").trim();

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-16">
      <h1 className="font-h2 text-h2 text-primary">Search</h1>
      <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
        Showing results for{" "}
        <span className="font-semibold text-on-surface">{q || "…"}</span>
      </p>

      <div className="mt-10 rounded-2xl border border-outline-variant bg-surface p-6">
        <div className="text-sm text-on-surface-variant">
          Search is wired from the navbar. Replace this mock screen with real
          course results after the admin/course upload module is ready.
        </div>
        <div className="mt-6 flex gap-3 flex-wrap">
          <Link
            to="/courses"
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-95 transition-opacity"
          >
            Browse Courses
          </Link>
          <Link
            to="/categories"
            className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container-low transition-colors"
          >
            Browse Categories
          </Link>
        </div>
      </div>
    </main>
  );
}

