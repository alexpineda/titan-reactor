import React, { useState, useEffect } from "react";
import shallow from "zustand/shallow";
import UnitsAndImages from "./units-and-images";

import { CanvasTarget } from "../../../../common/image";
import Commands from "./commands";
import Animation from "./animation";
import Frames from "./frames";
import IScriptSprite from "../../../core/iscript-sprite";
// import { createTitanImageFactory } from "../../../../common/image";
import { createIScriptRunnerFactory } from "../../../../common/iscript";
import { AtlasLoader } from "../../../../common/image";
import { blockInitializing, blockFrameCountChanged } from "../iscript-reducer";
import calculateImagesFromIscript from "../../../../common/iscript/images-from-iscript";
import { UnitDAT } from "../../../../common/types";
import { useIScriptahStore, useIscriptStore } from "../stores";

const App = ({
  surface,
  addTitanSpriteCb,
}: {
  surface: CanvasTarget;
  addTitanSpriteCb: (titanSprite: IScriptSprite) => void;
}) => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("alpha");

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

  // useEffect(() => {
  //   if (!selectedBlock) return;
  //   const preload = async () => {
  //     if (three.atlases) {
  //       Object.values(three.atlases).forEach((pl) => pl.dispose());
  //     }
  //     three.dispose();

  //     const imageIds = calculateImagesFromIscript(
  //       three.bwDat,
  //       selectedBlock.image,
  //       selectedUnit
  //     );

  //     three.atlases = {};

  //     // @todo fix file loading
  //     const atlasLoader = new GrpFileLoader(
  //       three.bwDat,
  //       bwDataPath,
  //       (file: string) => fsPromises.readFile(`${bwDataPath}/${file}`)
  //     );

  //     for (let imageId of imageIds) {
  //       await atlasLoader.load(imageId);
  //     }

  //     const { header } = selectedBlock;

  //     const createTitanSprite = (unit: UnitDAT | null): TitanSprite =>
  //       new TitanSprite(
  //         unit,
  //         three.bwDat,
  //         createTitanSprite,
  //         createTitanImageFactory(
  //           three.bwDat,
  //           three.atlases,
  //           createIScriptRunnerFactory(three.bwDat, three.tileset),
  //           (msg: string) => console.error(msg)
  //         ),
  //         addTitanSpriteCb
  //       );

  //     const titanSprite = createTitanSprite(selectedUnit);
  //     addTitanSpriteCb(titanSprite);

  //     titanSprite.addImage(selectedBlock.image.index);
  //     titanSprite.run(header);
  //     setBlockFrameCount(
  //       three.atlases[selectedBlock.image.index].frames.length
  //     );
  //   };
  //   initializeBlock(preload);
  // }, [selectedBlock, renderMode]);

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
