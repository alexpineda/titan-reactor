import { combineReducers } from "@reduxjs/toolkit";

import replayHudReducer from "./replayHudReducer";
import replayControlReducer from "./replayPositionReducer";
import cameraReducer from "../../camera/cameraReducer";
import inputReducer from "../../input/inputReducer";

export default combineReducers({
  hud: replayHudReducer,
  position: replayControlReducer,
  camera: cameraReducer,
  input: inputReducer,
});
