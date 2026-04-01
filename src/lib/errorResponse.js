/**
 * DEPRECATED: Use apiResponse.js instead
 * This file is kept for backwards compatibility only
 */

export function createErrorResponse(errorCode, customMessage = null) {
  console.warn("DEPRECATED: createErrorResponse from errorResponse.js - use apiResponse.js instead");
  return { success: false, error: customMessage || "Error", status: 500 };
}

export function createSuccessResponse(data, message = "Success") {
  console.warn("DEPRECATED: createSuccessResponse from errorResponse.js - use apiResponse.js instead");
  return { success: true, message, data, status: 200 };
}

export function handleApiError(error, context = "") {
  console.warn("DEPRECATED: handleApiError from errorResponse.js - use apiResponse.js instead");
  return { success: false, error: "Error", status: 500 };
}

