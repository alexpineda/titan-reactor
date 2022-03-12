import CameraControls from "camera-controls";
import { Box3, MathUtils, PerspectiveCamera, Vector3 } from "three";
import type { CameraMouse } from "../input/camera-mouse";
import type { CameraKeys } from "../input/camera-keys";
import type CameraShake from "../camera/camera-shake";
import { MinimapMouse } from "../input";

const DEFAULT_FAR = 1000;
const BATTLE_FAR = 1000;

type Controls = {
  standard: CameraControls,
  mouse: CameraMouse,
  keys: CameraKeys,
  cameraShake: CameraShake,
  dispose: () => void,
  enableAll: () => void,
  disableAll: () => void
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

const setBoundary = (controls: Controls, mapWidth: number, mapHeight: number) => {
  controls.standard.setBoundary(new Box3(new Vector3(-mapWidth / 2, 0, -mapHeight / 2), new Vector3(mapWidth / 2, 0, mapHeight / 2)));
};

export const constrainControls = async (controls: Controls, minimapMouse: MinimapMouse, camera: PerspectiveCamera, mapWidth: number, mapHeight: number) => {
  minimapMouse.enabled = true;

  controls.enableAll();
  controls.cameraShake.enabled = false;

  camera.far = DEFAULT_FAR;
  camera.zoom = 1;
  camera.fov = 15;
  camera.updateProjectionMatrix();

  controls.standard.mouseButtons.left = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.shiftLeft = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.middle = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.wheel = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.right = CameraControls.ACTION.NONE;

  controls.standard.dollyToCursor = true;
  controls.standard.verticalDragToForward = true;

  controls.standard.maxDistance = Math.max(mapWidth, mapHeight);
  controls.standard.minDistance = 20;
  controls.standard.dollySpeed = 0.2

  controls.standard.maxPolarAngle = POLAR_MAX;
  controls.standard.minPolarAngle = POLAR_MIN;
  controls.standard.maxAzimuthAngle = 0;
  controls.standard.minAzimuthAngle = 0;
  controls.standard.dampingFactor = 0.05;

  setBoundary(controls, mapWidth, mapHeight);

  await controls.standard.rotatePolarTo(POLAR_MIN, false);
  await controls.standard.rotateAzimuthTo(0, false);
  await controls.standard.zoomTo(1, false);
  await controls.standard.dollyTo(80, false);
}

export const constrainControlsBattleCam = async (controls: Controls, minimapMouse: MinimapMouse, camera: PerspectiveCamera, mapWidth: number, mapHeight: number) => {
  minimapMouse.enabled = false;
  controls.enableAll();

  camera.far = BATTLE_FAR;
  camera.fov = 75;
  camera.updateProjectionMatrix();

  controls.standard.mouseButtons.left = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.shiftLeft = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.middle = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.wheel = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.right = CameraControls.ACTION.NONE;

  controls.standard.dollyToCursor = false;

  //@ts-ignore unset boundary using undefined as per docs
  setBoundary(controls, mapWidth, mapHeight);

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

  await controls.standard.dollyTo(15, false);
  await controls.standard.zoomTo(1, false);
}

export const constrainControlsOverviewCam = async (controls: Controls, minimapMouse: MinimapMouse, camera: PerspectiveCamera, mapWidth: number, mapHeight: number) => {
  minimapMouse.enabled = false;

  controls.disableAll();
  controls.mouse.enabled = true;

  controls.standard.setBoundary(undefined);
  controls.standard.mouseButtons.left = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.shiftLeft = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.middle = CameraControls.ACTION.ZOOM;
  controls.standard.mouseButtons.wheel = CameraControls.ACTION.NONE;
  controls.standard.mouseButtons.right = CameraControls.ACTION.NONE;

  camera.far = DEFAULT_FAR;
  camera.fov = 15;
  camera.updateProjectionMatrix();
  controls.standard.setLookAt(0, Math.max(mapWidth, mapHeight) * 4, 0, 0, 0, 0, false);
  await controls.standard.zoomTo(1, false);
}

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