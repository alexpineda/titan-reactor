import React from "react";
import { actionFrameOffset } from "../state/actions";

export const Frameset = ({
  frameset,
  frames,
  grpFrame,
  expanded,
  setExpand,
  mouseDown,
  setMouseDown,
  onMouseMove,
  onMouseUp,
  inConstraintRange,
  currentCanvas,
  dispatch,
}) => {
  return (
    <div
      onMouseMove={() => {
        if (mouseDown) {
          onMouseMove(frameset);
        }
      }}
      onMouseUp={() => {
        onMouseUp();
      }}
    >
      <div
        className="cursor-pointer select-none"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (expanded) {
            setExpand(null);
          } else {
            setExpand(frameset);
          }
        }}
      >
        <span>Frameset #{frameset}</span>{" "}
        <span>{expanded ? <>&#9650;</> : <>&#9660;</>}</span>
      </div>
      <div
        onMouseDown={() => {
          if (mouseDown) return;
          setMouseDown(frameset);
        }}
        className={`w-full ${inConstraintRange && "bg-green-100"}`}
      >
        {currentCanvas}
      </div>
      {expanded &&
        frames.map((frame, i) => {
          return (
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={() => {
                dispatch(actionFrameOffset(i));
              }}
              key={i}
              className={`${
                grpFrame === i + frameset * 17 ? "outline-black" : ""
              }`}
            >
              <p className="absolute">{i + frameset * 17 + 1}</p>
              {frame}
            </div>
          );
        })}
    </div>
  );
};
