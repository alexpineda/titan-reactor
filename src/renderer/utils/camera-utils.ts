import CameraControls from "camera-controls";
import { Box3, MathUtils, Object3D, PerspectiveCamera, Vector3 } from "three";
import { imageIsFlipped } from "./image-utils";
import { ImageStruct } from "common/types";

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

export function applyCameraDirectionToImageFrameOffset(cameraDirection: number, image: ImageStruct) {
  const flipped = imageIsFlipped(image);
  const direction = flipped ? 32 - image.frameIndexOffset : image.frameIndexOffset;
  _imageFrameInfo.frame = (direction + cameraDirection) % 32;
  _imageFrameInfo.flipped = _imageFrameInfo.frame > 16;
  return _imageFrameInfo;
}

export function applyCameraDirectionToImageFrame(cameraDirection: number, image: ImageStruct) {
  const newFrameOffset = applyCameraDirectionToImageFrameOffset(cameraDirection, image);

  if (_imageFrameInfo.flipped) {
    _imageFrameInfo.frame = image.frameIndexBase + 32 - newFrameOffset.frame;
  } else {
    _imageFrameInfo.frame = image.frameIndexBase + newFrameOffset.frame;
  }
  return _imageFrameInfo;
}

// https://codepen.io/discoverthreejs/pen/vwVeZB
const _position = new Vector3();
const _direction = new Vector3();
const _box = new Box3();
const _boxSize = new Vector3();
const _boxCenter = new Vector3();

export const zoomCameraToSelection = async (camera: PerspectiveCamera, controls: CameraControls, selection: Object3D[] | Object3D, fitRatio = 1.2) => {

  if (selection instanceof Object3D) {
    _box.expandByObject(selection);
  } else {
    for (const object of selection) _box.expandByObject(object);
  }

  _box.getSize(_boxSize);
  _box.getCenter(_boxCenter);

  const maxSize = Math.max(_boxSize.x, _boxSize.y, _boxSize.z);
  const fitHeightDistance =
    maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitRatio * Math.max(fitHeightDistance, fitWidthDistance);

  const direction = controls.getTarget(_direction)
    .sub(camera.position)
    .normalize()
    .multiplyScalar(distance);

  _position.copy(_boxCenter).sub(direction);
  controls.setLookAt(_position.x, _position.y, _position.z, _boxCenter.x, _boxCenter.y, _boxCenter.z, false);

  return distance;
}