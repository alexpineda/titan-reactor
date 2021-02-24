import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  hoveringOverMinimap: false,
  revealEntireMap: false,
};

const inputReducer = createSlice({
  name: "input",
  initialState,
  reducers: {
    hoveringOverMinimap: (state, action) => {
      state.hoveringOverMinimap = action.payload;
    },
    revealEntireMap: (state, action) => {
      state.revealEntireMap = action.payload;
    },
  },
});

export const { hoveringOverMinimap, revealEntireMap } = inputReducer.actions;
export default inputReducer.reducer;
