import React, { useCallback } from "react";
import AnimationBlocks from "./AnimationBlocks";
import calculateImagesFromIscript from "titan-reactor-shared/image/calculateImagesFromIScript";

const Image = ({ image, bwDat, ...props }) => {
  const imagesFromIscript = useCallback(() => {
    return [...calculateImagesFromIscript(bwDat, image, null)];
  }, [bwDat, image]);

  return (
    <div>
      <p
        className="text-lg mt-4 mb-1 text-blue-800 font-medium hover:bg-gray-300 cursor-pointer"
        {...props}
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
      {imagesFromIscript().map((i) => (
        <AnimationBlocks key={i} image={bwDat.images[i]} bwDat={bwDat} />
      ))}
      {/* <AnimationBlocks label="" image={sprite.image} bwDat={bwDat} /> */}
    </div>
  );
};

export default Image;
