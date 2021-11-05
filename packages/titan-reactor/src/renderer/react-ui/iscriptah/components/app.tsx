import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { promises as fsPromises } from "fs";
import UnitsAndImages from "./units-and-images";
const dialog = require("electron").remote.dialog;

import Commands from "./commands";
import Animation from "./animation";
import Frames from "./frames";
import TitanSprite from "../../../../common/image/titan-sprite";
import {
  GrpSD,
  GrpHD,
  Grp3D,
  createTitanImageFactory,
} from "../../../../common/image";
import { createIScriptRunnerFactory } from "../../../../common/iscript";
import { GrpFileLoader } from "../../../../common/image";
import { blockInitializing, blockFrameCountChanged } from "../iscript-reducer";
import calculateImagesFromIscript from "../../../../common/image/util/images-from-iscript";
import { UnitDAT } from "../../../../common/types";

const App = ({
  surface,
  cameraDirection,
  selectedBlock,
  changeBlockFrameCount,
  blockFrameCount,
  initializeBlock,
  selectedUnit,
  selectedImage,
  selectedSprite,
  three,
  renderMode,
  addTitanSpriteCb,
  bootup,
}) => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("alpha");

  useEffect(() => {
    if (!selectedBlock) return;
    const preload = async () => {
      if (three.atlases) {
        Object.values(three.atlases).forEach((pl) => pl.dispose());
      }
      three.dispose();

      const imageIds = calculateImagesFromIscript(
        three.bwDat,
        selectedBlock.image,
        selectedUnit
      );

      three.atlases = {};

      // @todo fix file loading
      const atlasLoader = new GrpFileLoader(
        three.bwDat,
        bwDataPath,
        (file: string) => fsPromises.readFile(`${bwDataPath}/${file}`)
      );

      for (let imageId of imageIds) {
        await atlasLoader.load(imageId);
      }

      const { header } = selectedBlock;

      const createTitanSprite = (unit: UnitDAT | null): TitanSprite =>
        new TitanSprite(
          unit,
          three.bwDat,
          createTitanSprite,
          createTitanImageFactory(
            three.bwDat,
            three.atlases,
            createIScriptRunnerFactory(three.bwDat, three.tileset),
            (msg: string) => console.error(msg)
          ),
          addTitanSpriteCb
        );

      const titanSprite = createTitanSprite(selectedUnit);
      addTitanSpriteCb(titanSprite);

      titanSprite.addImage(selectedBlock.image.index);
      titanSprite.run(header);
      changeBlockFrameCount(
        three.atlases[selectedBlock.image.index].frames.length
      );
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
        <UnitsAndImages bwDat={three.bwDat} search={search} />

        <Commands
          bwDat={three.bwDat}
          selectedBlock={selectedBlock}
          cameraDirection={cameraDirection}
        />
        <Animation
          selectedBlock={selectedBlock}
          surface={surface}
          three={three}
        />
        <Frames numFrames={blockFrameCount} />
      </div>
    </div>
  );
};

export default connect(
  (state) => {
    return {
      selectedBlock: state.iscript.block,
      isBlockInitialized: state.iscript.initializeBlock.fulfilled,
      blockFrameCount: state.iscript.blockFrameCount,
      selectedUnit: state.iscript.unit,
      selectedImage: state.iscript.image,
      selectedSprite: state.iscript.sprite,
      gameTick: state.app.gameTick,
      validBwDataPath: state.app.validBwDataPath,
      bwDataPath: state.app.bwDataPath,
      cameraDirection: state.app.cameraDirection,
      renderMode: state.app.renderMode,
    };
  },
  (dispatch) => ({
    initializeBlock: (fn) => dispatch(blockInitializing(fn)),
    changeBlockFrameCount: (val: number) =>
      dispatch(blockFrameCountChanged(val)),
  })
)(App);
