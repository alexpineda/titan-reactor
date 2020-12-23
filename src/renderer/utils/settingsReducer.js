import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getSettings, saveSettings } from "../invoke";

export const getRemoteSettings = createAsyncThunk(
  "settings/getRemote",
  async () => {
    const settings = await getSettings();
    return settings;
  }
);

export const setRemoteSettings = createAsyncThunk(
  "settings/setRemote",
  async (newSettings, { dispatch }) => {
    dispatch(settingsReducer.actions.setSettingsData(newSettings));
    await saveSettings(newSettings);
    const settings = await getSettings();
    return settings;
  }
);

const initialState = {
  data: {},
  phrases: {},
  diff: {},
  isDev: true,
  errors: [],
};

const settingsReducer = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettingsData: (state, action) => {
      state.data = action.payload;
    },
    setAll: (state, action) => {
      state = action.payload;
    },
    clearDiff: (state) => {
      state.diff = {};
    },
  },
  extraReducers: {
    [getRemoteSettings.fulfilled]: (state, action) => action.payload,
    [setRemoteSettings.fulfilled]: (state, action) => action.payload,
  },
});

export const { setSettingsData, setAll, clearDiff } = settingsReducer.actions;
export default settingsReducer.reducer;
