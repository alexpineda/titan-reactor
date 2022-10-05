import shallow from "zustand/shallow";
import { gameSpeeds } from "common/utils/conversions";
import { WrappedCanvas } from "@image/canvas/wrapped-canvas";
import {
  setAutoupdate,
  setFlipFrame,
  setBaseFrame,
  useIScriptahStore,
  useIscriptStore,
  setGamespeed,
} from "../stores";
import { Surface } from "@image";
import { Block } from "common/types";

export const Animation = ({
  surface,
  selectedBlock,
}: {
  surface: Surface;
  selectedBlock: Block;
}) => {
  const { autoUpdate, gamespeed } = useIScriptahStore(
    (store) => ({
      autoUpdate: store.autoUpdate,
      gamespeed: store.gamespeed,
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

  const { offset } = selectedBlock;

  return (
    <aside
      style={{
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
        overflowY: "scroll",
        background: "var(--gray-1)",
        flex: 1,
      }}
    >
      <header>
        <p style={{ fontSize: "var(--font-size-1)", fontStyle: "italic" }}>
          Viewport
        </p>
        <p
          style={{ fontSize: "var(--font-size-2)", color: "var(--blue-8)" }}
          aria-label={`using ${offset}`}
          data-balloon-pos="down"
        ></p>
      </header>
      <section style={{ display: "flex", justifyContent: "space-between" }}>
        Show 3D Model
      </section>
      <section
        style={{
          marginInline: "auto",
          position: "relative",
        }}
      >
        <WrappedCanvas
          canvas={surface.canvas}
          style={{
            flex: 1,
            color: "var(--gray-3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
          }}
        ></div>
      </section>
      <section
        style={{
          display: "flex",
          marginInline: "auto",
        }}
      >
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
      <section
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {baseFrame === null && (
            <>
              <span>
                {!autoUpdate && (
                  <i
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() => setAutoupdate(true)}
                  >
                    play_arrow
                  </i>
                )}
                {autoUpdate && (
                  <i
                    style={{
                      cursor: "pointer",
                    }}
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
                style={{
                  cursor: "pointer",
                }}
                onClick={() => {
                  setBaseFrame(null);
                  setAutoupdate(true);
                }}
              >
                play_arrow
              </i>

              <label
                style={{
                  marginLeft: "var(--size-2)",
                }}
              >
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
