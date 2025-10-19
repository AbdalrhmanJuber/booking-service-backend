import rateLimit from "express-rate-limit";

// Strict limiter for login or sensitive routes
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // only 5 attempts
  message: "Too many login attempts, please try again later.",
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,  // Disable old headers
});

// General limiter for normal API routes
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
});
