import CameraControls from "camera-controls";
import { Box3, MathUtils, PerspectiveCamera, Vector3 } from "three";
import { easePoly } from "d3-ease";
import { CameraMouse } from "../input/camera-mouse";
import { CameraKeys } from "../input/camera-keys";

type Controls = {
  standard: CameraControls,
  mouse: CameraMouse,
  keys: CameraKeys,
  dispose: () => void
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

export const constrainControls = async (controls: Controls, camera: PerspectiveCamera, mapWidth: number, mapHeight: number) => {
  camera.zoom = 1;
  camera.fov = 15;
  camera.updateProjectionMatrix();

  camera.userData.battleCam = false;
  controls.mouse.wheelDollyEnabled = true;
  controls.mouse.lookAtMouseEnabled = false;
  controls.mouse.edgeScrollEnabled = true;
  controls.mouse.battleCam = false;

  controls.keys.battleCam = false;

  controls.standard.mouseButtons.left = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.shiftLeft = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.middle = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.wheel = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.right = CameraControls.ACTION.TRUCK;

  controls.standard.dollyToCursor = true;
  controls.standard.verticalDragToForward = true;

  controls.standard.maxDistance = Math.max(mapWidth, mapHeight);
  controls.standard.minDistance = 20;
  controls.standard.dollySpeed = 0.2
  controls.standard.setBoundary(new Box3(new Vector3(-mapWidth / 2, 0, -mapHeight / 2), new Vector3(mapWidth / 2, 0, mapHeight / 2)));

  controls.standard.maxPolarAngle = POLAR_MAX;
  controls.standard.minPolarAngle = POLAR_MIN;
  controls.standard.maxAzimuthAngle = 0;
  controls.standard.minAzimuthAngle = 0;
  controls.standard.dampingFactor = 0.05;

  await controls.standard.rotatePolarTo(POLAR_MIN, false);
  await controls.standard.rotateAzimuthTo(0, false);
  await controls.standard.zoomTo(1, false);
  await controls.standard.dollyTo(80, false);
}

export const constrainControlsBattleCam = async (controls: Controls, camera: PerspectiveCamera, mapWidth: number, mapHeight: number) => {
  camera.fov = 115;
  camera.updateProjectionMatrix();

  camera.userData.battleCam = true;
  controls.mouse.wheelDollyEnabled = true;
  controls.mouse.lookAtMouseEnabled = true;
  controls.mouse.edgeScrollEnabled = false;
  controls.mouse.battleCam = true;
  controls.keys.battleCam = true;

  controls.standard.mouseButtons.left = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.shiftLeft = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.middle = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.wheel = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.right = CameraControls.ACTION.NONE;

  controls.standard.dollyToCursor = false;

  //@ts-ignore unset boundary using undefined as per docs
  controls.standard.setBoundary(undefined);

  controls.standard.maxDistance = Math.max(mapWidth, mapHeight) * 2;
  controls.standard.minDistance = 3;
  controls.standard.dollySpeed = 1;
  controls.standard.maxZoom = 20;
  controls.standard.minZoom = 0.3;
  controls.standard.dampingFactor = 0.01;

  controls.standard.maxPolarAngle = Infinity;
  controls.standard.minPolarAngle = -Infinity
  controls.standard.maxAzimuthAngle = Infinity;
  controls.standard.minAzimuthAngle = -Infinity;

  await controls.standard.dollyTo(8, false);
  await controls.standard.zoomTo(2, false);
}


export const constrainAzimuth = (polarAngle: number) => {
  const np = (polarAngle - POLAR_MIN) / (POLAR_MAX - POLAR_MIN);
  return (np * np * AZI_RANGE);
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

export function calculateVerticalFoV(horizontalFoV: number, aspect = 16 / 9) {

  return Math.atan(Math.tan(horizontalFoV * MathUtils.DEG2RAD * 0.5) / aspect) * MathUtils.RAD2DEG * 2.0;

}

export function calculateHorizontalFoV(verticalFoV: number, aspect = 16 / 9) {

  return Math.atan(Math.tan(verticalFoV * MathUtils.DEG2RAD * 0.5) * aspect) * MathUtils.RAD2DEG * 2.0;

}