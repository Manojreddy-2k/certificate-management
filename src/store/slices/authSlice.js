import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  loginMethod: null,
  user: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.isAuthenticated = true;
      state.loginMethod = action.payload.loginMethod;
      state.user = action.payload.user;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.loginMethod = null;
      state.user = null;
    }
  }
});

export const { loginSuccess, logout } = authSlice.actions;
export const authInitialState = initialState;
export default authSlice.reducer;
