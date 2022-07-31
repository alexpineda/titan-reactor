import { GeometryOptions } from "common/types";
import { KernelSize } from "postprocessing";

export const defaultGeometryOptions: GeometryOptions = {

    elevationLevels: [0, 0.05, 0.25, 0.25, 0.4, 0.4, 0.25],
    ignoreLevels: [0, 1, 0, 1, 0, 1, 0],
    normalizeLevels: true,
    textureDetail: 16,
    meshDetail: 2,
    maxTerrainHeight: 4,

    blendNonWalkableBase: true,
    firstPass: true,
    secondPass: true,
    processWater: true,
    drawMode: { value: 1 },
    detailsMix: 0,
    bumpScale: 0.1,
    firstBlur: KernelSize.HUGE
};