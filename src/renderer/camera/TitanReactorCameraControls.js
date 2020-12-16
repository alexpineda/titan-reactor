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
    this.mouseButtons.middle = CameraControls.ACTION.ROTATE;
    this.mouseButtons.wheel = CameraControls.ACTION.DOLLY;

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
    this.verticalDragToForward = true;
    this.maxDistance = 200;
    this.minDistance = 15;
    this.dampingFactor = 0.2;

    this.maxPolarAngle = (20 * Math.PI) / 64;
    this.minPolarAngle = (2 * Math.PI) / 64;
    this.maxAzimuthAngle = (16 * Math.PI) / 64;
    this.minAzimuthAngle = -(16 * Math.PI) / 64;

    // this.dollySpeed = 0.5;
    this.truckSpeed = 1;
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

  setMaximums(maximums) {
    this.maximums = {
      distances: [20, 50, 100],
      polarAngle: [Math.PI / 6, Math.PI / 4, Math.PI / 2],
      azimuthAngle: [Math.PI / 6, Math.PI / 4, Math.PI / 2],
    };
  }
  setMapBoundary(width, height) {
    if (width === null) {
      this.boundaryEnclosesCamera = false;
      return;
    }
    this.boundaryEnclosesCamera = true;

    const bb = new THREE.Box3(
      new THREE.Vector3(-width, 0, -height),
      new THREE.Vector3(width, 400, height)
    );
    this.setBoundary(bb);
    this.boundaryFriction = 0.5;
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
