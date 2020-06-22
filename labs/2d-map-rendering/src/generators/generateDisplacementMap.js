import Chk from "bw-chk";

const elevations = [0, 0.4, 0.79, 0.85, 1];
const detailsRatio = 0.85;
const walkableLayerBlur = 64;
const allLayersBlur = 8;

export const generateDisplacementMap = (bwDataPath, scmData) => {
  const chk = new Chk(scmData);
  console.log("chk", chk);
  const width = chk.size[0] * 32;
  const height = chk.size[1] * 32;
  const fileAccess = Chk.fsFileAccess(bwDataPath);

  return chk
    .image(fileAccess, width, height, {
      mode: "displacement",
      startLocations: false,
      sprites: false,
      displacement: {
        elevations,
        detailsRatio,
        skipDetails: true,
        onlyWalkable: true,
        tint: [1, 1, 1],
      },
      postProcess: {
        blendNonZeroPixels: true,
        gaussianBlur: walkableLayerBlur,
      },
    })
    .then((data) =>
      chk.image(
        fileAccess,
        width,
        height,
        {
          mode: "displacement",
          startLocations: false,
          sprites: false,
          displacement: {
            elevations,
            detailsRatio,
            skipWalkable: true,
            tint: [1, 1, 1],
          },
          postProcess: {
            blendNonZeroPixels: false,
            gaussianBlur: allLayersBlur,
          },
        },
        data
      )
    )
    .then((data) => ({
      data,
      width,
      height,
    }));
};
