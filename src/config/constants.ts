/**
 * Application-wide constants
 */

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes in milliseconds
  MAX_REQUESTS: 100, // Maximum number of requests per window
};

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 6,
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  INVALID_ID: "Invalid ID format",
  NOT_FOUND: "Resource not found",
  INTERNAL_SERVER_ERROR: "Internal server error",
  UNAUTHORIZED: "Unauthorized access",
  INVALID_CREDENTIALS: "Invalid credentials",
  MISSING_FIELDS: "Missing required fields",
} as const;
