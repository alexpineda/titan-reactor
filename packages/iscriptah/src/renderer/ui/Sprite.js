import React, { useCallback } from "react";
import AnimationBlocks from "./AnimationBlocks";
import calculateImagesFromIscript from "titan-reactor-shared/image/calculateImagesFromIScript";

const Sprite = ({ sprite, bwDat, ...props }) => {
  const imagesFromIscript = useCallback(() => {
    return [...calculateImagesFromIscript(bwDat, sprite.image, null)];
  }, [bwDat, sprite]);

  return (
    <div>
      <p
        className="text-lg mt-4 mb-1 text-blue-800 font-medium hover:bg-gray-300 cursor-pointer"
        {...props}
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
        <AnimationBlocks key={i} image={bwDat.images[i]} bwDat={bwDat} />
      ))}
      {/* <AnimationBlocks label="" image={sprite.image} bwDat={bwDat} /> */}
    </div>
  );
};

export default Sprite;
