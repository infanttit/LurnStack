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
              font-family: Manrope, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
              display: block;
              object-fit: cover;
              background: white;
              box-shadow: 0 18px 42px rgba(3,52,43,.28);
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
            <img class="ls-logo" src="/lurnstack-logo.png" alt="LurnStack" />
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

function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor || "";
  return /android|iphone|ipad|ipod|iemobile|opera mini/i.test(ua);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function withBrowserHint(meetingLink) {
  const link = String(meetingLink || "").trim();
  if (!link) return "";
  const separator = link.includes("?") ? "&" : "?";
  return `${link}${separator}pli=1`;
}

function renderMobileMeetingPrompt(meetingWindow, meetingLink) {
  if (!meetingWindow || meetingWindow.closed) return false;

  const safeLink = escapeHtml(meetingLink);
  const safeBrowserLink = escapeHtml(withBrowserHint(meetingLink));
  try {
    meetingWindow.document.title = "Open Google Meet";
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
          font-family: Manrope, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .ls-shell {
          min-height: 100vh;
          min-height: 100svh;
          display: grid;
          place-items: center;
          padding: max(24px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left));
          background:
            radial-gradient(circle at 18% 12%, rgba(16,185,129,.2), transparent 28%),
            radial-gradient(circle at 84% 18%, rgba(20,184,166,.16), transparent 30%),
            radial-gradient(circle at 50% 92%, rgba(3,52,43,.08), transparent 34%),
            linear-gradient(160deg, #f8fffc 0%, #eefaf5 46%, #f7fbff 100%);
        }
        .ls-card {
          width: min(520px, 100%);
          border: 1px solid rgba(255,255,255,.72);
          border-radius: 32px;
          background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(250,255,253,.94));
          box-shadow:
            0 34px 90px rgba(3,52,43,.16),
            inset 0 1px 0 rgba(255,255,255,.9);
          padding: 34px 24px 26px;
          text-align: center;
          backdrop-filter: blur(18px);
        }
        .ls-logo {
          width: 82px;
          height: 82px;
          margin: 0 auto 20px;
          border-radius: 26px;
          display: block;
          object-fit: cover;
          background: white;
          box-shadow:
            0 18px 44px rgba(3,52,43,.2),
            0 0 0 8px rgba(255,255,255,.78);
        }
        .ls-eyebrow {
          margin: 0 0 10px;
          color: #047857;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .ls-title {
          margin: 0;
          color: #052f29;
          font-size: 31px;
          line-height: 1.06;
          font-weight: 900;
          letter-spacing: 0;
        }
        .ls-copy {
          max-width: 380px;
          margin: 14px auto 0;
          color: #58756f;
          font-size: 14px;
          line-height: 1.65;
          font-weight: 600;
        }
        .ls-progress {
          position: relative;
          height: 9px;
          margin: 28px auto 12px;
          width: min(310px, 100%);
          overflow: hidden;
          border-radius: 999px;
          background: #dcefe8;
          box-shadow: inset 0 1px 2px rgba(3,52,43,.08);
        }
        .ls-progress span {
          position: absolute;
          inset: 0;
          width: 58%;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, #2dd4bf, #047857, #00342b, transparent);
          animation: lsSweep 1.25s ease-in-out infinite;
        }
        .ls-status {
          min-height: 18px;
          margin-top: 12px;
          color: #58756f;
          font-size: 12px;
          font-weight: 800;
        }
        .ls-actions {
          display: block;
          margin-top: 24px;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transform: translateY(8px);
          animation: lsRevealActions .28s ease 1.2s forwards;
        }
        .ls-loading {
          animation: lsHideLoading .2s ease 1.2s forwards;
        }
        .ls-card.is-ready .ls-loading {
          display: none;
        }
        .ls-card.is-ready .ls-actions {
          display: block;
          max-height: 420px;
          opacity: 1;
          transform: translateY(0);
        }
        .ls-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 54px;
          width: 100%;
          border-radius: 18px;
          background: linear-gradient(135deg, #00342b, #047857);
          color: #ffffff;
          text-decoration: none;
          font-size: 15px;
          font-weight: 900;
          box-shadow: 0 16px 34px rgba(3,52,43,.2);
          -webkit-tap-highlight-color: transparent;
        }
        .ls-button-secondary {
          margin-top: 13px;
          border: 1px solid rgba(4,120,87,.2);
          background: rgba(255,255,255,.86);
          color: #00342b;
          box-shadow: 0 12px 30px rgba(3,52,43,.08);
        }
        .ls-help {
          margin: 16px auto 0;
          max-width: 330px;
          color: #6a827d;
          font-size: 12px;
          line-height: 1.45;
          font-weight: 700;
        }
        @keyframes lsSweep {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
        @keyframes lsHideLoading {
          to {
            max-height: 0;
            opacity: 0;
            margin: 0;
            overflow: hidden;
          }
        }
        @keyframes lsRevealActions {
          to {
            max-height: 420px;
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 340px) {
          .ls-card {
            padding: 28px 16px 22px;
            border-radius: 24px;
          }
          .ls-title {
            font-size: 26px;
          }
          .ls-logo {
            width: 70px;
            height: 70px;
            border-radius: 22px;
          }
        }
      </style>
      <main class="ls-shell">
        <section id="lsCard" class="ls-card">
          <img class="ls-logo" src="/lurnstack-logo.png" alt="LurnStack" />
          <p class="ls-eyebrow">LurnStack live class</p>
          <h1 class="ls-title">Preparing your class</h1>
          <p class="ls-copy">We are getting your secure Google Meet link ready for this mobile device.</p>
          <div class="ls-loading">
            <div class="ls-progress"><span></span></div>
            <div class="ls-status">Checking the best way to open your class...</div>
          </div>
          <div class="ls-actions" aria-live="polite">
            <p class="ls-copy">Choose Google Meet if the app is installed. If Play Store opens or the app is unavailable, use browser mode.</p>
            <a class="ls-button" href="${safeLink}" rel="noreferrer">Continue with Google Meet</a>
            <a class="ls-button ls-button-secondary" href="${safeBrowserLink}" target="_blank" rel="noreferrer">Continue with Browser</a>
            <p class="ls-help">Browser mode is useful when the Meet app is not available on this device.</p>
          </div>
        </section>
      </main>
    `;
    meetingWindow.setTimeout(() => {
      const card = meetingWindow.document.getElementById("lsCard");
      if (card && !card.className.includes("is-ready")) {
        card.className += " is-ready";
      }
      meetingWindow.document.title = "Join live class";
    }, 1200);
    return true;
  } catch {
    return false;
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

  if (isMobileBrowser() && renderMobileMeetingPrompt(meetingWindow, link)) {
    return true;
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
