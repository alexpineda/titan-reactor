import { set } from "ramda";
import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import { headersById } from "titan-reactor-shared/types/iscriptHeaders";
import { baseFrameSelected } from "../iscriptReducer";
import { interactiveOpCodes } from "../utils/framesets";
import useDirectionalFrame from "../utils/useDirectionalFrame";

const Commands = ({
  bwDat,
  selectedBlock,
  selectBaseFrame,
  blockFrameCount,
  frame,
  cameraDirection,
}) => {
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
  const [clickEl, setClickEl] = useState(null);
  const elToClick = useRef();

  const { offset, header } = selectedBlock;
  const animationBlocks = bwDat.iscript.animationBlocks;
  const cmds = animationBlocks[offset];
  const headerLabel = headersById[header];
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

  const clickNext = (prevIndex) => {
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

  const clickPrev = (prevIndex) => {
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
              .map((cmd, i) => [cmd, i])
              .filter(([[op]]) =>
                showOnlyPlayFrame ? interactiveOpCodes.includes(op) : true
              )
              .map(([cmd, i]) => {
                return (
                  <li
                    tabIndex="0"
                    onKeyDown={(evt) => {
                      evt.preventDefault();
                      console.log(evt.key);
                      if (evt.key === "ArrowDown") {
                        clickNext(i);
                      } else if (evt.key === "ArrowUp") {
                        clickPrev(i);
                      }
                    }}
                    ref={(el) => {
                      if (clickEl === i) {
                        elToClick.current = el;
                      }
                    }}
                    onClick={() => {
                      if (!interactiveOpCodes.includes(cmd[0])) return;
                      if (areFrameSetsEnabled(cmd)) {
                        const [frame, flip] = getDirectionalFrame(cmd);
                        selectBaseFrame(frame, flip);
                      } else {
                        selectBaseFrame(cmd[1]);
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

export default connect(
  (state) => {
    return {
      blockFrameCount: state.iscript.blockFrameCount,
      frame: state.iscript.frame,
    };
  },
  (dispatch) => ({
    selectBaseFrame: (frame, flip = null) =>
      dispatch(baseFrameSelected(frame, flip, true)),
  })
)(Commands);
