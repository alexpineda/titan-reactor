import { pack } from "../../../libs/pack";

onmessage = function ({ data }) {
  const { boxes, textureSize, bucketId } = data;
  const result = pack(boxes, {
    maxWidth: textureSize,
    maxHeight: textureSize,
    method: 3,
    rotate: false,
  });

  postMessage({
    result,
    bucketId,
  });
};
