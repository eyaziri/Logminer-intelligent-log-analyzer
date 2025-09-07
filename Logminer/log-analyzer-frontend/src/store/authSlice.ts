// store/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { extractEmailFromAzureToken } from "@/utils/decodeAzureToken";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  email: string | null;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  email: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      const token = action.payload;
      const email = extractEmailFromAzureToken(token);

      console.log("✅ Token set in Redux:", token);
      console.log("📧 Email extrait du token :", email);

      state.token = token;
      state.email = email;
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      const refreshToken = action.payload;
      console.log("🔁 Refresh token set in Redux:", refreshToken);
      state.refreshToken = refreshToken;
    },
    clearAuth: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.email = null;
    },
  },
});

export const { setToken, setRefreshToken, clearAuth } = authSlice.actions;

export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectEmail = (state: { auth: AuthState }) => state.auth.email;

export default authSlice.reducer;