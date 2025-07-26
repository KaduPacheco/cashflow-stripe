
// Extended rate limit operations to include api_request
export type RateLimitOperation = 'login' | 'password_change' | 'form_submission' | 'api_call' | 'api_request'

export const RATE_LIMIT_CONFIGS = {
  login: 5,
  password_change: 3,
  form_submission: 10,
  api_call: 60,
  api_request: 30 // New operation type for API requests
} as const

export function isValidRateLimitOperation(operation: string): operation is RateLimitOperation {
  return operation in RATE_LIMIT_CONFIGS
}
