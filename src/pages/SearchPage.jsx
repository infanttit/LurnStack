import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiMiniStar } from "react-icons/hi2";
import { getAllCourses } from "../courses/data/courseCatalog";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function scoreCourse(course, qNorm, qTokens) {
  if (!qNorm) return 0;
  const titleNorm = normalize(course?.title);
  const instructorNorm = normalize(course?.instructor);

  if (titleNorm === qNorm) return 1000;
  if (titleNorm.startsWith(qNorm)) return 850;
  if (titleNorm.includes(qNorm)) return 700;

  let tokenHits = 0;
  for (const token of qTokens) {
    if (!token) continue;
    if (titleNorm.includes(token)) tokenHits += 1;
  }
  if (tokenHits > 0) return 500 + tokenHits * 20;

  if (instructorNorm && instructorNorm.includes(qNorm)) return 250;
  return 0;
}

export default function SearchPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const q = (query.get("q") || "").trim();

  const results = useMemo(() => {
    const qNorm = normalize(q);
    if (!qNorm) return [];
    const qTokens = qNorm.split(" ").filter(Boolean);

    return getAllCourses()
      .map((course) => ({ course, score: scoreCourse(course, qNorm, qTokens) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const br = Number(b.course?.rating) || 0;
        const ar = Number(a.course?.rating) || 0;
        if (br !== ar) return br - ar;
        return String(a.course?.title || "").localeCompare(String(b.course?.title || ""));
      })
      .map((x) => x.course);
  }, [q]);

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-16">
      <h1 className="font-h2 text-h2 text-primary">Search</h1>
      <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
        Showing results for{" "}
        <span className="font-semibold text-on-surface">{q || "..."}</span>
      </p>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="rounded-2xl border border-outline-variant bg-surface p-5 sticky top-24">
            <div className="text-sm font-semibold text-on-surface">Tips</div>
            <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
              <li>Try course name keywords (example: “python”, “marketing”).</li>
              <li>Exact matches show first, then similar courses.</li>
            </ul>
            <div className="mt-5 flex gap-3 flex-wrap">
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
        </aside>

        <section className="lg:col-span-8 xl:col-span-9">
          {!q ? (
            <div className="rounded-2xl border border-outline-variant bg-surface p-6 text-sm text-on-surface-variant">
              Type a course name in the header search to see results.
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-outline-variant bg-surface p-6">
              <div className="text-sm text-on-surface-variant">
                No courses found for{" "}
                <span className="font-semibold text-on-surface">{q}</span>.
              </div>
              <div className="mt-4 text-sm text-on-surface-variant">
                Try shorter keywords or browse all courses.
              </div>
              <div className="mt-5">
                <Link
                  to="/courses"
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-95 transition-opacity"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="text-left bg-surface border border-outline-variant rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="w-full aspect-[16/9] overflow-hidden bg-surface-container-low">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${course.thumbnailBg}`} />
                    )}
                  </div>

                  <div className="p-4">
                    <div className="text-[11px] font-semibold text-on-surface-variant">
                      {course.tab}
                    </div>
                    <div className="mt-1 font-extrabold text-[15px] text-on-surface leading-snug line-clamp-2">
                      {course.title}
                    </div>
                    <div className="mt-1 text-[12px] text-on-surface-variant line-clamp-1">
                      {course.instructor}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="inline-flex items-center gap-1 text-[12px] font-bold text-[#b4690e]">
                        <HiMiniStar className="text-[14px]" />
                        {course.rating}
                      </div>
                      <div className="text-[11px] text-on-surface-variant line-clamp-1">
                        {course.ratingCount}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[16px] text-on-surface">
                          {course.price}
                        </span>
                        {course.oldPrice ? (
                          <span className="text-[12px] text-on-surface-variant/70 line-through">
                            {course.oldPrice}
                          </span>
                        ) : null}
                      </div>
                      {course.badge ? (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${course.badgeColor}`}>
                          {course.badge}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

