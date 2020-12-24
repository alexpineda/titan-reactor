import {
  createAsyncThunk,
  createSlice,
  combineReducers,
} from "@reduxjs/toolkit";

// export const setRemoteSettings = createAsyncThunk(
//   "settings/setRemote",
//   async (newSettings, { dispatch }) => {
//     dispatch(replayReducer.actions.setSettingsData(newSettings));
//     await saveSettings(newSettings);
//     const settings = await getSettings();
//     return settings;
//   }
// );

const initialState = {
  paused: false,
};

const replayPositionReducer = createSlice({
  name: "replay",
  initialState,
  reducers: {
    togglePaused: (state) => {
      state.showMenu = !state.showMenu;
    },
  },
});

export const { togglePaused } = replayPositionReducer.actions;
export default replayPositionReducer.reducer;
