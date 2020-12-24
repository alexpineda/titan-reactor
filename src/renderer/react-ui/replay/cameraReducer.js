import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cinematic: false,
  pointerLock: false,
  fpsMode: false,
  followUnit: null,
  hoveringOverMinimap: false,
  activePreview: false,
  bookmarks: {},
  playerPov: {},
  playerActions: {},
};

const cameraReducer = createSlice({
  name: "camera",
  initialState,
  reducers: {
    togglePlayerPov: {
      reducer: (state, action) => {
        const playerPov = state.playerPov[action.payload.player];
        if (playerPov) {
          const enabled =
            action.payload.enabled !== undefined
              ? action.payload.enabled
              : !playerPov.enabled;
          playerPov.enabled = enabled;
        } else {
          state.playerPov[action.payload.player] = {
            enabled:
              action.payload.enabled !== undefined
                ? action.payload.enabled
                : true,
          };
        }
      },
      prepare: (player, enabled) => ({ payload: { player, enabled } }),
    },
    cinematic: (state, action) => {
      state.cinematic = action.payload;
    },
    hoveringOverMinimap: (state, action) => {
      state.hoveringOverMinimap = action.payload;
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
  togglePlayerPov,
  cinematic,
  hoveringOverMinimap,
  setBookmark,
  deleteBookmark,
} = cameraReducer.actions;
export default cameraReducer.reducer;
