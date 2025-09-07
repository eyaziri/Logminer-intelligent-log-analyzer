// src/utils/getTokenExpiration.ts
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  exp: number; // expiration time in seconds
}

// Returns the expiration time of a JWT in milliseconds.

export function getTokenExpirationMs(token: string): number {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp * 1000;
  } catch (e) {
    console.error("Error decoding token expiration:", e);
    return 0;
  }
}