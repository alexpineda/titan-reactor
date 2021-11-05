import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import { baseFrameSelected, frameSelected } from "../iscript-reducer";
import range from "../../../../common/utils/range";

const Frames = ({
  numFrames,
  setFrame,
  selectBaseFrame,
  selectedBaseFrame,
  blockFrameCount,
  selectedFrame,
}) => {
  const [focusElement, setFocusElement] = useState(false);
  const [showOnlyFramesets, setShowOnlyFramesets] = useState(false);

  const elementToFocus = useRef<HTMLLIElement>();
  const looseFrames = numFrames % 17;

  useEffect(() => {
    if (focusElement && elementToFocus.current) {
      (elementToFocus.current as HTMLLIElement).focus();
      setFocusElement(false);
    }
  }, [focusElement]);

  return (
    <aside
      className="bg-gray-100 flex-0 flex flex-col max-h-screen overflow-y-scroll pb-10  select-none"
      style={{ minWidth: "8rem" }}
    >
      <header className="p-2">
        <p className="text-xs italic mb-4">
          <p>{numFrames} All Frames</p>
          <p>{Math.floor(numFrames / 17)} Framesets</p>
          <p>{numFrames % 17} Loose Frames</p>
        </p>
        <label>
          <input
            type="checkbox"
            checked={showOnlyFramesets}
            onChange={(evt) => {
              setShowOnlyFramesets((evt.target as HTMLInputElement).checked);
            }}
          />
          Show only framesets
        </label>
      </header>
      <section className="p-2 relative">
        <ul>
          {range(0, numFrames).map((frame: number, i: number) => {
            let isBaseFrame =
              selectedBaseFrame === null
                ? 0
                : Math.floor(i / 17) * 17 + (selectedBaseFrame % 17);
            let grey = Math.floor(i / 17) % 2;

            return !showOnlyFramesets ||
              (showOnlyFramesets &&
                (isBaseFrame === i || i >= numFrames - looseFrames)) ? (
              <li
                key={i}
                tabIndex={0}
                ref={(el) => {
                  if (selectedFrame === i && el) {
                    elementToFocus.current = el;
                  }
                }}
                className={`hover:bg-gray-300 cursor-pointer px-2 py-1 flex justify-between ${
                  selectedFrame === i ? "bg-green-200" : ""
                } ${grey ? "bg-gray-200" : ""} ${
                  !showOnlyFramesets &&
                  isBaseFrame === i &&
                  i < numFrames - looseFrames
                    ? "bg-yellow-100"
                    : ""
                }`}
                onKeyDown={(evt) => {
                  evt.preventDefault();
                  if (evt.key === "ArrowDown") {
                    if (i >= numFrames - looseFrames) {
                      setFrame(selectedFrame + 1);
                    } else {
                      selectBaseFrame(selectedFrame + 1);
                    }
                  } else if (evt.key === "ArrowUp") {
                    if (i >= numFrames - looseFrames) {
                      setFrame(selectedFrame - 1);
                    } else {
                      selectBaseFrame(selectedFrame - 1);
                    }
                  } else if (evt.key === "PageUp") {
                    const f = selectedFrame - 17;
                    if (f < 0) {
                      if (
                        Math.floor(numFrames / 17) * 17 +
                          (selectedBaseFrame % 17) >
                        numFrames
                      ) {
                        setFrame(
                          Math.floor(numFrames / 17) * 16 +
                            (selectedBaseFrame % 17)
                        );
                      } else {
                        setFrame(
                          Math.floor(numFrames / 17) * 17 +
                            (selectedBaseFrame % 17)
                        );
                      }
                      // setFrame(selectedBaseFrame);
                    } else {
                      setFrame(f);
                    }
                  } else if (evt.key === "PageDown") {
                    const f = selectedFrame + 17;
                    if (f > blockFrameCount) {
                      setFrame(selectedBaseFrame % 17);
                    } else {
                      setFrame(f);
                    }
                  }
                  setFocusElement(true);
                }}
                onClick={() => {
                  if (i >= numFrames - looseFrames) {
                    setFrame(i);
                  } else {
                    selectBaseFrame(i);
                  }
                }}
              >
                <span>{i}</span>{" "}
                <span className="italic text-sm">{i % 17}</span>
              </li>
            ) : null;
          })}
        </ul>
      </section>
    </aside>
  );
};

export default connect(
  (state) => ({
    selectedFrame: state.iscript.frame,
    selectedBaseFrame: state.iscript.baseFrame,
    blockFrameCount: state.iscript.blockFrameCount,
  }),
  (dispatch) => ({
    selectBaseFrame: (frame) => dispatch(baseFrameSelected(frame)),
    setFrame: (frame) => dispatch(frameSelected(frame)),
  })
)(Frames);
