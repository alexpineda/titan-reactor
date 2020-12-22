import { ipcRenderer } from "electron";
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import cameraReducer from "./camera/cameraReducer";
import { SETTINGS_CHANGED } from "common/handleNames";
import settingsReducer, { setAll } from "./utils/settingsReducer";

const store = configureStore({
  reducer: combineReducers({
    camera: cameraReducer,
    settings: settingsReducer,
  }),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

ipcRenderer.on(SETTINGS_CHANGED, async (event, { diff, settings }) => {
  const lang = await import(`common/lang/${settings.language}`);
  store.dispatch(setAll(settings, diff, lang));
});

export default store;
