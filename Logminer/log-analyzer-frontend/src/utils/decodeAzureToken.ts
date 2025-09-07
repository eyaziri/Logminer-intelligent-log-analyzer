import { jwtDecode } from "jwt-decode";

interface AzureTokenPayload {
  preferred_username?: string;
  email?: string;
  upn?: string;
}

export function extractEmailFromAzureToken(token: string): string | null {
  try {
    const decoded = jwtDecode<AzureTokenPayload>(token);
    return decoded.preferred_username || decoded.email || decoded.upn || null;
  } catch (error) {
    console.error("Error decoding Azure token:", error);
    return null;
  }
}
