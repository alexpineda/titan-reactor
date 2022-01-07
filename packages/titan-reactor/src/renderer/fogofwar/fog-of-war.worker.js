import { TilesBW } from "../integration/fixed-data";
import {
  Explored,
  HideSpeedSlow,
  Visible,
  RevealSpeed,
  Unexplored,
} from "./fog-of-war-shared";

onmessage = function ({ data }) {
  const {
    tileBuffer,
    frame,
    playerVisionFlags,
    imageBuffer,
    enabled,
    playerVisionWasToggled,
    width,
    height,
  } = data;

  const tileData = new Uint8Array(tileBuffer);
  const toBuffer = new Uint8Array(tileBuffer.length / 2);
  const imageData = new ImageData(width, height);

  for (let i = 0; i < toBuffer.length; i++) {
    let val = Unexplored;

    if (~tileData[i * TilesBW.STRUCT_SIZE] & playerVisionFlags) {
      val = Explored;
    }

    if (~tileData[i * TilesBW.STRUCT_SIZE + 1] & playerVisionFlags) {
      val = Visible;
    }

    if (enabled) {
      if (val > imageBuffer[i]) {
        imageBuffer[i] = Math.min(val, imageBuffer[i] + RevealSpeed);
      } else if (val < imageBuffer[i]) {
        imageBuffer[i] = Math.max(val, imageBuffer[i] - HideSpeedSlow);
      }
    }

    toBuffer[i] = val;

    //alpha for minimap
    imageData.data[i * 4 - 1] = Math.max(50, 255 - val);
  }

  if (enabled) {
    //instantly reveal if player vision has toggled
    if (playerVisionWasToggled) {
      for (let i = 0; i < imageBuffer.length; i++) {
        imageBuffer[i] = toBuffer[i];
      }
    }
  }

  postMessage(
    {
      frame,
      toBuffer,
      imageData,
    },
    [toBuffer.buffer]
  );
};
