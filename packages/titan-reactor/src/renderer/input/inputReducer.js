import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  hoveringOverMinimap: false,
};

const inputReducer = createSlice({
  name: "input",
  initialState,
  reducers: {
    hoveringOverMinimap: (state, action) => {
      state.hoveringOverMinimap = action.payload;
    },
  },
});

export const { hoveringOverMinimap } = inputReducer.actions;
export default inputReducer.reducer;
