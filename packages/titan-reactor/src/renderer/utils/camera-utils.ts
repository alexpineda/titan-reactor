import CameraControls from "camera-controls";
import { PerspectiveCamera, Vector3 } from "three";
import { easePoly, easeExpIn } from "d3-ease";

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


export const getDOFFocalLength = (camera: PerspectiveCamera, polarAngle: number) => {
  const cy = (Math.max(20, Math.min(90, camera.position.y)) - 20) / 70;

  const cz = 1 - (Math.max(22, Math.min(55, camera.fov)) - 22) / 33;
  const min = cz * 0.2 + 0.1;

  const ey = easePoly(cy);
  const pa = 1 - Math.max(0.2, Math.min(1, 0)); // cameras.control.polarAngle));
  const cx = ey * pa;
  const o = cx * (1 - min) + min;

  return o;
}