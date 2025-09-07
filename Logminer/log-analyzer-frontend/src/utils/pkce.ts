// src/utils/pkce.ts

/**
 * Génère un code_verifier aléatoire (entre 43 et 128 caractères).
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(128);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Calcule le code_challenge = base64UrlEncode( SHA256(code_verifier) ).
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

/** 
 * Encodage base64 URL-safe sans padding.
 */
function base64UrlEncode(buffer: Uint8Array): string {
  // 1) base64 standard
  // eslint-disable-next-line prefer-const
  let b64 = btoa(String.fromCharCode(...Array.from(buffer)));
  // 2) rendre URL-safe
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
