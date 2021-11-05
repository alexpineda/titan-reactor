import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import appReducer from "./app-reducer";
import iscriptReducer from "./iscript-reducer";

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
