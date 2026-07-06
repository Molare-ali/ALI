import { NextResponse } from "next/server";

export function getErrorMessage(error: unknown, fallback = "Something went wrong.") {
  return error instanceof Error ? error.message : fallback;
}

export function errorResponse(error: unknown, status = 500, fallback = "Something went wrong.") {
  return NextResponse.json({ error: getErrorMessage(error, fallback) }, { status });
}
