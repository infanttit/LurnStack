import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackOfferCampaignClick } from "../api/offerCampaignsApi";

export default function useOfferCampaignClick(targetType, targetId) {
  const location = useLocation();

  useEffect(() => {
    const campaignId = new URLSearchParams(location.search).get("campaignId");
    const safeTargetId = String(targetId || "").trim();
    if (!campaignId || !targetType || !safeTargetId) return;

    trackOfferCampaignClick(campaignId, {
      targetType,
      targetId: safeTargetId,
    }).catch(() => {
      // Offer click tracking is best-effort and must not block page loading.
    });
  }, [location.search, targetId, targetType]);
}
