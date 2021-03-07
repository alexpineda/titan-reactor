import { ipcRenderer } from "electron";
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { SETTINGS_CHANGED } from "common/handleNames";
import settingsReducer, { setAll } from "./utils/settingsReducer";
import titanReactorReducer from "./titanReactorReducer";
import replayReducer from "./react-ui/game/replayReducer";

const store = configureStore({
  reducer: combineReducers({
    titan: titanReactorReducer,
    settings: settingsReducer,
    replay: replayReducer,
  }),
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware();
  },
});

ipcRenderer.on(SETTINGS_CHANGED, async (event, settings) => {
  store.dispatch(setAll(settings));
});

export default store;
