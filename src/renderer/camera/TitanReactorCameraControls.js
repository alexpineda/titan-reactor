import CameraControls from "camera-controls";
import * as THREE from "three";
import CameraShake from "./CameraShake";

CameraControls.install({ THREE: THREE });

class TitanReactorCameraControls extends CameraControls {
  constructor(camera, domElement) {
    super(camera, domElement);
    this.verticalDragToForward = true;
    this.maxDistance = 200;
    this.minDistance = 15;
    this.dampingFactor = 0.2;

    this.maxPolarAngle = Math.PI / 4;
    this.maxAzimuthAngle = Math.PI / 6;
    this.minAzimuthAngle = -Math.PI / 6;

    this.mouseButtons.left = CameraControls.ACTION.NONE;
    this.mouseButtons.right = CameraControls.ACTION.NONE;
    this.mouseButtons.middle = CameraControls.ACTION.ROTATE;
    this.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
    this.dollySpeed = 0.5;
    this.truckSpeed = 0.5;
    this.cameraShake = new CameraShake(this, 500, 10, 1);
  }

  setMapBoundary(width, height) {
    if (width === null) {
      this.boundaryEnclosesCamera = false;
      return;
    }
    this.boundaryEnclosesCamera = true;

    const bb = new THREE.Box3(
      new THREE.Vector3(-width / 2, 0, -height / 2),
      new THREE.Vector3(width / 2, 400, height / 2)
    );
    this.setBoundary(bb);
  }

  startFollowUnit() {}

  followUnit() {}

  shake(strength) {
    if (this.cameraShake.isShaking) return;
    this.cameraShake.strength = strength;
    this.cameraShake.shake();
  }
}

export default TitanReactorCameraControls;
