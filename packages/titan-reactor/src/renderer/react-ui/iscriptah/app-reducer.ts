import { createSlice } from "@reduxjs/toolkit";
import { gameSpeeds } from "../../../common/utils/conversions";

const initialState = {
  criticalError: false,
  error: null,
  gameTick: 0,
  autoUpdate: true,
  gamespeed: gameSpeeds.fastest,
  unitImageTab: "units",
  renderMode: "3d",
  cameraDirection: 0,
  exposure: 2.2,
  transform: "",
  transformEnabled: {
    x: true,
    y: true,
    z: true,
  },
};

const appReducer = createSlice({
  name: "app",
  initialState,
  reducers: {
    criticalErrorOccurred: (state) => {
      state.criticalError = true;
    },
    onGameTick: (state) => {
      state.gameTick = state.gameTick + 1;
    },
    autoUpdateChanged: (state, action) => {
      state.autoUpdate = action.payload;
    },
    gamespeedChanged: (state, action) => {
      state.gamespeed = action.payload;
    },
    unitImageTabChanged: (state, action) => {
      state.unitImageTab = action.payload;
    },
    renderModeChanged: (state, action) => {
      state.renderMode = action.payload;
    },
    cameraDirectionChanged: (state, action) => {
      state.cameraDirection = action.payload;
    },
    exposureChanged: (state, action) => {
      state.exposure = action.payload;
    },
    transformChanged: (state, action) => {
      state.transform = action.payload;
    },
    transformEnabledX: (state, action) => {
      state.transformEnabled.x = action.payload;
    },
    transformEnabledY: (state, action) => {
      state.transformEnabled.y = action.payload;
    },
    transformEnabledZ: (state, action) => {
      state.transformEnabled.z = action.payload;
    },
  },
});

export const {
  criticalErrorOccurred,
  onGameTick,
  autoUpdateChanged,
  gamespeedChanged,
  unitImageTabChanged,
  renderModeChanged,
  cameraDirectionChanged,
  exposureChanged,
  transformChanged,
  transformEnabledX,
  transformEnabledY,
  transformEnabledZ,
} = appReducer.actions;

export default appReducer.reducer;
