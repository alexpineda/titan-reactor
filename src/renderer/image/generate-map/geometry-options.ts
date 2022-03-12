
export const defaultOptions = {
    //low, walkable, mid, mid-walkable, high, high-walkable, mid/high/walkable
    elevationLevels: [0, 0.05, 0.25, 0.25, 0.4, 0.4, 0.25],
    ignoreLevels: [0, 1, 0, 1, 0, 1, 0],
    normalizeLevels: true,
    displaceDimensionScale: 16,
    displaceVertexScale: 2,
    blendNonWalkableBase: true,
    firstPass: true,
    secondPass: true,
    processWater: true,
    displacementScale: 4,
    drawMode: { value: 1 },
    detailsMix: 0.05,
    bumpScale: 0.1,
    firstBlur: 4,
};

export type GeometryOptions = {
    elevationLevels: number[];
    ignoreLevels: number[];
    normalizeLevels: boolean;
    displaceDimensionScale: number;
    displaceVertexScale: number;
    blendNonWalkableBase: boolean;
    firstPass: boolean;
    secondPass: boolean;
    processWater: boolean;
    displacementScale: number;
    drawMode: { value: number };
    detailsMix: number;
    bumpScale: number;
    firstBlur: number;
}