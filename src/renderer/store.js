import { ipcRenderer } from "electron";
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers, compose } from "redux";
import cameraReducer from "./camera/cameraReducer";
import { SETTINGS_CHANGED } from "common/handleNames";
import settingsReducer, { setAll } from "./utils/settingsReducer";
import titanReactorReducer from "./titanReactorReducer";

const store = configureStore({
  reducer: combineReducers({
    titan: titanReactorReducer,
    camera: cameraReducer,
    settings: settingsReducer,
  }),
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware();
  },
});

ipcRenderer.on(SETTINGS_CHANGED, async (event, settings) => {
  store.dispatch(setAll(settings));
});

export default store;
