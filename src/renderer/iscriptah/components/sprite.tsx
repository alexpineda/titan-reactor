import { useCallback } from "react";
import AnimationBlocks from "./animation-blocks";
import calculateImagesFromIscript from "../../iscript/images-from-iscript";

import { useGameStore } from "@stores/game-store";
import { SpriteDAT } from "common/types";

const Sprite = ({
  sprite,
  onClick,
}: {
  sprite: SpriteDAT;
  onClick: () => void;
}) => {
  const bwDat = useGameStore((state) => state.assets?.bwDat);
  if (!bwDat) {
    throw new Error("No bwDat loaded");
  }

  const imagesFromIscript = useCallback(() => {
    return [...calculateImagesFromIscript(bwDat, sprite.image, null)];
  }, [bwDat, sprite]);

  return (
    <div>
      <p
        className="text-lg mt-4 mb-1 text-blue-800 font-medium hover:bg-gray-300 cursor-pointer"
        onClick={onClick}
      >
        <span>{sprite.name}</span>
        <span
          className="rounded-lg px-1 bg-gray-400 ml-2 mr-1 text-sm"
          aria-label={`unit #${sprite.index}`}
          data-balloon-pos="down"
        >
          {sprite.index}
        </span>
      </p>
      {imagesFromIscript().map((i) => (
        <AnimationBlocks key={i} image={bwDat.images[i]} />
      ))}
    </div>
  );
};

export default Sprite;
