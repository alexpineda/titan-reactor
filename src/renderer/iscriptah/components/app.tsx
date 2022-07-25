// @ts-nocheck
import { useState, useEffect } from "react";
import shallow from "zustand/shallow";
import UnitsAndImages from "./units-and-images";

import { Surface } from "@image";
import { useGameStore } from "@stores/game-store";
import Commands from "./commands";
import Animation from "./animation";
import Frames from "./frames";
import IScriptSprite from "@core/iscript-sprite";
import calculateImagesFromIscript from "../../iscript/images-from-iscript";
import { UnitDAT } from "common/types";
import {
  setBlockFrameCount,
  useIScriptahStore,
  useIscriptStore,
} from "../stores";
import { IScriptRunner } from "renderer/iscript/iscript-runner";

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

  const { renderMode, cameraDirection } = useIScriptahStore(
    (store) => ({
      renderMode: store.renderMode,
      cameraDirection: store.cameraDirection,
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
    const preload = async () => {
      // three.dispose();

      const imageIds = calculateImagesFromIscript(
        assets!.bwDat,
        selectedBlock.image,
        selectedUnit
      );

      const { header } = selectedBlock;

      const createTitanImageFactory = () => {};

      // unit: any = null,
      // bwDat: BwDAT,
      // createTitanSprite: (unit: UnitDAT | null | undefined) => IScriptSprite,
      // createTitanImage: (
      //   image: number
      // ) => Image,
      // runner: IScriptRunner,
      // createTitanSpriteCb: (titanSprite: IScriptSprite) => void,
      // destroyTitanSpriteCb: (titanSprite: IScriptSprite) => void = () => { },

      const createTitanSprite = (unit: UnitDAT | null): IScriptSprite =>
        new IScriptSprite(
          unit,
          assets!.bwDat,
          createTitanSprite,
          createTitanImageFactory(
            assets!.bwDat,
            assets!.grps,
            createIScriptRunnerFactory(assets!.bwDat, tileset),
            (msg: string) => console.error(msg)
          ),
          new IScriptRunner(assets!.bwDat, tileset),
          addTitanSpriteCb
        );

      const titanSprite = createTitanSprite(selectedUnit);
      addTitanSpriteCb(titanSprite);

      titanSprite.spawnIScriptImage(selectedBlock.image.index);
      titanSprite.run(header);
      setBlockFrameCount(assets!.grps[selectedBlock.image.index].frames.length);
    };
    initializeBlock(preload);
  }, [selectedBlock, renderMode]);

  useEffect(() => {
    if (!(selectedUnit || selectedSprite || selectedImage)) return;
    //@todo clear previous image
    // three.dispose();
  }, [selectedImage, selectedSprite, selectedUnit]);

  return (
    <div className="bg-gray-100">
      <div className="flex w-full p-2 absolute bg-gray-100 z-10">
        <section className="text-xs flex ">
          <div className="pt-1 mr-1">
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
              <i className="material-icons cursor-pointer">sort_by_alpha</i>
            </span>
          </div>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Search name or #id"
            onChange={(e) =>
              setSearch((e.target as HTMLInputElement).value as string)
            }
            value={search}
          />
          <button
            type="button"
            className=" cursor-pointer"
            onClick={() => setSearch("")}
          >
            {" "}
            <i className="material-icons ">clear</i>
          </button>
        </section>
      </div>
      <div className="flex w-full h-screen items-stretch divide-x-2 text-gray-800 pt-12">
        <UnitsAndImages search={search} />
        <Commands />
        <Animation selectedBlock={selectedBlock} surface={surface} />
        <Frames numFrames={blockFrameCount} />
      </div>
    </div>
  );
};
export default App;
