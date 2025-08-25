/**
 * Application Constants
 * 
 * Centralized constants for the SDU Dormitory Management System.
 * This file contains all magic numbers, strings, and configuration values
 * used throughout the application to improve maintainability.
 * 
 * @module constants
 */

/**
 * File upload constants
 */
export const FILE_CONSTANTS = {
  /** Maximum file size in bytes (5MB) */
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  /** Allowed file types for document uploads */
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
  /** Allowed file types for image uploads */
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  /** Maximum file size for images in bytes (2MB) */
  MAX_IMAGE_SIZE: 2 * 1024 * 1024,
  /** File extensions for documents */
  ALLOWED_DOCUMENT_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png'],
  /** File extensions for images */
  ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

/**
 * Validation constants
 */
export const VALIDATION_CONSTANTS = {
  /** Minimum password length */
  MIN_PASSWORD_LENGTH: 6,
  /** Maximum password length */
  MAX_PASSWORD_LENGTH: 255,
  /** Minimum name length */
  MIN_NAME_LENGTH: 2,
  /** Maximum name length */
  MAX_NAME_LENGTH: 255,
  /** Maximum email length */
  MAX_EMAIL_LENGTH: 255,
  /** Maximum phone number length */
  MAX_PHONE_LENGTH: 20,
  /** Maximum description length */
  MAX_DESCRIPTION_LENGTH: 1000,
  /** Maximum notes length */
  MAX_NOTES_LENGTH: 500,
  /** Minimum enrollment year */
  MIN_ENROLLMENT_YEAR: 2000,
  /** Maximum enrollment year (current year + 10) */
  MAX_ENROLLMENT_YEAR: new Date().getFullYear() + 10,
} as const;

/**
 * Pagination constants
 */
export const PAGINATION_CONSTANTS = {
  /** Default items per page */
  DEFAULT_PER_PAGE: 15,
  /** Maximum items per page */
  MAX_PER_PAGE: 100,
  /** Available page size options */
  PAGE_SIZE_OPTIONS: [10, 15, 25, 50, 100],
} as const;

/**
 * Date format constants
 */
export const DATE_CONSTANTS = {
  /** Default date format for display */
  DISPLAY_FORMAT: 'MM/DD/YYYY',
  /** Date format for API requests */
  API_FORMAT: 'YYYY-MM-DD',
  /** Date format for file names */
  FILENAME_FORMAT: 'YYYY-MM-DD_HH-mm-ss',
  /** Default locale for date formatting */
  DEFAULT_LOCALE: 'en-US',
} as const;

/**
 * Currency constants
 */
export const CURRENCY_CONSTANTS = {
  /** Default currency code */
  DEFAULT_CURRENCY: 'KZT',
  /** Default locale for currency formatting */
  DEFAULT_LOCALE: 'en-US',
  /** Minimum payment amount */
  MIN_PAYMENT_AMOUNT: 0,
  /** Maximum payment amount */
  MAX_PAYMENT_AMOUNT: 999999.99,
} as const;

/**
 * Phone number constants
 */
export const PHONE_CONSTANTS = {
  /** Default country code */
  DEFAULT_COUNTRY_CODE: '+7',
  /** Minimum phone number length */
  MIN_PHONE_LENGTH: 10,
  /** Maximum phone number length */
  MAX_PHONE_LENGTH: 15,
  /** Maximum number of phone numbers per user */
  MAX_PHONE_NUMBERS: 3,
} as const;

/**
 * Room and bed constants
 */
export const ROOM_CONSTANTS = {
  /** Maximum room capacity */
  MAX_ROOM_CAPACITY: 8,
  /** Minimum room capacity */
  MIN_ROOM_CAPACITY: 1,
  /** Default room capacity */
  DEFAULT_ROOM_CAPACITY: 2,
  /** Maximum bed number in a room */
  MAX_BED_NUMBER: 8,
  /** Minimum bed number in a room */
  MIN_BED_NUMBER: 1,
} as const;

/**
 * User status constants
 */
export const USER_STATUS = {
  /** Active user status */
  ACTIVE: 'active',
  /** Pending user status */
  PENDING: 'pending',
  /** Rejected user status */
  REJECTED: 'rejected',
  /** Suspended user status */
  SUSPENDED: 'suspended',
} as const;

/**
 * User role constants
 */
export const USER_ROLES = {
  /** Admin role */
  ADMIN: 'admin',
  /** Student role */
  STUDENT: 'student',
  /** Guest role */
  GUEST: 'guest',
  /** Super admin role */
  SUPER_ADMIN: 'sudo',
} as const;

/**
 * Payment status constants
 */
export const PAYMENT_STATUS = {
  /** Pending payment */
  PENDING: 'pending',
  /** Paid payment */
  PAID: 'paid',
  /** Overdue payment */
  OVERDUE: 'overdue',
  /** Cancelled payment */
  CANCELLED: 'cancelled',
} as const;

/**
 * Message type constants
 */
export const MESSAGE_TYPES = {
  /** General message */
  GENERAL: 'general',
  /** Announcement message */
  ANNOUNCEMENT: 'announcement',
  /** Violation message */
  VIOLATION: 'violation',
  /** Emergency message */
  EMERGENCY: 'emergency',
  /** Urgent message */
  URGENT: 'urgent',
} as const;

/**
 * Message status constants
 */
export const MESSAGE_STATUS = {
  /** Draft message */
  DRAFT: 'draft',
  /** Sent message */
  SENT: 'sent',
  /** Read message */
  READ: 'read',
} as const;

/**
 * Gender constants
 */
export const GENDER = {
  /** Male gender */
  MALE: 'male',
  /** Female gender */
  FEMALE: 'female',
} as const;

/**
 * Blood type constants
 */
export const BLOOD_TYPES = {
  /** A positive */
  A_POSITIVE: 'A+',
  /** A negative */
  A_NEGATIVE: 'A-',
  /** B positive */
  B_POSITIVE: 'B+',
  /** B negative */
  B_NEGATIVE: 'B-',
  /** AB positive */
  AB_POSITIVE: 'AB+',
  /** AB negative */
  AB_NEGATIVE: 'AB-',
  /** O positive */
  O_POSITIVE: 'O+',
  /** O negative */
  O_NEGATIVE: 'O-',
} as const;

/**
 * Semester constants
 */
export const SEMESTERS = {
  /** Fall semester */
  FALL: 'fall',
  /** Spring semester */
  SPRING: 'spring',
  /** Summer semester */
  SUMMER: 'summer',
} as const;

/**
 * API response constants
 */
export const API_CONSTANTS = {
  /** Success status code */
  SUCCESS_CODE: 200,
  /** Created status code */
  CREATED_CODE: 201,
  /** Bad request status code */
  BAD_REQUEST_CODE: 400,
  /** Unauthorized status code */
  UNAUTHORIZED_CODE: 401,
  /** Forbidden status code */
  FORBIDDEN_CODE: 403,
  /** Not found status code */
  NOT_FOUND_CODE: 404,
  /** Unprocessable entity status code */
  UNPROCESSABLE_CODE: 422,
  /** Internal server error status code */
  SERVER_ERROR_CODE: 500,
} as const;

/**
 * Localization constants
 */
export const LOCALE_CONSTANTS = {
  /** English locale */
  ENGLISH: 'en',
  /** Kazakh locale */
  KAZAKH: 'kk',
  /** Russian locale */
  RUSSIAN: 'ru',
  /** Default locale */
  DEFAULT: 'en',
  /** Available locales */
  AVAILABLE: ['en', 'kk', 'ru'],
} as const;

/**
 * Theme constants
 */
export const THEME_CONSTANTS = {
  /** Light theme */
  LIGHT: 'light',
  /** Dark theme */
  DARK: 'dark',
  /** System theme */
  SYSTEM: 'system',
} as const;

/**
 * Export format constants
 */
export const EXPORT_CONSTANTS = {
  /** Excel export format */
  EXCEL: 'xlsx',
  /** CSV export format */
  CSV: 'csv',
  /** PDF export format */
  PDF: 'pdf',
} as const;

/**
 * Timeout constants
 */
export const TIMEOUT_CONSTANTS = {
  /** Default API timeout in milliseconds */
  API_TIMEOUT: 30000,
  /** Default form submission timeout in milliseconds */
  FORM_TIMEOUT: 15000,
  /** Default toast display time in milliseconds */
  TOAST_TIMEOUT: 5000,
  /** Default loading timeout in milliseconds */
  LOADING_TIMEOUT: 10000,
} as const;

/**
 * Storage constants
 */
export const STORAGE_CONSTANTS = {
  /** Auth token storage key */
  AUTH_TOKEN_KEY: 'auth_token',
  /** User data storage key */
  USER_DATA_KEY: 'user_data',
  /** Theme storage key */
  THEME_KEY: 'theme',
  /** Locale storage key */
  LOCALE_KEY: 'locale',
  /** Sidebar collapsed state key */
  SIDEBAR_COLLAPSED_KEY: 'sidebar_collapsed',
} as const;

/**
 * Route constants
 */
export const ROUTE_CONSTANTS = {
  /** Login route */
  LOGIN: '/',
  /** Main dashboard route */
  MAIN: '/main',
  /** Students route */
  STUDENTS: '/students',
  /** Guests route */
  GUESTS: '/guests',
  /** Payments route */
  PAYMENTS: '/payments',
  /** Messages route */
  MESSAGES: '/messages',
  /** Settings route */
  SETTINGS: '/settings',
  /** Profile route */
  PROFILE: '/profile',
} as const;

/**
 * Error message constants
 */
export const ERROR_MESSAGES = {
  /** Generic error message */
  GENERIC: 'An error occurred. Please try again.',
  /** Network error message */
  NETWORK: 'Network error. Please check your connection.',
  /** Validation error message */
  VALIDATION: 'Please check your input and try again.',
  /** Authentication error message */
  AUTHENTICATION: 'Authentication failed. Please login again.',
  /** Authorization error message */
  AUTHORIZATION: 'You do not have permission to perform this action.',
  /** Not found error message */
  NOT_FOUND: 'The requested resource was not found.',
  /** Server error message */
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

/**
 * Success message constants
 */
export const SUCCESS_MESSAGES = {
  /** Generic success message */
  GENERIC: 'Operation completed successfully.',
  /** Created success message */
  CREATED: 'Item created successfully.',
  /** Updated success message */
  UPDATED: 'Item updated successfully.',
  /** Deleted success message */
  DELETED: 'Item deleted successfully.',
  /** Saved success message */
  SAVED: 'Changes saved successfully.',
  /** Login success message */
  LOGIN: 'Login successful.',
  /** Logout success message */
  LOGOUT: 'Logout successful.',
  /** Registration success message */
  REGISTRATION: 'Registration successful.',
} as const; 