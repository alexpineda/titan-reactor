import shallow from "zustand/shallow";
import { gameSpeeds } from "common/utils/conversions";
import TransformDetails from "./transform-details";
import { WrappedCanvas } from "./wrapped-canvas";
import {
  setAutoupdate,
  setRenderMode,
  setFlipFrame,
  setBaseFrame,
  useIScriptahStore,
  useIscriptStore,
  setExposure,
  setGamespeed,
  setTransform,
  setShowFloorAxes,
} from "../stores";
import { Surface } from "@image";

export const Animation = ({
  surface,
  selectedBlock,
}: {
  surface: Surface;
  selectedBlock: any;
}) => {
  const {
    autoUpdate,
    gamespeed,
    renderMode,
    exposure,
    cameraDirection,
    transform,
    transformVector,
    showFloorAxes,
  } = useIScriptahStore(
    (store) => ({
      autoUpdate: store.autoUpdate,
      gamespeed: store.gamespeed,
      renderMode: store.renderMode,
      exposure: store.exposure,
      cameraDirection: store.cameraDirection,
      transform: store.transform,
      transformVector: store.transformVector,
      showFloorAxes: store.showFloorAxes,
    }),
    shallow
  );

  const { baseFrame, flipFrame } = useIscriptStore(
    (store) => ({
      baseFrame: store.baseFrame,
      flipFrame: store.flipFrame,
    }),
    shallow
  );

  if (!selectedBlock) {
    return (
      <aside className="bg-gray-100 flex-1 flex flex-col max-h-screen">
        <header className="p-2">
          <p className="text-xs italic">Animation</p>
          <p className="font-bold text-lg text-blue-800">None</p>
        </header>
        <WrappedCanvas
          canvas={surface.canvas}
          className={"flex-1 text-gray-300 pattern-checks-sm"}
        />
      </aside>
    );
  }
  const { offset } = selectedBlock;

  return (
    <aside className="bg-gray-100 flex-1 flex flex-col max-h-screen overflow-y-scroll">
      <header className="p-2">
        <p className="text-xs italic">Animation</p>
        <p
          className="font-bold text-lg text-blue-800"
          aria-label={`using ${offset}`}
          data-balloon-pos="down"
        ></p>
      </header>
      <section className="flex justify-between">
        <span>
          <span
            className={`px-2 py-1 bg-gray-100 select-none cursor-pointer ${
              renderMode === "sd" ? "underline" : ""
            }`}
            onClick={() => setRenderMode("sd")}
          >
            SD
          </span>{" "}
          <span
            className={`px-2 py-1 bg-gray-100 select-none cursor-pointer ${
              renderMode === "hd" ? "underline" : ""
            }`}
            onClick={() => setRenderMode("hd")}
          >
            HD
          </span>
          <span
            className={`px-2 py-1 bg-gray-100 select-none cursor-pointer ${
              renderMode === "3d" ? "underline" : ""
            }`}
            onClick={() => setRenderMode("3d")}
          >
            3D
          </span>
        </span>
        <span>
          <span
            className={`material-icons cursor-pointer ${
              transform === "translate" ? "bg-gray-300" : ""
            }`}
            title="translate"
            onClick={() => {
              if (transform === "translate") {
                setTransform("");
              } else {
                setTransform("translate");
              }
            }}
          >
            transform
          </span>
          <span
            className={`material-icons cursor-pointer ${
              transform === "scale" ? "bg-gray-300" : ""
            }`}
            title="scale"
            onClick={() => {
              if (transform === "scale") {
                setTransform("");
              } else {
                setTransform("scale");
              }
            }}
          >
            photo_size_select_small
          </span>
          <span
            className={`material-icons cursor-pointer ${
              transform === "rotate" ? "bg-gray-300" : ""
            }`}
            title="rotate"
            onClick={() => {
              if (transform === "rotate") {
                setTransform("");
              } else {
                setTransform("rotate");
              }
            }}
          >
            rotate_left
          </span>
        </span>
        <span className="flex items-center">
          <input
            type="checkbox"
            aria-label="show floor/axes"
            data-balloon-pos="down"
            checked={showFloorAxes}
            onChange={(evt) => {
              setShowFloorAxes((evt.target as HTMLInputElement).checked);
            }}
          />

          <input
            className="w-20 ml-4"
            aria-label="exposure"
            data-balloon-pos="down"
            type="range"
            min="1"
            max="4"
            step="0.01"
            value={exposure}
            onChange={(evt) =>
              setExposure(Number((evt.target as HTMLInputElement).value))
            }
          />
        </span>
      </section>
      <section className="mx-auto relative">
        <WrappedCanvas
          canvas={surface.canvas}
          className={"flex-1 text-gray-300 pattern-checks-sm"}
        />
        <div className="absolute bottom-0 left-0">
          {transformVector && <TransformDetails property={transformVector} />}
        </div>
      </section>
      <section className="flex mx-auto">
        <p className="mr-2">Camera Direction {cameraDirection}</p>

        <select
          value={gamespeed}
          onChange={({ target }) => setGamespeed(Number(target.value))}
        >
          {Object.entries(gameSpeeds).map(([name, val]) => {
            return (
              <option key={val} value={val}>
                {name}
              </option>
            );
          })}
        </select>
      </section>
      <section className="flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          {baseFrame === null && (
            <>
              <span>
                {!autoUpdate && (
                  <i
                    className="material-icons cursor-pointer"
                    onClick={() => setAutoupdate(true)}
                  >
                    play_arrow
                  </i>
                )}
                {autoUpdate && (
                  <i
                    className="material-icons cursor-pointer "
                    onClick={() => setAutoupdate(false)}
                  >
                    pause
                  </i>
                )}
              </span>
            </>
          )}
          {baseFrame !== null && (
            <>
              <i
                className="material-icons cursor-pointer"
                onClick={() => {
                  setBaseFrame(null);
                  setAutoupdate(true);
                }}
              >
                play_arrow
              </i>

              <label className="ml-4">
                flip{" "}
                <input
                  type="checkbox"
                  checked={flipFrame}
                  onChange={() => setFlipFrame(!flipFrame)}
                />
              </label>
            </>
          )}
        </div>
      </section>
    </aside>
  );
};

export default Animation;
