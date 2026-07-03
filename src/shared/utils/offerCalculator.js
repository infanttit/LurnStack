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
    return { hasDiscount: false, price: course?.price || "Free", oldPrice: course?.oldPrice || null, badgeText: null };
  }
  let basePrice = parsePriceString(course.price);
  if (basePrice <= 0 && course.amountPaise > 0) {
    basePrice = course.amountPaise / 100;
  }
  if (basePrice <= 0) {
    return { hasDiscount: false, price: course.price, oldPrice: course.oldPrice || null, badgeText: null };
  }
  // Retrieve course category values
  const categoryId = String(course.courseId || course.courseAccessId || "").trim().toLowerCase();
  const category = course.category || course.raw?.category || "";
  const normalizedCategory = String(category).trim().toLowerCase();
  const slugifiedCategory = normalizedCategory.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const matchingOffer = (activeOffers || []).find(offer => {
    if (!offer.isActive) return false;
    // Check Category-wide matches against ID, Slug or raw category string
    if (offer.targetCategoryId) {
      const target = String(offer.targetCategoryId).trim().toLowerCase();
      const slugifiedTarget = target.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (
        categoryId === target ||
        normalizedCategory === target ||
        slugifiedCategory === slugifiedTarget
      ) {
        return true;
      }
    }
    // Check Course-specific matches
    if (offer.targetCourseId) {
      const targetId = String(offer.targetCourseId).trim().toLowerCase();
      const courseId = String(course.id || "").trim().toLowerCase();
      const parentCourseId = String(course.courseId || course.courseAccessId || "").trim().toLowerCase();
      if (targetId === courseId || targetId === parentCourseId) {
        return true;
      }
    }
    return false;
  });
  if (!matchingOffer) {
    return { hasDiscount: false, price: course.price, oldPrice: course.oldPrice || null, badgeText: null };
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
    badgeText = `₹${matchingOffer.discountValue} Cashback`;
  }
  return {
    hasDiscount: true,
    price: formatPriceString(discountedValue),
    oldPrice: course.price,
    badgeText,
    offerId: matchingOffer.id,
    discountedAmountPaise: Math.round(discountedValue * 100)
  };
}
