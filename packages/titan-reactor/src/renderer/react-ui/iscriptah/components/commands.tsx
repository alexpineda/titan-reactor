import React, { useState, useRef, useEffect } from "react";
import shallow from "zustand/shallow";
import { iscriptHeaders } from "../../../../common/bwdat/enums";
import { interactiveOpCodes } from "../utils/framesets";
import useDirectionalFrame from "../utils/useDirectionalFrame";
import { useIScriptahStore, useIscriptStore, setBaseFrame } from "../stores";
import { useGameStore } from "../../../stores/game-store";

export const Commands = () => {
  const bwDat = useGameStore((state) => state.assets?.bwDat);
  if (!bwDat) {
    throw new Error("No bwDat loaded");
  }

  const { cameraDirection } = useIScriptahStore((state) => ({
    cameraDirection: state.cameraDirection,
  }));

  const { blockFrameCount, selectedBlock, frame } = useIscriptStore(
    (store) => ({
      blockFrameCount: store.blockFrameCount,
      selectedBlock: store.block,
      frame: store.frame,
    }),
    shallow
  );

  if (!selectedBlock) {
    return (
      <aside
        className="bg-gray-100 flex-0 flex flex-col max-h-screen overflow-y-scroll"
        style={{ minWidth: "15rem" }}
      >
        <header className="p-2">
          <p className="text-xs italic">IScript Animation Block</p>
          <p className="font-bold text-lg text-blue-800">None</p>
        </header>
      </aside>
    );
  }
  const [showOnlyPlayFrame, setShowOnlyPlayFrame] = useState(true);
  const [clickEl, setClickEl] = useState<number | null>(null);
  const elToClick = useRef<HTMLLIElement>();

  const { offset, header } = selectedBlock;
  const animationBlocks = bwDat.iscript.animationBlocks;
  const cmds = animationBlocks[offset];
  const headerLabel = iscriptHeaders[header];
  const [getDirectionalFrame, areFrameSetsEnabled] = useDirectionalFrame(
    cmds,
    selectedBlock,
    blockFrameCount,
    cameraDirection
  );

  useEffect(() => {
    elToClick.current && elToClick.current.click();
    elToClick.current && elToClick.current.focus();
    setClickEl(null);
  }, [clickEl]);

  const clickNext = (prevIndex: number) => {
    if (!cmds.find(([op]) => interactiveOpCodes.includes(op))) {
      return;
    }

    let index = prevIndex + 1;
    if (index > cmds.length - 1) {
      index = 0;
    }
    if (!interactiveOpCodes.includes(cmds[index][0])) {
      clickNext(index);
    } else {
      setClickEl(index);
    }
  };

  const clickPrev = (prevIndex: number) => {
    if (!cmds.find(([op]) => interactiveOpCodes.includes(op))) {
      return;
    }

    let index = prevIndex - 1;
    if (index < 0) {
      index = cmds.length - 1;
    }
    // find next element
    if (!interactiveOpCodes.includes(cmds[index][0])) {
      clickPrev(index);
    } else {
      setClickEl(index);
    }
  };

  return (
    <aside
      className="bg-gray-100 flex-0 flex flex-col max-h-screen overflow-y-scroll px-2  pb-10"
      style={{ minWidth: "15rem" }}
    >
      <header className="p-2">
        <p className="text-xs italic">IScript Animation Block</p>
        <p
          className="font-bold text-lg text-blue-800"
          aria-label={`using ${offset}`}
          data-balloon-pos="down"
        >
          {headerLabel}
        </p>
        <div>
          <label>
            show only playfram{" "}
            <input
              type="checkbox"
              checked={showOnlyPlayFrame}
              onChange={() => setShowOnlyPlayFrame(!showOnlyPlayFrame)}
            />
          </label>
        </div>
      </header>
      <section className="p-2">
        <ul>
          {cmds &&
            cmds
              .map((cmd, i: number) => [cmd, i])
              .filter(([[op]]) =>
                showOnlyPlayFrame ? interactiveOpCodes.includes(op) : true
              )
              .map((cmd, i: number) => {
                return (
                  <li
                    tabIndex={0}
                    onKeyDown={(evt) => {
                      evt.preventDefault();
                      if (evt.key === "ArrowDown") {
                        clickNext(i);
                      } else if (evt.key === "ArrowUp") {
                        clickPrev(i);
                      }
                    }}
                    ref={(el) => {
                      if (clickEl === i && el) {
                        elToClick.current = el;
                      }
                    }}
                    onClick={() => {
                      if (!interactiveOpCodes.includes(cmd[0])) return;
                      if (areFrameSetsEnabled(cmd)) {
                        const [frame, flip] = getDirectionalFrame(cmd);
                        setBaseFrame(frame, flip);
                      } else {
                        setBaseFrame(cmd[1]);
                      }
                    }}
                    className={`p-2 rounded select-none flex justify-between ${
                      interactiveOpCodes.includes(cmd[0])
                        ? "cursor-pointer bg-green-100 hover:bg-gray-300"
                        : ""
                    }

                    ${
                      frame !== null &&
                      getDirectionalFrame(cmd) !== null &&
                      getDirectionalFrame(cmd)[0] === frame
                        ? "bg-green-200"
                        : ""
                    }`}
                    key={i}
                  >
                    <span>
                      {cmd[0]} {cmd.slice(1).join(" ")}
                    </span>
                    {areFrameSetsEnabled(cmd) && (
                      <span
                        className="rounded-lg px-1 bg-gray-400 ml-2 mr-1 text-sm"
                        aria-label="`/w direction"
                        data-balloon-pos="down"
                      >
                        {getDirectionalFrame(cmd)[0]}
                      </span>
                    )}
                  </li>
                );
              })}
        </ul>
      </section>
    </aside>
  );
};
export default Commands;
