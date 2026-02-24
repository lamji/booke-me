export const getBaseUrl = () => {
  // Server-side: use environment variables
  if (typeof window === "undefined") {
    return process.env.BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  }
  // Client-side: use relative or window.location
  return window.location.origin;
};
