import { useState } from "react";
import { ImageDAT } from "common/types";
import { iscriptHeaders } from "common/enums";
import { setBlock } from "../stores";
import { useGameStore } from "@stores/game-store";

export const AnimationBlocks = ({ image }: { image: ImageDAT }) => {
  const [expanded, setExpanded] = useState(false);
  const bwDat = useGameStore((state) => state.assets!.bwDat);

  const iscriptAnimations = {
    header: 0,
    offsets: bwDat.iscript.iscripts[image.iscript].offsets,
  };

  const toggleIscript = () => {
    setExpanded(!expanded);
    if (!expanded) {
      setBlock(image, iscriptAnimations.offsets[0], 0);
    }
  };

  return (
    <ul>
      <li onClick={() => toggleIscript()}>
        <p className="p-2 bg-gray-300 cursor-pointer hover:bg-gray-200 flex items-center justify-between">
          <span
            className="rounded-lg px-1 bg-gray-400 ml-2 mr-1 text-sm"
            aria-label={`Image #${image.index}`}
            data-balloon-pos="down"
          >
            {image.index}
          </span>
          <span aria-label={`${image.grpFile}`} data-balloon-pos="down">
            <span>{image.name}</span>
          </span>
        </p>
        {expanded && (
          <ul className="px-2">
            {iscriptAnimations.offsets.map((offset: number, i: number) => {
              return (
                <li
                  key={i}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setBlock(image, offset, i);
                  }}
                >
                  <span className={offset ? "font-bold" : ""}>
                    {iscriptHeaders[i]}
                  </span>
                  <ul>{}</ul>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    </ul>
  );
};
export default AnimationBlocks;

//@todo overlays
//   grp: 1
// gfxTurns: 1
// clickable: 1
// useFullIscript: 1
// drawIfCloaked: 1
// drawFunction: "Normal Draw"
// remapping: 0
// iscript: 0
// shieldOverlay: "protoss\mshield.los"
// attackOverlay: null
// damageOverlay: null
// specialOverlay: null
// landingDustOverlay: null
// liftOffDustOverlay: null
// index: 0
// grpFile: "zerg\avenger.grp"
