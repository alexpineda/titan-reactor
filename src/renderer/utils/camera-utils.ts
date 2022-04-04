import CameraControls from "camera-controls";
import { Box3, Camera, MathUtils, PerspectiveCamera, Vector3, Vector4 } from "three";
import type { CameraMouse } from "../input/camera-mouse";
import type { CameraKeys } from "../input/camera-keys";
import type CameraShake from "../camera/camera-shake";
import { MinimapMouse } from "../input";
import { CameraMode } from "../input/camera-mode";

const DEFAULT_FAR = 256;
const OVERVIEW_FAR = 1000;
const BATTLE_FAR = 128;

export type Controls = {
  orbit: CameraControls,
  mouse: CameraMouse,
  keys: CameraKeys,
  cameraShake: CameraShake,
  cameraMode: CameraMode,
  PIP: {
    enabled: boolean;
    camera: Camera;
    viewport: Vector4;
  }
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
  controls.orbit.setBoundary(new Box3(new Vector3(-mapWidth / 2, 0, -mapHeight / 2), new Vector3(mapWidth / 2, 0, mapHeight / 2)));
};

export const constrainControls = async (controls: Controls, minimapMouse: MinimapMouse, camera: PerspectiveCamera, mapWidth: number, mapHeight: number) => {
  minimapMouse.enabled = true;

  controls.enableAll();
  controls.cameraShake.enabled = false;
  controls.orbit.boundaryFriction = 1;

  camera.far = DEFAULT_FAR;
  camera.zoom = 1;
  camera.fov = 15;
  camera.updateProjectionMatrix();

  controls.orbit.mouseButtons.left = CameraControls.ACTION.NONE;
  controls.orbit.mouseButtons.shiftLeft = CameraControls.ACTION.NONE;
  controls.orbit.mouseButtons.middle = CameraControls.ACTION.NONE;
  controls.orbit.mouseButtons.wheel = CameraControls.ACTION.NONE;
  controls.orbit.mouseButtons.right = CameraControls.ACTION.NONE;

  controls.orbit.dollyToCursor = true;
  controls.orbit.verticalDragToForward = true;

  controls.orbit.maxDistance = DEFAULT_FAR;
  controls.orbit.minDistance = 20;
  controls.orbit.dollySpeed = 0.2

  controls.orbit.maxPolarAngle = POLAR_MAX;
  controls.orbit.minPolarAngle = POLAR_MIN;
  controls.orbit.maxAzimuthAngle = 0;
  controls.orbit.minAzimuthAngle = 0;
  controls.orbit.dampingFactor = 0.05;

  setBoundary(controls, mapWidth, mapHeight);

  await controls.orbit.rotatePolarTo(POLAR_MIN, false);
  await controls.orbit.rotateAzimuthTo(0, false);
  await controls.orbit.zoomTo(1, false);
  await controls.orbit.dollyTo(80, false);
}

export const constrainControlsBattleCam = async (controls: Controls, minimapMouse: MinimapMouse, camera: PerspectiveCamera, mapWidth: number, mapHeight: number) => {
  minimapMouse.enabled = false;
  controls.enableAll();

  camera.far = BATTLE_FAR;
  camera.fov = 85;
  camera.updateProjectionMatrix();
  controls.orbit.boundaryFriction = 0;

  controls.orbit.mouseButtons.left = CameraControls.ACTION.NONE;
  controls.orbit.mouseButtons.shiftLeft = CameraControls.ACTION.NONE;
  controls.orbit.mouseButtons.middle = CameraControls.ACTION.NONE;
  controls.orbit.mouseButtons.wheel = CameraControls.ACTION.NONE;
  controls.orbit.mouseButtons.right = CameraControls.ACTION.NONE;

  controls.orbit.dollyToCursor = false;

  setBoundary(controls, mapWidth, mapHeight);

  controls.orbit.maxDistance = Math.max(mapWidth, mapHeight) * 2;
  controls.orbit.minDistance = 3;
  controls.orbit.dollySpeed = 1;
  controls.orbit.maxZoom = 20;
  controls.orbit.minZoom = 0.3;
  controls.orbit.dampingFactor = 0.01;

  controls.orbit.maxPolarAngle = Infinity;
  controls.orbit.minPolarAngle = -Infinity
  controls.orbit.maxAzimuthAngle = Infinity;
  controls.orbit.minAzimuthAngle = -Infinity;

  await controls.orbit.dollyTo(13, false);
  await controls.orbit.zoomTo(1, false);
}

export const constrainControlsOverviewCam = async (controls: Controls, minimapMouse: MinimapMouse, camera: PerspectiveCamera, mapWidth: number, mapHeight: number) => {
  minimapMouse.enabled = false;

  controls.disableAll();
  controls.mouse.enabled = true;
  controls.orbit.boundaryFriction = 0;

  controls.orbit.setBoundary(undefined);
  controls.orbit.mouseButtons.left = CameraControls.ACTION.NONE;
  controls.orbit.mouseButtons.shiftLeft = CameraControls.ACTION.NONE;
  controls.orbit.mouseButtons.middle = CameraControls.ACTION.ZOOM;
  controls.orbit.mouseButtons.wheel = CameraControls.ACTION.NONE;
  controls.orbit.mouseButtons.right = CameraControls.ACTION.NONE;

  camera.far = OVERVIEW_FAR;
  camera.fov = 15;
  camera.updateProjectionMatrix();
  controls.orbit.setLookAt(0, Math.max(mapWidth, mapHeight) * 4, 0, 0, 0, 0, false);
  await controls.orbit.zoomTo(1, false);
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