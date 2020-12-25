import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cinematic: false,
  pointerLock: false,
  fpsMode: false,
  followUnit: null,
  activePreview: false,
  bookmarks: {},
  activePovs: 0,
};

const cameraReducer = createSlice({
  name: "camera",
  initialState,
  reducers: {
    activePovsChanged: (state, action) => {
      state.activePovs = action.payload;
    },
    cinematic: (state, action) => {
      state.cinematic = action.payload;
    },

    setBookmark: {
      reducer: (state, action) => {
        const { frame, camera, note } = action.payload;
        let nearbyFrame;

        if (!state.bookmarks[frame]) {
          nearbyFrame = Object.keys(state.bookmarks).find(
            (i) => i >= frame - 420 || i <= frame + 420
          );
        }
        if (nearbyFrame !== undefined) {
          state.bookmarks[nearbyFrame] = { camera, note, frame: nearbyFrame };
        } else {
          state.bookmarks[frame] = { camera, note, frame };
        }
      },
      prepare: (frame, note, camera) => ({ payload: { frame, camera, note } }),
    },
    deleteBookmark: (state, action) => delete state.bookmarks[action.payload],
  },
});

export const {
  activePovsChanged,
  cinematic,
  setBookmark,
  deleteBookmark,
} = cameraReducer.actions;
export default cameraReducer.reducer;
