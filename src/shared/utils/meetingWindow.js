export function openPendingMeetingWindow() {
  if (typeof window === "undefined") return null;
  try {
    const meetingWindow = window.open("about:blank", "_blank");
    if (meetingWindow) {
      meetingWindow.document.title = "Opening live class...";
      meetingWindow.document.head.innerHTML = `
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      `;
      meetingWindow.document.body.innerHTML = `
        <style>
            * { box-sizing: border-box; }
            html, body {
              width: 100%;
              min-height: 100%;
              margin: 0;
            }
            body {
              color: #073b32;
              font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }
            .ls-shell {
              min-height: 100vh;
              min-height: 100svh;
              width: 100%;
              display: grid;
              place-items: center;
              padding: max(18px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(18px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
              background:
                radial-gradient(circle at 18% 18%, rgba(34,197,94,.18), transparent 32%),
                radial-gradient(circle at 82% 22%, rgba(20,184,166,.18), transparent 30%),
                linear-gradient(135deg, #f8fffc 0%, #eef8f4 42%, #f6fbff 100%);
              overflow: auto;
            }
            .ls-card {
              width: min(520px, 100%);
              border: 1px solid rgba(4,120,87,.14);
              border-radius: 28px;
              background: rgba(255,255,255,.82);
              box-shadow: 0 28px 80px rgba(3,52,43,.14);
              backdrop-filter: blur(18px);
              padding: 36px;
              text-align: center;
            }
            .ls-logo {
              width: 74px;
              height: 74px;
              margin: 0 auto 22px;
              border-radius: 24px;
              display: grid;
              place-items: center;
              background: linear-gradient(135deg, #00342b, #047857);
              color: white;
              box-shadow: 0 18px 42px rgba(3,52,43,.28);
              font-size: 30px;
              font-weight: 900;
              letter-spacing: 0;
            }
            .ls-eyebrow {
              margin: 0 0 10px;
              color: #047857;
              font-size: 12px;
              font-weight: 900;
              letter-spacing: .12em;
              text-transform: uppercase;
            }
            .ls-title {
              margin: 0;
              color: #032f28;
              font-size: 42px;
              line-height: 1.05;
              font-weight: 900;
              letter-spacing: 0;
            }
            .ls-copy {
              max-width: 360px;
              margin: 14px auto 0;
              color: #58756f;
              font-size: 15px;
              line-height: 1.6;
              font-weight: 600;
            }
            .ls-progress {
              position: relative;
              height: 10px;
              margin: 30px auto 18px;
              width: min(300px, 100%);
              overflow: hidden;
              border-radius: 999px;
              background: #dceee8;
            }
            .ls-progress span {
              position: absolute;
              inset: 0;
              width: 70%;
              border-radius: 999px;
              background: linear-gradient(90deg, transparent, #10b981, #00342b, transparent);
              animation: lsSweep 1.35s ease-in-out infinite;
            }
            .ls-dots {
              display: flex;
              justify-content: center;
              gap: 8px;
              margin-top: 10px;
            }
            .ls-dots span {
              width: 9px;
              height: 9px;
              border-radius: 50%;
              animation: lsPulse .9s ease-in-out infinite;
            }
            @keyframes lsPulse {
              0%, 100% { transform: scale(.78); opacity:.55; }
              50% { transform: scale(1); opacity:1; }
            }
            @keyframes lsSweep {
              0% { transform: translateX(-120%); }
              100% { transform: translateX(120%); }
            }
            @media (max-width: 520px) {
              .ls-card {
                border-radius: 22px;
                padding: 28px 22px;
              }
              .ls-logo {
                width: 62px;
                height: 62px;
                border-radius: 20px;
                margin-bottom: 18px;
                font-size: 26px;
              }
              .ls-title {
                font-size: 31px;
                line-height: 1.08;
              }
              .ls-copy {
                font-size: 14px;
              }
              .ls-eyebrow {
                font-size: 11px;
              }
            }
            @media (max-width: 340px) {
              .ls-shell {
                padding: 12px;
              }
              .ls-card {
                border-radius: 18px;
                padding: 24px 16px;
              }
              .ls-title {
                font-size: 27px;
              }
            }
            @media (min-width: 900px) {
              .ls-card {
                padding: 42px;
              }
            }
          </style>
        <main class="ls-shell">
          <section class="ls-card">
            <div class="ls-logo">L</div>
            <p class="ls-eyebrow">LurnStack live class</p>
            <h1 class="ls-title">Opening your class</h1>
            <p class="ls-copy">Please wait while we connect you to the live session.</p>
            <div class="ls-progress">
              <span></span>
            </div>
            <div class="ls-dots">
              <span style="background:#00342b;"></span>
              <span style="background:#047857;animation-delay:.12s;"></span>
              <span style="background:#14b8a6;animation-delay:.24s;"></span>
            </div>
          </section>
        </main>
      `;
    }
    return meetingWindow;
  } catch {
    return null;
  }
}

export function openMeetingLink(meetingWindow, meetingLink) {
  const link = String(meetingLink || "").trim();
  if (!link) {
    try {
      if (meetingWindow && !meetingWindow.closed) {
        meetingWindow.close();
      }
    } catch {
      meetingWindow?.close?.();
    }
    return false;
  }

  try {
    if (meetingWindow && !meetingWindow.closed) {
      meetingWindow.opener = null;
      meetingWindow.location.href = link;
      return true;
    }
  } catch {
    // Fall through to direct open.
  }

  if (typeof window !== "undefined") {
    window.open(link, "_blank", "noopener,noreferrer");
    return true;
  }
  return false;
}
