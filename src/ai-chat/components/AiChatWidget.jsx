import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineMinus,
  HiOutlinePaperAirplane,
  HiOutlineTrash,
  HiOutlineXMark,
} from "react-icons/hi2";
import { useAuth } from "../../auth";
import { PATHS } from "../../app/router/paths";
import logo from "../../assets/Logo/Logo4.png";
import { sendAiChatMessage } from "../api/aiChatApi";

const CHAT_STORAGE_KEY = "lurnstack:ai-chat:messages:v2";

const QUICK_PROMPTS = [
  { icon: "🎓", label: "What should I learn next?",  text: "What should I learn next based on my level?" },
  { icon: "📅", label: "How to join live class?",    text: "How do I join my live class?" },
  { icon: "💳", label: "My paid sessions",           text: "Explain my paid sessions and how to access them" },
  { icon: "🤔", label: "Help with a doubt",          text: "Help me with a course doubt" },
  { icon: "🛒", label: "How does cart work?",        text: "How does the cart and checkout work on LurnStack?" },
  { icon: "📊", label: "View my attendance",         text: "How can I view my attendance record?" },
  { icon: "🤝", label: "Contact support",            text: "How do I contact LurnStack support?" },
];


const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  text: "Hi, I am LurnStack AI. Ask me about courses, live sessions, your learning dashboard, or a study doubt.",
};

const SUPPORT_CONTACT = {
  email: "lurnstack@gmail.com",
  phone: "+91 95666 09360",
};

const LIVE_SITE_URL = "https://lurnstack.com";

function livePath(path) {
  const safePath = String(path || "/").startsWith("/") ? path : `/${path}`;
  return `${LIVE_SITE_URL}${safePath}`;
}

// Map from live URL → { internalPath, label } for inline link rendering
const URL_LINK_MAP = [
  { url: livePath(PATHS.STUDENT_ATTENDANCE), path: PATHS.STUDENT_ATTENDANCE, label: "My Attendance" },
  { url: livePath(PATHS.FORGOT_PASSWORD),    path: PATHS.FORGOT_PASSWORD,    label: "Forgot Password" },
  { url: livePath(PATHS.DASHBOARD + "?view=upcoming"), path: PATHS.DASHBOARD + "?view=upcoming", label: "Live Classes" },
  { url: livePath(PATHS.LIVE_CLASSES),       path: PATHS.LIVE_CLASSES,       label: "TIT Classes" },
  { url: livePath(PATHS.DASHBOARD),          path: PATHS.DASHBOARD,          label: "My Learning" },
  { url: livePath(PATHS.CHECKOUT),           path: PATHS.CHECKOUT,           label: "Checkout" },
  { url: livePath(PATHS.COURSES),            path: PATHS.COURSES,            label: "Courses" },
  { url: livePath(PATHS.PROFILE),            path: PATHS.PROFILE,            label: "Profile" },
  { url: livePath(PATHS.SIGNUP),             path: PATHS.SIGNUP,             label: "Sign up" },
  { url: livePath(PATHS.LOGIN),              path: PATHS.LOGIN,              label: "Login" },
  { url: livePath(PATHS.PLANS),              path: PATHS.PLANS,              label: "Plans" },
  { url: livePath(PATHS.CART),               path: PATHS.CART,               label: "Cart" },
  { url: livePath(PATHS.HOME),               path: PATHS.HOME,               label: "Home" },
];

/**
 * Splits text by known LurnStack live URLs and returns an array of
 * strings and <Link> elements. URLs are shown as friendly page labels.
 */
function renderMessageText(text, keyPrefix) {
  // Build one big regex that matches any known live URL
  const escapedUrls = URL_LINK_MAP.map((entry) =>
    entry.url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const pattern = new RegExp(`(${escapedUrls.join("|")})`, "g");

  const parts = String(text || "").split(pattern);
  return parts.map((part, idx) => {
    const match = URL_LINK_MAP.find((entry) => entry.url === part);
    if (match) {
      return (
        <Link
          key={`${keyPrefix}-link-${idx}`}
          to={match.path}
          className="inline-font-semibold rounded px-0.5 text-[#004d3d] underline decoration-emerald-600/40 underline-offset-2 transition-colors hover:text-[#003d31] hover:decoration-emerald-600"
        >
          {match.label}
        </Link>
      );
    }
    return part;
  });
}

const PAGE_GUIDE = [
  { label: "Home", path: livePath(PATHS.HOME), useFor: "landing page, general LurnStack overview" },
  { label: "Courses", path: livePath(PATHS.COURSES), useFor: "browse courses, categories, course search" },
  { label: "My Learning", path: livePath(PATHS.DASHBOARD), useFor: "student dashboard, enrolled courses, paid sessions" },
  { label: "Live Classes", path: livePath(PATHS.DASHBOARD + "?view=upcoming"), useFor: "enrolled live classes, join live classes, student's upcoming classes" },
  { label: "TIT Classes Catalog", path: livePath(PATHS.LIVE_CLASSES), useFor: "general TIT class sessions list, browse all live classes" },
  { label: "Cart", path: livePath(PATHS.CART), useFor: "cart items before checkout" },
  { label: "Checkout", path: livePath(PATHS.CHECKOUT), useFor: "payment and order completion" },
  { label: "Profile", path: livePath(PATHS.PROFILE), useFor: "profile, account details, attendance history" },
  { label: "Student Attendance", path: livePath(PATHS.STUDENT_ATTENDANCE), useFor: "student attendance records" },
  { label: "Plans", path: livePath(PATHS.PLANS), useFor: "plans and pricing" },
  { label: "Login", path: livePath(PATHS.LOGIN), useFor: "sign in" },
  { label: "Signup", path: livePath(PATHS.SIGNUP), useFor: "create account, register" },
  { label: "Forgot Password", path: livePath(PATHS.FORGOT_PASSWORD), useFor: "password reset request" },
];

function readStoredMessages() {
  if (typeof window === "undefined") return [WELCOME_MESSAGE];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CHAT_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) && parsed.length ? parsed : [WELCOME_MESSAGE];
  } catch {
    return [WELCOME_MESSAGE];
  }
}

function writeStoredMessages(messages) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-30)));
}

function createMessage(role, text) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    text,
  };
}

function shortenAssistantAnswer(text) {
  const clean = String(text || "")
    .replace(/\*\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (clean.length <= 260) return clean;
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 3).join(" ");
  return sentences.length <= 260 ? sentences : `${clean.slice(0, 250).trim()}...`;
}

function buildPageContext(location, user) {
  return {
    pathname: location.pathname,
    search: location.search,
    pageUrl: livePath(`${location.pathname}${location.search}`),
    responseStyle:
      "Answer in 2 to 3 very short, simple lines. If the user needs to go somewhere, include the full live LurnStack URL from pageGuide. Avoid relative paths like /courses. Avoid long paragraphs and markdown.",
    support: SUPPORT_CONTACT,
    pageGuide: PAGE_GUIDE,
    instruction:
      "Use pageGuide to recommend exact live URLs. For support, contact, helpdesk, phone, WhatsApp, or email questions, provide support.email and support.phone.",
    user: {
      fullName: user?.fullName || "",
      role: user?.role || "student",
    },
  };
}

function getLocalAnswer(text) {
  const query = String(text || "").toLowerCase();
  if (/(support|contact|helpdesk|customer care|phone|mobile|whatsapp|email|mail|call)/i.test(query)) {
    return `For support, contact LurnStack at ${SUPPORT_CONTACT.phone} or email ${SUPPORT_CONTACT.email}.`;
  }
  if (/(profile|account|attendance)/i.test(query)) {
    return `Open ${livePath(PATHS.PROFILE)}. For attendance, use ${livePath(PATHS.STUDENT_ATTENDANCE)}.`;
  }
  if (/(my learning|dashboard|paid session|purchased|enrolled)/i.test(query)) {
    return `Open ${livePath(PATHS.DASHBOARD)}. You can view courses, paid sessions, and upcoming classes there.`;
  }
  if (/(live class|tit class|join class|upcoming class)/i.test(query)) {
    return `Open ${livePath(PATHS.DASHBOARD + "?view=upcoming")}. Select your class to view details or join.`;
  }
  if (/(course|category|search|learn)/i.test(query)) {
    return `Open ${livePath(PATHS.COURSES)}. Use search or category filters to find the right course.`;
  }
  if (/(cart|checkout|payment|pay|order)/i.test(query)) {
    return `Open ${livePath(PATHS.CART)} to review items, then continue to ${livePath(PATHS.CHECKOUT)}.`;
  }
  return "";
}

function getPanelSize(mobile) {
  if (typeof window === "undefined") return { width: 340, height: 560 };
  return {
    width: mobile ? Math.min(300, window.innerWidth - 16) : Math.min(340, window.innerWidth - 24),
    height: mobile ? Math.min(460, window.innerHeight - 96) : Math.min(560, window.innerHeight - 120),
  };
}

function clampPanelPosition(x, y, width, height) {
  if (typeof window === "undefined") return { x, y };
  return {
    x: Math.min(Math.max(8, x), Math.max(8, window.innerWidth - width - 8)),
    y: Math.min(Math.max(8, y), Math.max(8, window.innerHeight - height - 8)),
  };
}

function MessageBubble({ message }) {
  const mine = message.role === "user";
  const content = mine
    ? message.text
    : renderMessageText(message.text, message.id);
  return (
    <div className={["flex items-end gap-2", mine ? "justify-end" : "justify-start"].join(" ")}>
      {!mine ? (
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-emerald-900/10 bg-white shadow-sm">
          <img src={logo} alt="" className="h-5 w-5 object-contain" />
        </div>
      ) : null}
      <div
        className={[
          "max-w-[84%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
          mine
            ? "rounded-br-md bg-[#004d3d] text-white shadow-emerald-950/10"
            : "rounded-bl-md border border-slate-200 bg-white text-slate-800",
        ].join(" ")}
      >
        {content}
      </div>
      {mine ? (
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-900 text-[10px] font-black text-white">
          ME
        </div>
      ) : null}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-emerald-900/10 bg-white shadow-sm">
        <img src={logo} alt="" className="h-5 w-5 object-contain" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
        {[0, 1, 2].map((item) => (
          <span
            key={item}
            className="h-2 w-2 animate-pulse rounded-full bg-emerald-700/70"
            style={{ animationDelay: `${item * 140}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AiChatWidget() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState(readStoredMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [position, setPosition] = useState(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const listRef = useRef(null);
  const panelRef = useRef(null);
  const dragRef = useRef(null);

  const pageContext = useMemo(() => buildPageContext(location, user), [location, user]);

  useEffect(() => {
    const openChat = () => {
      setOpen(true);
      setMinimized(false);
    };
    window.addEventListener("lurnstack:open-ai-chat", openChat);
    return () => window.removeEventListener("lurnstack:open-ai-chat", openChat);
  }, []);

  useEffect(() => {
    writeStoredMessages(messages);
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const syncViewport = () => {
      const mobile = window.innerWidth < 640;
      setIsMobileViewport(mobile);
      setPosition((current) => {
        if (!current) return current;
        const size = getPanelSize(mobile);
        return clampPanelPosition(current.x, current.y, size.width, size.height);
      });
    };
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    if (!open || minimized || position || typeof window === "undefined") return;
    const size = getPanelSize(isMobileViewport);
    setPosition(clampPanelPosition(window.innerWidth - size.width - 12, window.innerHeight - size.height - 12, size.width, size.height));
  }, [open, minimized, position, isMobileViewport]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!dragRef.current || !panelRef.current) return;
      event.preventDefault();
      const size = getPanelSize(dragRef.current.mobile);
      const nextX = event.clientX - dragRef.current.offsetX;
      const nextY = event.clientY - dragRef.current.offsetY;
      setPosition(clampPanelPosition(nextX, nextY, size.width, size.height));
    };

    const handlePointerUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  if (!isAuthenticated) return null;

  const submitMessage = async (overrideText) => {
    const text = String(overrideText || input).trim();
    if (!text || loading) return;

    const userMessage = createMessage("user", text);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const localAnswer = getLocalAnswer(text);
      if (localAnswer) {
        setMessages((current) => [...current, createMessage("assistant", localAnswer)]);
        return;
      }

      const response = await sendAiChatMessage({
        message: text,
        history: nextMessages
          .filter((item) => item.id !== "welcome")
          .map((item) => ({ role: item.role, content: item.text })),
        context: pageContext,
      });
      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          shortenAssistantAnswer(response.answer || "I could not prepare an answer right now.")
        ),
      ]);
    } catch (err) {
      setError(err?.message || "AI assistant is unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setError("");
  };

  const startDrag = (event) => {
    if (!panelRef.current || event.target.closest("button")) return;
    const rect = panelRef.current.getBoundingClientRect();
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      mobile: isMobileViewport,
    };
  };

  return (
    <>
      {open && !minimized ? (
        <section
          ref={panelRef}
          className="fixed z-[120] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.24)] ring-1 ring-black/5"
          style={{
            left: position ? `${position.x}px` : "8px",
            top: position ? `${position.y}px` : "88px",
            width: isMobileViewport ? "min(300px, calc(100vw - 16px))" : "340px",
          }}
        >
          <div className="flex h-[min(460px,calc(100dvh-96px))] min-h-[320px] flex-col sm:h-[min(560px,calc(100dvh-120px))] sm:min-h-[400px]">
            <div
              className="flex cursor-move touch-none select-none items-center justify-between bg-[#004d3d] px-3 py-3 text-white sm:px-4"
              onPointerDown={startDrag}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white shadow-sm sm:h-11 sm:w-11">
                  <img
                    src={logo}
                    alt="LurnStack"
                    className="h-8 w-8 object-contain sm:h-9 sm:w-9"
                    loading="eager"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-black">
                    LurnStack AI
                    <span className="inline-flex h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_0_4px_rgba(190,242,100,0.18)]" />
                  </div>
                  <div className="truncate text-[11px] font-semibold text-emerald-50/75">
                    Course guide and learning helper
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clearChat}
                  className="inline-flex h-8 items-center gap-1.5 rounded-xl px-2 text-xs font-semibold text-emerald-50/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Clear chat"
                >
                  <HiOutlineTrash />
                  <span className="hidden sm:inline">Clear</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMinimized(true)}
                  className="grid h-8 w-8 place-items-center rounded-xl text-emerald-50/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Minimize AI chat"
                >
                  <HiOutlineMinus />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl text-emerald-50/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close AI chat"
                >
                  <HiOutlineXMark />
                </button>
              </div>
            </div>

            <div className="border-b border-emerald-900/10 bg-emerald-50 px-4 py-2 text-[11px] font-bold text-emerald-950">
              Ask about courses, live classes, dashboard, payments, or study doubts.
            </div>

            <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50/90 px-3 py-3 sm:px-4 sm:py-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {loading ? <TypingIndicator /> : null}
            </div>

            {/* Quick Questions — always visible, horizontal scroll strip */}
            <div className="border-t border-slate-100 bg-white px-3 pb-2 pt-2.5">
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick questions</span>
                <span className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.text}
                    type="button"
                    onClick={() => submitMessage(prompt.text)}
                    disabled={loading}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-all hover:border-[#004d3d] hover:bg-emerald-50 hover:text-[#004d3d] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>{prompt.icon}</span>
                    <span className="whitespace-nowrap">{prompt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
                {error}
              </div>
            ) : null}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitMessage();
              }}
              className="border-t border-slate-200 bg-white p-3"
            >
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      submitMessage();
                    }
                  }}
                  rows={1}
                  placeholder="Ask a course doubt..."
                  className="max-h-24 min-h-[42px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#004d3d] focus:bg-white focus:ring-4 focus:ring-emerald-900/10 sm:max-h-28 sm:min-h-[44px] sm:py-3"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#004d3d] text-white shadow-lg shadow-emerald-950/15 transition-colors hover:bg-[#003d31] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                  aria-label="Send message"
                >
                  <HiOutlinePaperAirplane />
                </button>
              </div>
              <div className="mt-2 text-[11px] font-medium leading-4 text-slate-500">
                AI can make mistakes. Confirm schedule, payment, and account details in LurnStack pages.
              </div>
            </form>
          </div>
        </section>
      ) : null}

      {open && minimized ? (
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="fixed bottom-5 right-5 z-[120] inline-flex h-12 items-center gap-2 rounded-full bg-[#004d3d] px-4 text-sm font-black text-white shadow-[0_16px_44px_rgba(15,23,42,0.22)] transition-colors hover:bg-[#003d31]"
        >
          <HiOutlineChatBubbleLeftRight className="text-lg" />
          Ask AI
        </button>
      ) : null}
    </>
  );
}
