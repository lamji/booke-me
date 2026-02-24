/**
 * Professional Formatting Utilities
 * Standardized for Philippine Context (PHP/Peso)
 */

export const formatPHP = (amount: number | string): string => {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(value)) return "₱0.00";
  
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatMetric = (value: number): string => {
  return new Intl.NumberFormat("en-PH").format(value);
};
