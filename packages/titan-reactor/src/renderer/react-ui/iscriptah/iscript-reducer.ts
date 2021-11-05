import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  unit: null,
  initializeBlock: false,
  block: null,
  frame: null,
  flipFrame: false,
  baseFrame: null,
  blockFrameCount: 0,
  image: null,
  sprite: null,
};

export const blockInitializing = createAsyncThunk(
  "iscript/blockInitializing",
  async (loader) => {
    try {
      await loader();
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
    return true;
  }
);

const resetFrame = (state) => {
  state.frame = null;
  state.baseFrame = null;
};
const disableAll = (state) => {
  resetFrame(state);
  state.image = null;
  state.sprite = null;
  state.unit = null;
};

const iscriptReducer = createSlice({
  name: "iscript",
  initialState,
  reducers: {
    blockSelected: {
      reducer: (state, action) => {
        resetFrame(state);
        state.block = action.payload;
      },
      prepare: (image, offset, header) => ({
        payload: { image, offset, header },
      }),
    },
    unitSelected: (state, action) => {
      disableAll(state);
      state.unit = action.payload;
    },
    spriteSelected: (state, action) => {
      disableAll(state);
      state.sprite = action.payload;
    },
    imageSelected: (state, action) => {
      disableAll(state);
      state.image = action.payload;
    },
    frameSelected: (state, action) => {
      const frame =
        action.payload === null
          ? null
          : Math.max(0, Math.min(state.blockFrameCount, action.payload));
      state.frame = frame;
    },
    flipFrameChanged: (state, action) => {
      state.flipFrame = action.payload;
    },
    blockFrameCountChanged: (state, action) => {
      state.blockFrameCount = action.payload;
    },
    baseFrameSelected: {
      reducer: (state, action) => {
        const frame =
          action.payload.frame === null
            ? null
            : Math.max(
                0,
                Math.min(state.blockFrameCount, action.payload.frame)
              );
        state.baseFrame = frame;
        state.frame = frame;
        state.flipFrame =
          action.payload.flipFrame === null
            ? state.flipFrame
            : action.payload.flipFrame;
        state.useCommandListFrames = action.payload.useCommandListFrames;
      },
      prepare: (frame, flipFrame = null, useCommandListFrames = false) => ({
        payload: { frame, flipFrame, useCommandListFrames },
      }),
    },
  },
  extraReducers: {
    [blockInitializing.pending]: (state) => {
      state.initializeBlock = false;
    },
    [blockInitializing.fulfilled]: (state) => {
      state.initializeBlock = true;
    },
  },
});

export const {
  blockSelected,
  unitSelected,
  spriteSelected,
  imageSelected,
  frameSelected,
  baseFrameSelected,
  blockFrameCountChanged,
  flipFrameChanged,
} = iscriptReducer.actions;

export default iscriptReducer.reducer;
