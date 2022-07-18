import CameraControls from "camera-controls";
import { Box3, Camera, MathUtils, Object3D, PerspectiveCamera, Vector3, Vector4 } from "three";
import type { CameraMouse } from "../input/camera-mouse";
import type { CameraKeys } from "../input/camera-keys";
import type CameraShake from "../camera/camera-shake";
import { CameraModePlugin } from "../input/camera-mode";
import { imageIsFlipped } from "./image-utils";
import { ImageStruct } from "common/types";
import DirectionalCamera from "../camera/directional-camera";

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

const _imageFrameInfo = {
  frame: 0,
  flipped: false
};

export function applyCameraDirectionToImageFrameOffset(camera: DirectionalCamera, image: ImageStruct) {
  const flipped = imageIsFlipped(image);
  const direction = flipped ? 32 - image.frameIndexOffset : image.frameIndexOffset;
  _imageFrameInfo.frame = (direction + camera.userData.direction) % 32;
  _imageFrameInfo.flipped = _imageFrameInfo.frame > 16;
  return _imageFrameInfo;
}

export function applyCameraDirectionToImageFrame(camera: DirectionalCamera, image: ImageStruct) {
  const newFrameOffset = applyCameraDirectionToImageFrameOffset(camera, image);

  if (_imageFrameInfo.flipped) {
    _imageFrameInfo.frame = image.frameIndexBase + 32 - newFrameOffset.frame;
  } else {
    _imageFrameInfo.frame = image.frameIndexBase + newFrameOffset.frame;
  }
  return _imageFrameInfo;
}

// https://codepen.io/discoverthreejs/pen/vwVeZB
const _target = new Vector3();
export const zoomCameraToSelection = (camera: PerspectiveCamera, controls: CameraControls, selection: Object3D[], fitRatio = 1.2) => {
  const box = new Box3();

  for (const object of selection) box.expandByObject(object);

  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());

  const maxSize = Math.max(size.x, size.y, size.z);
  const fitHeightDistance =
    maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitRatio * Math.max(fitHeightDistance, fitWidthDistance);

  controls.getTarget(_target)
  const direction = _target
    .clone()
    .sub(camera.position)
    .normalize()
    .multiplyScalar(distance);

  // controls.maxDistance = distance * 10;
  controls.setTarget(center.x, center.y, center.z);

  center.sub(direction);
  controls.moveTo(center.x, center.y, center.z);

  // camera.near = distance / 100;
  // camera.far = distance * 100;
  // camera.updateProjectionMatrix();

  // camera.position.copy(controls.target).sub(direction);
  return distance;
}