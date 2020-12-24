import { combineReducers } from "@reduxjs/toolkit";

import replayHudReducer from "./replayHudReducer";
import replayControlReducer from "./replayPositionReducer";
import cameraReducer from "./cameraReducer";

export default combineReducers({
  hud: replayHudReducer,
  position: replayControlReducer,
  camera: cameraReducer,
});
