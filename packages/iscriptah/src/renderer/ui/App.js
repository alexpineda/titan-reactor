import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { promises as fsPromises } from "fs";
import UnitsAndImages from "./UnitsAndImages";
const dialog = require("electron").remote.dialog;

import Commands from "./Commands";
import Animation from "./Animation";
import Frames from "./Frames";
import TitanSprite from "titan-reactor-shared/image/TitanSprite";
import GrpSD from "titan-reactor-shared/image/GrpSD";
import GrpHD from "titan-reactor-shared/image/GrpHD";
import Grp3D from "titan-reactor-shared/image/Grp3D";
import createTitanImage from "titan-reactor-shared/image/createTitanImage";
import { createIScriptRunner } from "titan-reactor-shared/iscript/IScriptRunner";
import AtlasPreloader from "titan-reactor-shared/image/AtlasPreloader";
import { errorOccurred, bwDataPathChanged } from "../appReducer";
import { blockInitializing, blockFrameCountChanged } from "../iscriptReducer";
import calculateImagesFromIScript from "titan-reactor-shared/image/calculateImagesFromIScript";

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
  error,
  setError,
  three,
  renderMode,
  bwDataPath,
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

      const imageIds = calculateImagesFromIScript(
        three.bwDat,
        selectedBlock.image,
        selectedUnit
      );

      three.atlases = {};

      const atlasLoader = new AtlasPreloader(
        three.bwDat,
        bwDataPath,
        (file) => fsPromises.readFile(`${bwDataPath}/${file}`),
        three.tileset,
        () => {
          if (renderMode === "sd") {
            return new GrpSD();
          } else if (renderMode === "hd") {
            return new GrpHD();
          } else if (renderMode === "3d") {
            return new Grp3D(three.scene.environment);
          } else {
            throw new Error("invalid render mode");
          }
        },
        three.atlases
      );

      for (let imageId of imageIds) {
        await atlasLoader.load(imageId);
      }

      const { header } = selectedBlock;

      const createTitanSprite = (unit) =>
        new TitanSprite(
          unit || null,
          three.bwDat,
          createTitanSprite,
          createTitanImage(
            three.bwDat,
            three.atlases,
            createIScriptRunner(three.bwDat, three.tileset),
            setError
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
    setError(null);
    //clear previous image
    // three.dispose();
  }, [selectedImage, selectedSprite, selectedUnit]);

  useEffect(() => {
    if (localStorage.getItem("bwDataPath")) {
      bootup(localStorage.getItem("bwDataPath"));
    }
  }, []);
  const selectBwDataDirectory = () => {
    dialog
      .showOpenDialog({
        properties: ["openDirectory"],
      })
      .then(({ filePaths, canceled }) => {
        console.log("show open dialog", filePaths);
        if (canceled) return;
        bootup(filePaths[0]);
      })
      .catch((err) => {
        dialog.showMessageBox({
          type: "error",
          title: "Error Loading File",
          message: "There was an error selecting path: " + err.message,
        });
      });
  };

  return !bwDataPath ? (
    <div className="flex w-full h-screen p-2 absolute bg-gray-100 justify-center items-center">
      <button
        className="rounded px-2 py-1 bg-blue-300 hover:bg-blue-200 shadow"
        onClick={selectBwDataDirectory}
      >
        Select your BW Data directory
      </button>
    </div>
  ) : (
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
            onChange={(e) => setSearch(e.target.value)}
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
          <p className="text-red-700 flex-grow">{error}</p>
        </section>
      </div>
      <div className="flex w-full h-screen items-stretch divide-x-2 text-gray-800 pt-12">
        <UnitsAndImages bwDat={three.bwDat} search={search} sort={sort} />

        <Commands
          bwDat={three.bwDat}
          selectedBlock={selectedBlock}
          three={three}
          cameraDirection={cameraDirection}
        />
        <Animation
          selectedBlock={selectedBlock}
          surface={surface}
          three={three}
          bwDat={three.bwDat}
        />
        <Frames
          bwDat={three.bwDat}
          selectedBlock={selectedBlock}
          numFrames={blockFrameCount}
        />
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
      error: state.app.error,
      validBwDataPath: state.app.validBwDataPath,
      bwDataPath: state.app.bwDataPath,
      cameraDirection: state.app.cameraDirection,
      renderMode: state.app.renderMode,
    };
  },
  (dispatch) => ({
    setError: (error) => dispatch(errorOccurred(error)),
    initializeBlock: (fn) => dispatch(blockInitializing(fn)),
    changeBlockFrameCount: (val) => dispatch(blockFrameCountChanged(val)),
    setBwDataPath: (val) => dispatch(bwDataPathChanged(val)),
  })
)(App);
