import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { range } from "ramda";
import { getSettings } from "../../invoke";

export const getRemoteSettings = createAsyncThunk(
  "settings/getRemote",
  async () => {
    const settings = await getSettings();
    return settings;
  }
);

const initialState = {
  showMenu: false,
  selectedUnits: [],
  showProduction: 0,
  showReplayControls: true,
  showUnitSelection: true,
  showFps: true,
  showFogOfWar: true,
  playerVision: range(0, 8).map(() => true),
  data: {},
};

const makeToggle = (prop) => (state, action) => {
  if (action.payload !== undefined) {
    state[prop] = action.payload;
    return;
  }
  state[prop] = !state[prop];
};

const replayHudReducer = createSlice({
  name: "hud",
  initialState,
  reducers: {
    toggleMenu: makeToggle("showMenu"),
    toggleProduction: (state, action) => {
      return {
        ...state,
        showProduction: action.payload,
      };
    },
    toggleReplayControls: makeToggle("showReplayControls"),
    toggleUnitSelection: makeToggle("showUnitSelection"),
    toggleFps: makeToggle("showFps"),
    toggleFogOfWar: makeToggle("showFogOfWar"),
    togglePlayerVision: (state, action) => {
      state.playerVision[action.payload] = !state.playerVision[action.payload];
    },
  },
});

export const {
  toggleMenu,
  toggleProduction,
  toggleReplayControls,
  toggleUnitSelection,
  toggleFps,
  toggleFogOfWar,
  togglePlayerVision,
} = replayHudReducer.actions;
export default replayHudReducer.reducer;
