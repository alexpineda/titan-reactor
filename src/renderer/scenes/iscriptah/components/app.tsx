import { useState, useEffect } from "react";
import shallow from "zustand/shallow";
import UnitsAndImages from "./units-and-images";

import { Surface } from "@image";
import { useGameStore } from "@stores/game-store";
import Commands from "./commands";
import Animation from "./animation";
import Frames from "./frames";
import IScriptSprite from "../iscript-sprite";
import calculateImagesFromIscript from "@utils/images-from-iscript";
import { AnimAtlas, UnitDAT } from "common/types";
import {
  setBlockFrameCount,
  useIScriptahStore,
  useIscriptStore,
} from "../stores";
import { IScriptRunner } from "../iscript-runner";
import { ImageHD } from "@core/image-hd";
import { loadImageAtlasDirect } from "@image/assets";
import { isGltfAtlas } from "@utils/image-utils";
import { Image3D } from "@core/image-3d";
import { ImageBase } from "@core/image";
import { WrappedCanvas } from "@image/canvas/wrapped-canvas";

const App = ({
  surface,
  addTitanSpriteCb,
}: {
  surface: Surface;
  addTitanSpriteCb: (titanSprite: IScriptSprite) => void;
}) => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("alpha");
  const { assets } = useGameStore((state) => ({
    assets: state.assets,
  }));

  const { renderMode } = useIScriptahStore(
    (store) => ({
      renderMode: store.renderMode,
    }),
    shallow
  );

  const {
    blockFrameCount,
    selectedImage,
    selectedSprite,
    selectedUnit,
    selectedBlock,
  } = useIscriptStore(
    (store) => ({
      blockFrameCount: store.blockFrameCount,
      selectedUnit: store.unit,
      selectedImage: store.image,
      selectedSprite: store.sprite,
      selectedBlock: store.block,
    }),
    shallow
  );

  const tileset = 0;

  useEffect(() => {
    if (!selectedBlock) return;
    const images: Record<number, AnimAtlas> = {};

    const preload = async () => {
      console.log("preload", selectedBlock);
      const { header } = selectedBlock;

      await Promise.all(
        calculateImagesFromIscript(
          assets!.bwDat,
          selectedBlock.image,
          selectedUnit
        ).map(async (image) => {
          images[image] = await loadImageAtlasDirect(image, true);
        })
      );

      const createTitanImageFactory = () => {
        return (imageId: number): ImageBase => {
          const atlas = images[imageId];
          if (isGltfAtlas(atlas)) {
            return new Image3D(atlas);
          }
          return new ImageHD().updateImageType(atlas);
        };
      };

      const createTitanSprite = (
        unit: UnitDAT | null | undefined
      ): IScriptSprite =>
        new IScriptSprite(
          unit,
          assets!.bwDat,
          createTitanSprite,
          createTitanImageFactory(),
          new IScriptRunner(assets!.bwDat, tileset),
          addTitanSpriteCb
        );

      const titanSprite = createTitanSprite(selectedUnit);
      addTitanSpriteCb(titanSprite);

      titanSprite.spawnIScriptImage(selectedBlock.image.index);
      titanSprite.run(header);
      setBlockFrameCount(images[selectedBlock.image.index].frames.length);
    };
    preload();
  }, [selectedBlock, renderMode]);

  useEffect(() => {
    if (!(selectedUnit || selectedSprite || selectedImage)) return;
    //@todo clear previous image
    // three.dispose();
  }, [selectedImage, selectedSprite, selectedUnit]);

  return (
    <div style={{ background: "var(--gray-0)" }}>
      <div
        style={{
          display: "flex",
          width: "100%",
          position: "absolute",
          zIndex: "10",
        }}
      >
        <section
          style={{
            fontSize: "var(--font-size-1)",
            display: "flex",
          }}
        >
          <div
            style={{
              paddingTop: "var(--size-1)",
              marginRight: "var(--size-1)",
            }}
          >
            <span
              aria-label="Sort A-Z"
              data-balloon-pos="up"
              onClick={() => {
                if (sort === "alpha") {
                  setSort("index");
                } else {
                  setSort("alpha");
                }
              }}
            >
              Sort By Alpha
            </span>
          </div>
          <input
            style={{
              border: "1px solid var(--gray-1)",
              width: "100%",
            }}
            type="text"
            placeholder="Search name or #id"
            onChange={(e) =>
              setSearch((e.target as HTMLInputElement).value as string)
            }
            value={search}
          />
          <button type="button" onClick={() => setSearch("")}>
            Clear
          </button>
        </section>
      </div>

      <div
        style={{
          display: "flex",
          width: "100%",
          height: "vh100",
          alignItems: "stretch",
          color: "var(--gray-8)",
        }}
      >
        <UnitsAndImages search={search} />
        {selectedBlock ? (
          <Commands selectedBlock={selectedBlock} />
        ) : (
          <aside
            style={{
              flex: 0,
              display: "flex",
              flexDirection: "column",
              maxHeight: "100vh",
              overflowY: "scroll",
              minWidth: "15rem",
            }}
          >
            <header className="p-2">
              <p className="text-xs italic">IScript Animation Block</p>
              <p className="font-bold text-lg text-blue-800">None</p>
            </header>
          </aside>
        )}
        {selectedBlock ? (
          <Animation selectedBlock={selectedBlock} surface={surface} />
        ) : (
          <aside
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              maxHeight: "100vh",
            }}
          >
            <header className="p-2">
              <p className="text-xs italic">Animation</p>
              <p className="font-bold text-lg text-blue-800">None</p>
            </header>
            <WrappedCanvas
              canvas={surface.canvas}
              className={"flex-1 text-gray-300 pattern-checks-sm"}
            />
          </aside>
        )}
        <Frames numFrames={blockFrameCount} />
      </div>
    </div>
  );
};
export default App;
