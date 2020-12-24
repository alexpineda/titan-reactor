import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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
  hideProduction: false,
  hideResources: false,
  hideMinimap: false,
  hideReplayPosition: false,
  hideUnitSelection: false,
  data: {},
};

const replayHudReducer = createSlice({
  name: "hud",
  initialState,
  reducers: {
    toggleMenu: (state, action) => {
      if (action.payload !== undefined) {
        state.showMenu = action.payload;
      }
      state.showMenu = !state.showMenu;
    },
  },
});

export const { toggleMenu } = replayHudReducer.actions;
export default replayHudReducer.reducer;
