// src/utils/refreshAzureToken.ts

export async function refreshAzureToken(refreshToken: string): Promise<string | null> {
  const params = new URLSearchParams();
  params.append("client_id", process.env.NEXT_PUBLIC_CLIENT_ID!);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);
  // Si tu l’avais mis, tu peux aussi renvoyer redirect_uri :
  // params.append("redirect_uri", process.env.NEXT_PUBLIC_REDIRECT_URI!);
  params.append("scope", process.env.NEXT_PUBLIC_SCOPES!);

  const res = await fetch(process.env.NEXT_PUBLIC_TOKEN_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json();
  if (res.ok) {
    // Mets à jour localStorage
    localStorage.setItem("access_token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }
    return data.access_token;
  } else {
    console.error("Failed to refresh token", data);
    return null;
  }
}
