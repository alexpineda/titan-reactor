import CameraControls from "camera-controls";
import * as THREE from "three";
import CameraShake from "./CameraShake";
import InputEvents from "../input/InputEvents";

CameraControls.install({ THREE: THREE });

class TitanReactorCameraControls extends CameraControls {
  constructor(camera, domElement, keyboardShortcuts) {
    super(camera, domElement);

    this.mouseButtons.left = CameraControls.ACTION.NONE;
    this.mouseButtons.right = CameraControls.ACTION.TRUCK;
    this.mouseButtons.middle = CameraControls.ACTION.NONE;
    this.mouseButtons.wheel = CameraControls.ACTION.NONE;

    keyboardShortcuts.addEventListener(
      InputEvents.TruckLeft,
      ({ message: delta }) => {
        this.truck(-0.02 * delta, 0, true);
      }
    );
    keyboardShortcuts.addEventListener(
      InputEvents.TruckRight,
      ({ message: delta }) => {
        this.truck(0.02 * delta, 0, true);
      }
    );
    keyboardShortcuts.addEventListener(
      InputEvents.MoveForward,
      ({ message: delta }) => {
        this.forward(0.02 * delta, true);
      }
    );
    keyboardShortcuts.addEventListener(
      InputEvents.MoveBackward,
      ({ message: delta }) => {
        this.forward(-0.02 * delta, true);
      }
    );
  }

  setConstraints(settings) {
    this.verticalDragToForward = false;
    this.maxDistance = 200;
    this.minDistance = 15;
    this.dampingFactor = 0.2;

    this.maxPolarAngle = Math.PI / 4;
    this.maxAzimuthAngle = Math.PI / 6;
    this.minAzimuthAngle = -Math.PI / 6;

    this.dollySpeed = 0.5;
    this.truckSpeed = 0.5;
    this.cameraShake = new CameraShake(this, 500, 10, 1);

    //mindistance <- close up
    //middistance <- normal
    //maxdistance <- extreme
    //minpolar <- top-ish
    //midpolar <- nice
    //maxpolar <- extreme
    //minazi <- normal
    //midazi <- ramps
    //maxazi <- extreme
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

  resetCamera() {
    this.setLookAt(0, 100, 1, 0, 0, 0, false);
  }
}

export default TitanReactorCameraControls;
