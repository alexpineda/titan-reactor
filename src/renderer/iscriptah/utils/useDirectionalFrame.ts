import { useRef, useEffect } from "react";
import {
  getDirectionalFrame as _getDirectionalFrame,
  areFrameSetsEnabled as _areFrameSetsEnabled,
} from "./framesets";
import { AnimationBlockType, Block } from "common/types";


export default (cmds: AnimationBlockType, selectedBlock: Block, blockFrameCount: number, cameraDirection: number) => {
  const dirCache = useRef<any>();
  useEffect(() => {
    dirCache.current = {};
  }, [selectedBlock, cameraDirection]);

  const getDirectionalFrame = (cmd: any) => {
    if (dirCache.current[cmd] !== undefined) return dirCache.current[cmd];
    if (!areFrameSetsEnabled(cmd)) {
      dirCache.current[cmd] = null;
    } else {
      dirCache.current[cmd] = _getDirectionalFrame(cmd, cameraDirection);
    }
    return dirCache.current[cmd];
  };

  const areFrameSetsEnabled = (cmd: any) => {
    return _areFrameSetsEnabled(cmd, cmds, selectedBlock, blockFrameCount);
  };

  return [getDirectionalFrame, areFrameSetsEnabled];
};
