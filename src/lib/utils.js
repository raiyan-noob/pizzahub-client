import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function normalizeBdtPrice(price) {
  const num = typeof price === "number" ? price : parseFloat(price) || 0;
  if (num > 0 && num < 100) {
    return Math.round((num * 50) / 10) * 10;
  }
  return num;
}

export function formatPrice(price) {
  const numericPrice = normalizeBdtPrice(price);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: Number.isInteger(numericPrice) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
