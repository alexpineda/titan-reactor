import { useCallback } from "react";
import { AnimationBlocks } from "./animation-blocks";
import calculateImagesFromIscript from "@utils/images-from-iscript";

import { useGameStore } from "@stores/game-store";
import { SpriteDAT } from "common/types";
import { LeftListItem } from "./left-list-item";

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
      <LeftListItem
        onClick={onClick}
        name={sprite.name}
        index={sprite.index}
        label={"Sprite"}
      />
      {imagesFromIscript().map((i) => (
        <AnimationBlocks key={i} image={bwDat.images[i]} />
      ))}
    </div>
  );
};

export default Sprite;
