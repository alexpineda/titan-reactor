import { useRef, useEffect } from "react";
import {
  getDirectionalFrame as _getDirectionalFrame,
  areFrameSetsEnabled as _areFrameSetsEnabled,
} from "./framesets";

export default (cmds, selectedBlock, blockFrameCount, cameraDirection) => {
  const dirCache = useRef();
  useEffect(() => {
    dirCache.current = {};
  }, [selectedBlock, cameraDirection]);

  const getDirectionalFrame = (cmd) => {
    if (dirCache.current[cmd] !== undefined) return dirCache.current[cmd];
    if (!areFrameSetsEnabled(cmd)) {
      dirCache.current[cmd] = null;
    } else {
      dirCache.current[cmd] = _getDirectionalFrame(cmd, cameraDirection);
    }
    return dirCache.current[cmd];
  };

  const areFrameSetsEnabled = (cmd) => {
    return _areFrameSetsEnabled(cmd, cmds, selectedBlock, blockFrameCount);
  };

  return [getDirectionalFrame, areFrameSetsEnabled];
};
