import { Matrix3 } from "three";

type Matrix3LevelArgs = [number, number, number, number, number, number, number];

export const transformLevelConfiguration = (
    elevationLevels: number[],
    normalizeLevels: boolean
) => {
    const levelsMtx = new Matrix3();
    const max = elevationLevels.reduce( ( memo, val ) => ( val > memo ? val : memo ), 0 );
    const normalLevels = elevationLevels.map( ( v ) => ( normalizeLevels ? v / max : v ) );

    levelsMtx.set( ...( normalLevels as Matrix3LevelArgs ), 0, 0 );
    return levelsMtx;
};
