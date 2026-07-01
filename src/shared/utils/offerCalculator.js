export function parsePriceString(priceStr) {
  if (!priceStr || typeof priceStr !== "string") return 0;
  const numStr = priceStr.replace(/[^0-9.]/g, "");
  return parseFloat(numStr) || 0;
}

export function formatPriceString(value) {
  if (value <= 0) return "Free";
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getDiscountedPrice(course, activeOffers) {
  if (!course || !course.price || String(course.price).toLowerCase() === "free") {
    return {
      hasDiscount: false,
      price: course?.price || "Free",
      oldPrice: course?.oldPrice || null,
      badgeText: null
    };
  }

  const basePrice = parsePriceString(course.price);
  if (basePrice <= 0) {
    return {
      hasDiscount: false,
      price: course.price,
      oldPrice: course.oldPrice || null,
      badgeText: null
    };
  }

  const category = course.category || course.raw?.category || course.raw?.course_category || "";
  const normalizedCategory = String(category).trim().toLowerCase();
  const slugifiedCategory = normalizedCategory.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  
  const matchingOffer = (activeOffers || []).find(offer => {
    if (!offer.isActive) return false;
    
    // Check Category-wide matches
    if (offer.targetCategoryId) {
      const target = String(offer.targetCategoryId).trim().toLowerCase();
      const slugifiedTarget = target.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (normalizedCategory === target || slugifiedCategory === slugifiedTarget) return true;
    }
    
    // Check Course-specific matches
    if (offer.targetCourseId && String(offer.targetCourseId) === String(course.id)) {
      return true;
    }
    
    return false;
  });

  if (!matchingOffer) {
    return {
      hasDiscount: false,
      price: course.price,
      oldPrice: course.oldPrice || null,
      badgeText: null
    };
  }

  let discountedValue = basePrice;
  let badgeText = "";

  if (matchingOffer.discountType === "PERCENTAGE") {
    discountedValue = basePrice - (basePrice * (matchingOffer.discountValue / 100));
    badgeText = `${matchingOffer.discountValue}% OFF`;
  } else if (matchingOffer.discountType === "FLAT_AMOUNT") {
    discountedValue = Math.max(0, basePrice - matchingOffer.discountValue);
    badgeText = `Flat ₹${matchingOffer.discountValue} OFF`;
  } else if (matchingOffer.discountType === "CASHBACK") {
    // Cashback does not reduce base price directly, but offers cashback benefits
    badgeText = `₹${matchingOffer.discountValue} Cashback`;
  }

  return {
    hasDiscount: true,
    price: formatPriceString(discountedValue),
    oldPrice: course.price,
    badgeText
  };
}
