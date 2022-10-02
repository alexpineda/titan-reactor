import { ImageDAT, UnitDAT, Block } from "common/types";
import create from "zustand";

//a user settings store which persists to disk
export type IscriptStore = {
  unit: UnitDAT | null;

  image: ImageDAT | null;
  sprite: any;

  initializeBlock: boolean;
  block: Block | null;

  baseFrame: number | null;
  frame: number | null;
  flipFrame: boolean;
  blockFrameCount: number;
};

export const useIscriptStore = create<IscriptStore>(() => ({
  baseFrame: null,
  flipFrame: false,
  blockFrameCount: 0,

  unit: null,
  image: null,

  sprite: null,

  initializeBlock: false,
  block: null,
  frame: null
}));


const resetFrame = () => useIscriptStore.setState({ frame: null, baseFrame: null });
const disableAll = () => useIscriptStore.setState({ unit: null, image: null, sprite: null });

export const setBaseFrame = (inFrame: number | null, inFlipFrame: boolean | null = null) => {
  const frame =
    inFrame === null
      ? null
      : Math.max(0, Math.min(useIscriptStore.getState().blockFrameCount, inFrame));

  const flipFrame =
    typeof inFlipFrame !== "boolean" ? useIscriptStore.getState().flipFrame : inFlipFrame;

  useIscriptStore.setState({
    frame,
    baseFrame: frame,
    flipFrame,
  });
}

export const setFlipFrame = (flipFrame: boolean) => useIscriptStore.setState({ flipFrame });

export const setBlockFrameCount = (blockFrameCount: number) => useIscriptStore.setState({ blockFrameCount });

export const setFrame = (inFrame: number | null) => {
  const frame =
    inFrame === null ? null : Math.min(useIscriptStore.getState().blockFrameCount, inFrame);
  useIscriptStore.setState({ frame });
};

export const setBlock = (image: ImageDAT, offset: number, header: number) => {
  resetFrame();
  useIscriptStore.setState({ block: { image, offset, header } });
};

export const setSprite = (sprite: any) => {
  disableAll();
  useIscriptStore.setState({ sprite });
}

export const setImage = (image: ImageDAT) => {
  disableAll();
  useIscriptStore.setState({ image });
}

export const setUnit = (unit: UnitDAT) => {
  disableAll();
  useIscriptStore.setState({ unit });
}
