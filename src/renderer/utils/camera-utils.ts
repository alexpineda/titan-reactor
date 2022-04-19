import CameraControls from "camera-controls";
import { Box3, Camera, MathUtils, Vector3, Vector4 } from "three";
import type { CameraMouse } from "../input/camera-mouse";
import type { CameraKeys } from "../input/camera-keys";
import type CameraShake from "../camera/camera-shake";
import { CameraModePlugin } from "../input/camera-mode";

export type Controls = {
  orbit: CameraControls,
  mouse: CameraMouse,
  keys: CameraKeys,
  cameraShake: CameraShake,
  cameraMode: CameraModePlugin,
  PIP: {
    enabled: boolean;
    camera: Camera;
    viewport: Vector4;
  }
}

export const getDirection32 = (target: Vector3, cameraPosition: Vector3) => {
  const adj = target.z - cameraPosition.z;
  const opp = target.x - cameraPosition.x;
  const a = Math.atan2(opp, adj) / Math.PI;

  if (a < 0) {
    return Math.floor((a + 2) * 16 + 16);
  } else {
    return Math.floor(a * 16 + 16);
  }
}

export const POLAR_MAX = (10 * Math.PI) / 64;
export const POLAR_MIN = (2 * Math.PI) / 64;
export const AZI_RANGE = (24 * Math.PI) / 64;

export const BATTLE_POLAR_MAX = (20 * Math.PI) / 64;
export const BATTLE_POLAR_MIN = (Math.PI) / 64;

export const setBoundary = (orbit: CameraControls, mapWidth: number, mapHeight: number) => {
  orbit.setBoundary(new Box3(new Vector3(-mapWidth / 2, 0, -mapHeight / 2), new Vector3(mapWidth / 2, 0, mapHeight / 2)));
};


export const constrainAzimuth = (polarAngle: number) => {
  const np = (polarAngle - POLAR_MIN) / (POLAR_MAX - POLAR_MIN);
  return (np * np * AZI_RANGE);
}

export function calculateVerticalFoV(horizontalFoV: number, aspect = 16 / 9) {

  return Math.atan(Math.tan(horizontalFoV * MathUtils.DEG2RAD * 0.5) / aspect) * MathUtils.RAD2DEG * 2.0;

}

export function calculateHorizontalFoV(verticalFoV: number, aspect = 16 / 9) {

  return Math.atan(Math.tan(verticalFoV * MathUtils.DEG2RAD * 0.5) * aspect) * MathUtils.RAD2DEG * 2.0;

}