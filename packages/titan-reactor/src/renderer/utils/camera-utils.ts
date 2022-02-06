import CameraControls from "camera-controls";
import { Box3, PerspectiveCamera, Vector3 } from "three";
import { easePoly } from "d3-ease";
import { CameraMouse } from "../input/camera-mouse";
import { CameraKeys } from "../input/camera-keys";

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

export const constrainControls = (controls: CameraControls, cameraMouse: CameraMouse, cameraKeys: CameraKeys, camera: PerspectiveCamera, mapWidth: number, mapHeight: number) => {
  camera.zoom = 1;
  camera.fov = 15;
  camera.updateProjectionMatrix();

  camera.userData.battleCam = false;
  cameraMouse.wheelDollyEnabled = true;
  cameraMouse.lookAtMouseEnabled = false;
  cameraMouse.edgeScrollEnabled = true;

  controls.mouseButtons.left = CameraControls.ACTION.NONE;
  controls.mouseButtons.shiftLeft = CameraControls.ACTION.NONE;
  controls.mouseButtons.middle = CameraControls.ACTION.NONE;
  controls.mouseButtons.wheel = CameraControls.ACTION.NONE;
  controls.mouseButtons.right = CameraControls.ACTION.TRUCK;

  controls.dollyToCursor = true;
  controls.verticalDragToForward = true;

  controls.maxDistance = Math.max(mapWidth, mapHeight);
  controls.minDistance = 20;
  controls.dollySpeed = 0.2
  controls.setBoundary(new Box3(new Vector3(-mapWidth / 2, 0, -mapHeight / 2), new Vector3(mapWidth / 2, 0, mapHeight / 2)));

  controls.maxPolarAngle = POLAR_MAX;
  controls.minPolarAngle = POLAR_MIN;
  controls.maxAzimuthAngle = 0;
  controls.minAzimuthAngle = 0;
  controls.dampingFactor = 0.05;

  controls.cancel();
  controls.normalizeRotations();
  controls.updateCameraUp();
  controls.rotatePolarTo(POLAR_MIN, false);
  controls.rotateAzimuthTo(0, false);
  controls.zoomTo(1, false);
  controls.dollyTo(80, false);
}

export const constrainControlsBattleCam = (controls: CameraControls, cameraMouse: CameraMouse, cameraKeys: CameraKeys, camera: PerspectiveCamera, mapWidth: number, mapHeight: number) => {
  camera.fov = 115;
  camera.updateProjectionMatrix();

  camera.userData.battleCam = true;
  cameraMouse.wheelDollyEnabled = false;
  cameraMouse.lookAtMouseEnabled = true;
  cameraMouse.edgeScrollEnabled = false;

  controls.mouseButtons.left = CameraControls.ACTION.NONE;
  controls.mouseButtons.shiftLeft = CameraControls.ACTION.NONE;
  controls.mouseButtons.middle = CameraControls.ACTION.NONE;
  controls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
  controls.mouseButtons.right = CameraControls.ACTION.NONE;

  controls.dollyToCursor = false;

  //@ts-ignore unset boundary using undefined as per docs
  controls.setBoundary();

  controls.maxDistance = Math.max(mapWidth, mapHeight) * 2;
  controls.minDistance = 3;
  controls.dollySpeed = 1;
  controls.maxZoom = 10;
  controls.minZoom = 0.3;
  controls.dampingFactor = 0.01;

  controls.maxPolarAngle = Infinity;
  controls.minPolarAngle = -Infinity
  controls.maxAzimuthAngle = Infinity;
  controls.minAzimuthAngle = -Infinity;

  controls.cancel();
  controls.normalizeRotations();
  controls.updateCameraUp();
  controls.rotatePolarTo(BATTLE_POLAR_MIN, false);
  controls.rotateAzimuthTo(0, false);
  controls.dollyTo(8, false);
  controls.zoomTo(2, false);
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

const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;

export function calculateVerticalFoV(horizontalFoV: number, aspect = 16 / 9) {

  return Math.atan(Math.tan(horizontalFoV * DEG2RAD * 0.5) / aspect) * RAD2DEG * 2.0;

}

export function calculateHorizontalFoV(verticalFoV: number, aspect = 16 / 9) {

  return Math.atan(Math.tan(verticalFoV * DEG2RAD * 0.5) * aspect) * RAD2DEG * 2.0;

}