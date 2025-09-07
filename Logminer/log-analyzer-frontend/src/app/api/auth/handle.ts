// src/pages/api/auth/handle.ts

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;

  if (!code) return res.status(400).send("Code is missing");

  const params = new URLSearchParams();
  params.append("client_id", process.env.NEXT_PUBLIC_CLIENT_ID!);
  params.append("scope", process.env.NEXT_PUBLIC_SCOPES!);
  params.append("code", code);
  params.append("redirect_uri", process.env.NEXT_PUBLIC_REDIRECT_URI!);
  params.append("grant_type", "authorization_code");
  params.append("client_secret", process.env.NEXT_PUBLIC_CLIENT_SECRET!);

  const tokenRes = await fetch(process.env.NEXT_PUBLIC_TOKEN_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await tokenRes.json();

  if (!tokenRes.ok) {
    console.error("Token exchange failed:", data);
    return res.redirect("/login?error=token_exchange_failed");
  }

  const { access_token, refresh_token } = data;

  // ⚠️ Tu peux stocker les deux dans des cookies HTTPOnly si tu veux plus de sécurité
  const redirectUrl = new URL("/(auth)/login", req.headers.origin);
  redirectUrl.searchParams.set("token", access_token);
  redirectUrl.searchParams.set("refresh", refresh_token);

  res.redirect(redirectUrl.toString());
}
