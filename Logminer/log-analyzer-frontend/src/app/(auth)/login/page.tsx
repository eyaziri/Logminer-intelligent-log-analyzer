"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken, clearAuth, setRefreshToken } from "@/store/authSlice";
import { setUser } from "@/store/userSlice";
import { extractEmailFromAzureToken } from "@/utils/decodeAzureToken";
import { User } from "@/types/User";
import { generateCodeChallenge, generateCodeVerifier } from "@/utils/pkce";


export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hovered, setHovered] = useState(false);

    // 1) Si on revient d'Azure avec un `code`, on échange ici
  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError("Erreur lors de la connexion Azure.");
      return;
    }
    if (!code) return;

    (async () => {
      try {
        // Récupère le verifier stocké avant le redirect
        const codeVerifier = sessionStorage.getItem("pkce_verifier");
        if (!codeVerifier) throw new Error("Pas de PKCE verifier en session.");

        // Prépare l'échange token
        const params = new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID!,
          grant_type: "authorization_code",
          code,
          redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
          code_verifier: codeVerifier,
        });

        const res = await fetch(process.env.NEXT_PUBLIC_TOKEN_URL!, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        });
        const data = await res.json();
        if (!res.ok) throw data;

        // Stocke tokens
        dispatch(setToken(data.access_token));
        dispatch(setRefreshToken(data.refresh_token));
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);

        // Récupère l’utilisateur et redirige
        const email = extractEmailFromAzureToken(data.access_token);
        console.log("Email =", email);
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        if (!userRes.ok) throw new Error("Utilisateur non enregistré");
        const user: User = await userRes.json();
        dispatch(setUser(user));
        router.push("/profile");
      } catch (e) {
        console.error(e);
        dispatch(clearAuth());
        setError("Échec de l'authentification.");
      }
    })();
  }, [dispatch, router, searchParams]);

  // 2) Au clic, on génère PKCE puis on redirige vers Azure
  const handleLogin = async () => {
    try {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      sessionStorage.setItem("pkce_verifier", verifier);

      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID!,
        response_type: "code",
        redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
        response_mode: "query",
        scope: process.env.NEXT_PUBLIC_SCOPES!,
        code_challenge: challenge,
        code_challenge_method: "S256",
        state: "1234", // ou un vrai random pour CSRF
      });

      window.location.href = `${process.env.NEXT_PUBLIC_AUTH_URL}?${params}`;
    } catch {
      setError("Impossible de démarrer l'authentification.");
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div style={{ ...styles.page, ...(isDarkMode ? styles.pageDark : {}) }}>
      
      <div style={styles.logoWrapper}>
        <Image src="/images/logo.png" alt="Logo" width={140} height={80} />
      </div>

      <div style={{ ...styles.card, ...(isDarkMode ? styles.cardDark : {}) }}>
        <Image
          src="/images/outlook.png"
          alt="Outlook"
          width={60}
          height={60}
          style={{ marginBottom: 20, marginLeft: 120 }}
        />
        <h2 style={{ ...styles.title, ...(isDarkMode ? styles.titleDark : {}) }}>
          Connexion Outlook
        </h2>
        <p style={{ ...styles.text, ...(isDarkMode ? styles.textDark : {}) }}>
          Connectez-vous avec votre compte Microsoft
        </p>
        <button
          style={{
            ...styles.button,
            ...(isDarkMode ? styles.buttonDark : {}),
            ...(hovered ? (isDarkMode ? styles.buttonHoverDark : styles.buttonHover) : {}),
          }}
          onClick={handleLogin}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          Se connecter avec Outlook
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </div>

      <button
        onClick={toggleDarkMode}
        style={{
          position: "absolute",
          top: 20,
          right: 30,
          background: "transparent",
          borderColor: isDarkMode ? "white" : "#0078D4",
          color: isDarkMode ? "white" : "#0078D4",
          borderWidth: "1px",
          borderStyle: "solid",
          cursor: "pointer",
          padding: "6px 12px",
          borderRadius: 8,
          zIndex: 9999,
        }}
      >
        {isDarkMode ? "🌓 Mode clair" : "🌓 Mode sombre"}
      </button>
    </div>
  );
}


const styles: { [key: string]: React.CSSProperties } = {
  page: {
    position: "relative",
    height: "100vh",
    width: "100%",
    background: "linear-gradient(to right, #dfe9f3, #ffffff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#171717",
    transition: "background 0.5s, color 0.5s",
  },
  pageDark: {
    background: "linear-gradient(to right, #0a0a0a, #1a1a1a)",
    backgroundColor: "#0a0a0a",
    color: "#ededed",
  },
  logoWrapper: {
    position: "absolute",
    top: 20,
    left: 30,
  },
  card: {
    position: "relative",
    zIndex: 10,
    backdropFilter: "blur(12px)",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: 40,
    borderRadius: 20,
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    maxWidth: 400,
    width: "90%",
    transition: "background-color 0.5s, color 0.5s",
  },
  cardDark: {
    backgroundColor: "rgba(20, 20, 20, 0.6)",
    boxShadow: "0 8px 30px rgba(255, 255, 255, 0.1)",
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 10,
  },
  titleDark: {
    color: "#eee",
  },
  text: {
    fontSize: 14,
    color: "#444",
    marginBottom: 20,
  },
  textDark: {
    color: "#ccc",
  },
  button: {
    backgroundColor: "#0078D4",
    color: "#fff",
    padding: "12px 24px",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.3s",
  },
  buttonDark: {
    backgroundColor: "#0078D4",
  },
  buttonHover: {
    backgroundColor: "#005ea2",
  },
  buttonHoverDark: {
    backgroundColor: "#005a9e",
  },
  error: {
    marginTop: 16,
    color: "red",
    fontWeight: "bold",
    fontSize: 14,
  },
  bubblesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    overflow: "hidden",
    zIndex: 1,
  },
  bubble: {
    position: "absolute",
    bottom: "-150px",
    borderRadius: "50%",
    animationName: "floatUp",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  },
};