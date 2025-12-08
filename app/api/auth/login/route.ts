import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { message: data.error?.message || "Login failed" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ user: {...data.user, id: null, documenId: null} });

  response.cookies.set("jwt", data.jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
