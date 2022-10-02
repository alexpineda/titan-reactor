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
        <p
          style={{
            padding: "var(--size-2)",
            background: "var(--gray-3)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "var(--font-size-1)",
              borderRadius: "var(--border-size-3)",
              background: "var(--gray-4)",
              padding: "var(--size-1)",
              marginLeft: "var(--size-2)",
              marginRight: "var(--size-1)",
            }}
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
                  style={{
                    padding: "var(--size-2)",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setBlock(image, offset, i);
                  }}
                >
                  <span
                    style={{
                      fontWeight: offset ? "bold" : "normal",
                    }}
                  >
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
