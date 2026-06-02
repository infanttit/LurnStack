import { axiosClient } from "../../shared/api/axiosClient";

export async function trackOfferCampaignClick(campaignId, { targetType, targetId } = {}) {
  const id = String(campaignId || "").trim();
  if (!id || !targetType || !targetId) return null;

  const res = await axiosClient.post(`/api/student/offer-campaigns/${encodeURIComponent(id)}/click`, {
    targetType,
    targetId,
  });
  return res.data;
}
