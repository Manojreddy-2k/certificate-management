import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import orderReducer from "./slices/orderSlice";
import sessionReducer from "./slices/sessionSlice";
import { sessionEnded } from "./sessionActions";

const appReducer = combineReducers({
  auth: authReducer,
  order: orderReducer,
  session: sessionReducer
});

const rootReducer = (state, action) => {
  if (action.type === sessionEnded.type) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export default rootReducer;
