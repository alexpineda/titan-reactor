import CameraControls from "camera-controls";
import { Vector3 } from "three";

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


export const constrainControls = (controls: CameraControls, maxMapDim: number) => {
  controls.maxDistance = maxMapDim * 0.75;
  controls.minDistance = 10;

  controls.dollySpeed = 0.2

  controls.maxPolarAngle = (20 * Math.PI) / 64; // bottom
  controls.minPolarAngle = (2 * Math.PI) / 64; // top
  controls.maxAzimuthAngle = (16 * Math.PI) / 64;
  controls.minAzimuthAngle = -(16 * Math.PI) / 64;
}