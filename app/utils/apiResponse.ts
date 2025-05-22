import { NextResponse } from "next/server";

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

export function createErrorResponse(
  message: string,
  status: number,
  code?: string,
  details?: any,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error: { message, code, details } },
    { status },
  );
}

export interface ApiSuccessResponse<T> {
  success: true;
  data?: T;
  message?: string;
}

export function createSuccessResponse<T>(
  data?: T,
  status: number = 200,
  message?: string,
): NextResponse<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = { success: true };
  if (data !== undefined) body.data = data; // Ensure data can be null or false, but not undefined if not provided
  if (message) body.message = message;
  return NextResponse.json(body, { status });
}
