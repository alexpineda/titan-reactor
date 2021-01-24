import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import appReducer from "./appReducer";
import iscriptReducer from "./iscriptReducer";

const store = configureStore({
  reducer: combineReducers({
    app: appReducer,
    iscript: iscriptReducer,
  }),
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware();
  },
});

export default store;
