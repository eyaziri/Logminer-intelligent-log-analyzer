// app/api/auth/handle/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    // Pas de code reçu : rediriger vers login avec erreur explicite
    return NextResponse.redirect(new URL("/login?error=no_code", req.url));
  }

  const params = new URLSearchParams();
  params.append("client_id", process.env.NEXT_PUBLIC_CLIENT_ID!);
  params.append("scope", process.env.NEXT_PUBLIC_SCOPE!);
  params.append("code", code);
  params.append("redirect_uri", process.env.NEXT_PUBLIC_REDIRECT_URI!);
  params.append("grant_type", "authorization_code");
  params.append("client_secret", process.env.NEXT_PUBLIC_CLIENT_SECRET!);

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_TOKEN_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await response.json();
    console.log("Réponse token Azure:", data);

    if (!data.access_token) {
      // Pas de token dans la réponse : rediriger vers login avec erreur
      return NextResponse.redirect(new URL("/login?error=token_error", req.url));
    }

    // Redirection vers la page login avec le token dans l'URL
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("token", data.access_token);

    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("Erreur dans API OAuth:", err);
    // Rediriger vers login avec une erreur serveur
    return NextResponse.redirect(new URL("/login?error=server", req.url));
  }
}
