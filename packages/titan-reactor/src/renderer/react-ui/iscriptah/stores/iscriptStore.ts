import { ImageDAT, UnitDAT, Block } from "../../../../common/types";
import create from "zustand";

//a user settings store which persists to disk
export type IscriptStore = {
  baseFrame: number | null;
  setBaseFrame: (frame: number | null, flipFrame?: boolean | null) => void;

  flipFrame: boolean;
  setFlipFrame: (flipFrame: boolean) => void;

  blockFrameCount: number;
  setBlockFrameCount: (blockFrameCount: number) => void;

  resetFrame: () => void;
  disableAll: () => void;
  unit: UnitDAT | null;
  setUnit: (unit: UnitDAT) => void;

  image: ImageDAT | null;
  setImage: (image: ImageDAT) => void;

  sprite: any;
  setSprite: (sprite: any) => void;

  initializeBlock: boolean;

  block: Block | null;
  setBlock: (image: ImageDAT, offset: number, header: number) => void;

  frame: number | null;
  setFrame: (frame: number | null) => void;
};

export const useIscriptStore = create<IscriptStore>((set, get) => ({
  baseFrame: null,
  setBaseFrame: (inFrame, inFlipFrame = null) => {
    const frame =
      inFrame === null
        ? null
        : Math.max(0, Math.min(get().blockFrameCount, inFrame));

    const flipFrame =
      typeof inFlipFrame !== "boolean" ? get().flipFrame : inFlipFrame;

    set({
      frame,
      baseFrame: frame,
      flipFrame,
    });
  },
  flipFrame: false,
  setFlipFrame: (flipFrame: boolean) => set({ flipFrame }),
  blockFrameCount: 0,
  setBlockFrameCount: (blockFrameCount: number) => set({ blockFrameCount }),

  resetFrame: () => set({ frame: null, baseFrame: null }),
  disableAll: () => set({ unit: null, image: null, sprite: null }),

  unit: null,
  setUnit: (unit) => {
    get().disableAll();
    set({ unit });
  },
  image: null,
  setImage: (image) => {
    get().disableAll();
    set({ image });
  },
  sprite: null,
  setSprite: (sprite) => {
    get().disableAll();
    set({ sprite });
  },

  initializeBlock: false,
  block: null,
  setBlock: (image, offset, header) => {
    get().resetFrame();
    set({ block: { image, offset, header } });
  },
  frame: null,
  setFrame: (inFrame) => {
    const frame =
      inFrame === null ? null : Math.min(get().blockFrameCount, inFrame);
    set({ frame });
  },
}));

export default useIscriptStore;

export const setBaseFrame = useIscriptStore.getState().setBaseFrame;
export const setFlipFrame = useIscriptStore.getState().setFlipFrame;
export const setBlockFrameCount = useIscriptStore.getState().setBlockFrameCount;
export const setFrame = useIscriptStore.getState().setFrame;
export const setBlock = useIscriptStore.getState().setBlock;
export const setSprite = useIscriptStore.getState().setSprite;
export const setImage = useIscriptStore.getState().setImage;
export const setUnit = useIscriptStore.getState().setUnit;
