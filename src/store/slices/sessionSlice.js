import { createSlice } from "@reduxjs/toolkit";

const DEFAULT_IDLE_TIMEOUT_MS = 15 * 60 * 1000;

const initialState = {
  active: false,
  expiresAt: null,
  lastActivityAt: null,
  idleTimeoutMs: DEFAULT_IDLE_TIMEOUT_MS,
  statusMessage: ""
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    startSession(state, action) {
      const now = Date.now();
      const ttl = action.payload?.sessionDurationMs ?? DEFAULT_IDLE_TIMEOUT_MS;
      state.active = true;
      state.idleTimeoutMs = ttl;
      state.lastActivityAt = now;
      state.expiresAt = now + ttl;
      state.statusMessage = "";
    },
    touchActivity(state) {
      if (!state.active) {
        return;
      }

      const now = Date.now();
      state.lastActivityAt = now;
      state.expiresAt = now + state.idleTimeoutMs;
    },
    expireSession(state, action) {
      state.active = false;
      state.statusMessage = action.payload?.message ?? "Session expired. Please sign in again.";
      state.expiresAt = null;
      state.lastActivityAt = null;
    },
    clearSession(state) {
      state.active = false;
      state.expiresAt = null;
      state.lastActivityAt = null;
      state.statusMessage = "";
    },
    setSessionMessage(state, action) {
      state.statusMessage = action.payload;
    }
  }
});

export const { startSession, touchActivity, expireSession, clearSession, setSessionMessage } = sessionSlice.actions;
export const sessionInitialState = initialState;
export default sessionSlice.reducer;
