"use client";

import React, { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import {
  selectToken,
  selectRefreshToken,
  setToken,
  clearAuth,
} from "@/store/authSlice";
import { refreshAzureToken } from "@/utils/refreshAzureToken";
import { getTokenExpirationMs } from "@/utils/getTokenExpiration";

const REFRESH_MARGIN_MS = 1000 * 60 * 1;
const FALLBACK_INTERVAL_MS = 1000 * 60 * 60 * 1;

function TokenRefresher() {
  const dispatch = useDispatch();
  const accessToken = useSelector(selectToken);
  const refreshToken = useSelector(selectRefreshToken);

  // 🔁 Smart refresh based on exp claim
  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    const expiresAt = getTokenExpirationMs(accessToken);
    const refreshAt = expiresAt - REFRESH_MARGIN_MS;
    const delay = Math.max(refreshAt - Date.now(), 0);

    const timeoutId = setTimeout(async () => {
      const newToken = await refreshAzureToken(refreshToken);
      if (newToken) {
        dispatch(setToken(newToken));
        localStorage.setItem("access_token", newToken);
      } else {
        dispatch(clearAuth());
        localStorage.clear();
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [accessToken, refreshToken, dispatch]);

  // 🕒 Fallback: every 5 minutes
  useEffect(() => {
    if (!refreshToken) return;

    const intervalId = setInterval(async () => {
      const newToken = await refreshAzureToken(refreshToken);
      if (newToken) {
        dispatch(setToken(newToken));
        localStorage.setItem("access_token", newToken);
      } else {
        dispatch(clearAuth());
        localStorage.clear();
      }
    }, FALLBACK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [refreshToken, dispatch]);

  return null;

}

// 🧠 Fixes context for hooks
function InitWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TokenRefresher />
      {children}
    </>
  );
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <InitWrapper>{children}</InitWrapper>
      </PersistGate>
    </Provider>
  );
}
