import { axiosClient } from "../../shared/api/axiosClient";
import { getAxiosErrorMessage } from "../../shared/api/axiosError";

function unwrapChatResponse(res) {
  const payload = res?.data;
  if (!payload?.success) {
    throw new Error(payload?.message || "Unable to get an AI response.");
  }
  const data = payload.data || payload;
  return {
    answer: data.answer || data.message || "",
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
  };
}

export async function sendAiChatMessage({ message, history = [], context = {} }) {
  try {
    const res = await axiosClient.post("/api/ai/chat", {
      message,
      history: history.slice(-8),
      context,
    });
    return unwrapChatResponse(res);
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "AI assistant is unavailable. Please try again."));
  }
}
