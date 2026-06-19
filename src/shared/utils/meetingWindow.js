export function openPendingMeetingWindow() {
  if (typeof window === "undefined") return null;
  try {
    const meetingWindow = window.open("/opening-class.html", "_blank");
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
      meetingWindow.location.replace("/opening-class.html?link=" + encodeURIComponent(link));
      return true;
    }
  } catch (err) {
    console.error("Failed to redirect meeting window: ", err);
  }

  if (typeof window !== "undefined") {
    window.open(link, "_blank", "noopener,noreferrer");
    return true;
  }
  return false;
}
