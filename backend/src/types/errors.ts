export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR', true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR', true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR', true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR', true);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(`${service} service error: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', true, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR', true);
  }
}

// Error codes for specific scenarios
export const ERROR_CODES = {
  // Google Sheets errors
  SHEETS_CONNECTION_FAILED: 'SHEETS_001',
  SHEETS_INVALID_RANGE: 'SHEETS_002',
  SHEETS_PERMISSION_DENIED: 'SHEETS_003',
  SHEETS_QUOTA_EXCEEDED: 'SHEETS_004',
  
  // NAP validation errors
  INVALID_COORDINATES: 'NAP_001',
  INVALID_NAP_STATUS: 'NAP_002',
  NAP_ALREADY_VALIDATED: 'NAP_003',
  
  // Authentication errors
  INVALID_TOKEN: 'AUTH_001',
  TOKEN_EXPIRED: 'AUTH_002',
  UNAUTHORIZED_VALIDATION: 'AUTH_003',
  INVALID_GOOGLE_TOKEN: 'AUTH_004',
  
  // Maps API errors
  MAPS_API_LIMIT_EXCEEDED: 'MAPS_001',
  MAPS_INVALID_REQUEST: 'MAPS_002',
  
  // General errors
  INTERNAL_SERVER_ERROR: 'GEN_001',
  INVALID_REQUEST_FORMAT: 'GEN_002',
  MISSING_REQUIRED_FIELD: 'GEN_003',
} as const;