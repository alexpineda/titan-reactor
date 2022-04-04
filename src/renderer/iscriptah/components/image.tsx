import { useCallback } from "react";
import AnimationBlocks from "./animation-blocks";
import calculateImagesFromIscript from "../../iscript/images-from-iscript";
import { ImageDAT } from "common/types";
import { useGameStore } from "@stores/game-store";

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
      <p
        className="text-lg mt-4 mb-1 text-blue-800 font-medium hover:bg-gray-300 cursor-pointer"
        onClick={onClick}
      >
        <span>{image.name}</span>
        <span
          className="rounded-lg px-1 bg-gray-400 ml-2 mr-1 text-sm"
          aria-label={`unit #${image.index}`}
          data-balloon-pos="down"
        >
          {image.index}
        </span>
      </p>
      {imagesFromIscript().map((i: number) => (
        <AnimationBlocks key={i} image={bwDat.images[i]} />
      ))}
    </div>
  );
};

export default Image;
