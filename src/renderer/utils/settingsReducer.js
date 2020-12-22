import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getSettings, saveSettings } from "../invoke";

export const getRemoteSettings = createAsyncThunk(
  "settings/getRemote",
  async (_, thunkAPI) => {
    const settings = await getSettings();
    thunkAPI.dispatch(setSettings(settings));
    return settings;
  }
);

export const setRemoteSettings = createAsyncThunk(
  "settings/setRemote",
  async (settings, thunkAPI) => {
    saveSettings(settings);
    thunkAPI.dispatch(setSettings(settings));
    return settings;
  }
);

const initialState = {
  data: {},
  lang: {},
  diff: {},
};

const settingsReducer = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings: (state, action) => {
      state.data = action.payload;
    },
    setAll: {
      reducer: (state, action) => action.payload,
      prepare: (data, diff, lang) => ({ payload: { data, diff, lang } }),
    },
  },
});

export const { setSettings, setAll } = settingsReducer.actions;
export default settingsReducer.reducer;
