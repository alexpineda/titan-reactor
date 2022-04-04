import { useCallback } from "react";
import AnimationBlocks from "./animation-blocks";
import calculateImagesFromIscript from "../../iscript/images-from-iscript";

import { useGameStore } from "@stores/game-store";
import { UnitDAT } from "common/types";

const Unit = ({
  unit,
  expanded,
  onClick,
}: {
  unit: UnitDAT;
  expanded: boolean;
  onClick: () => void;
}) => {
  const bwDat = useGameStore((state) => state.assets?.bwDat);
  if (!bwDat) {
    throw new Error("No bwDat loaded");
  }

  //@todo support subunit
  // const subUnit1 = unit.subUnit1 !== 228 ? bwDat.units[unit.subUnit1] : null;
  // const subUnit2 = unit.subUnit2 !== 228 ? bwDat.units[unit.subUnit2] : null;

  const imagesFromIscript = useCallback(() => {
    return [
      ...calculateImagesFromIscript(bwDat, unit.flingy.sprite.image, unit),
    ];
  }, [bwDat, unit]);

  return (
    <div>
      <p
        className="text-lg mt-4 mb-1 text-blue-800 font-medium hover:bg-gray-300 cursor-pointer"
        onClick={onClick}
      >
        <span>{unit.name}</span>
        <span
          className="rounded-lg px-1 bg-gray-400 ml-2 mr-1 text-sm"
          aria-label={`Unit #${unit.index}`}
          data-balloon-pos="down"
        >
          {unit.index}
        </span>
      </p>
      {expanded && (
        <>
          {imagesFromIscript().map((i) => {
            return <AnimationBlocks key={i} image={bwDat.images[i]} />;
          })}

          {/* {subUnit1 && <Unit unit={subUnit1} dispatch={dispatch} bwDat={bwDat} />} */}
          {/* 
      {subUnit2 && (
        <>
          <p>subunit2</p>
          <Unit unit={subUnit2} dispatch={dispatch} bwDat={bwDat} />
        </>
      )} */}
          {/* {subUnit1 && makeImage(subUnit1, "sub unit")}
      {subUnit2 && makeImage(subUnit2, "sub unit")} */}
        </>
      )}
    </div>
  );
};

export default Unit;
