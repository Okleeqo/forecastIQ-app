// netlify/functions/utils/response.ts

export interface ApiResponse {
  statusCode: number;
  headers: {
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Headers'?: string;
    'Content-Type': string;
  };
  body: string;
}

export function createCorsHeaders(includeAllowHeaders = false) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (includeAllowHeaders) {
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }

  return headers;
}

export function createResponse(statusCode: number, data: any): ApiResponse {
  return {
    statusCode,
    headers: createCorsHeaders(true),
    body: JSON.stringify(data)
  };
}

export function createErrorResponse(statusCode: number, message: string, error?: any): ApiResponse {
  return createResponse(statusCode, {
    error: message,
    details: error instanceof Error ? error.message : error
  });
}
