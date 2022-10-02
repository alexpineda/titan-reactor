import { useCallback } from "react";
import AnimationBlocks from "./animation-blocks";
import calculateImagesFromIscript from "@utils/images-from-iscript";
import { ImageDAT } from "common/types";
import { useGameStore } from "@stores/game-store";
import { LeftListItem } from "./left-list-item";

const Image = ({
  image,
  onClick,
}: {
  image: ImageDAT;
  onClick: () => void;
}) => {
  const bwDat = useGameStore((state) => state.assets?.bwDat);
  if (!bwDat) {
    throw new Error("No bwDat loaded");
  }
  const imagesFromIscript = useCallback(() => {
    return [...calculateImagesFromIscript(bwDat, image, null)];
  }, [bwDat, image]);

  return (
    <div>
      <LeftListItem
        onClick={onClick}
        name={image.name}
        index={image.index}
        label={"Image"}
      />
      {imagesFromIscript().map((i: number) => (
        <AnimationBlocks key={i} image={bwDat.images[i]} />
      ))}
    </div>
  );
};

export default Image;
