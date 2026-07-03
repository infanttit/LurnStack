import { useState, useEffect } from "react";
import { axiosClient } from "../api/axiosClient";

const CACHE_KEY = "lurnstack:active-offers:v1";

const MOCK_OFFERS = [
  {
    id: 1,
    title: "SQL Special Discount",
    discountType: "PERCENTAGE",
    discountValue: 70,
    offerType: "CATEGORY_WIDE",
    targetCategoryId: "SQL Training",
    isActive: true,
  },
  {
    id: 2,
    title: "Python Cashback Offer",
    discountType: "FLAT_AMOUNT",
    discountValue: 500,
    offerType: "CATEGORY_WIDE",
    targetCategoryId: "Python Programming",
    isActive: true,
  }
];

function readCachedOffers() {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function writeCachedOffers(offers) {
  if (typeof window === "undefined" || !offers) return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(offers));
  } catch {
    // Ignore cache write errors
  }
}

export function useActiveOffers() {
  const [offers, setOffers] = useState(() => {
    const cached = readCachedOffers();
    return cached || MOCK_OFFERS;
  });

  useEffect(() => {
    let active = true;
    async function fetchOffers() {
      try {
        const res = await axiosClient.get("/api/offers/active");
        if (active && res.data && res.data.success && Array.isArray(res.data.data)) {
          setOffers(res.data.data);
          writeCachedOffers(res.data.data);
        }
      } catch (err) {
        // Suppress print to avoid distracting console logs, fall back to mock data
      }
    }
    fetchOffers();
    return () => { active = false; };
  }, []);

  return offers;
}
