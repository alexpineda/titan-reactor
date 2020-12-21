import CameraControls from "camera-controls";
import { is, range } from "ramda";
import * as THREE from "three";
import CameraShake from "../CameraShake";
import InputEvents from "../../input/InputEvents";

CameraControls.install({ THREE });

class StandardCameraControls extends CameraControls {
  constructor(camera, domElement, keyboardShortcuts) {
    super(camera, domElement);

    this.mouseButtons.left = CameraControls.ACTION.NONE;
    this.mouseButtons.right = CameraControls.ACTION.TRUCK;
    this.mouseButtons.middle = CameraControls.ACTION.ROTATE;
    this.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
    this.keyboardTruckingEnabled = true;

    keyboardShortcuts.addEventListener(
      InputEvents.TruckLeft,
      ({ message: delta }) => {
        if (!this.keyboardTruckingEnabled) return;
        this.truck(-0.02 * delta, 0, true);
      }
    );
    keyboardShortcuts.addEventListener(
      InputEvents.TruckRight,
      ({ message: delta }) => {
        if (!this.keyboardTruckingEnabled) return;

        this.truck(0.02 * delta, 0, true);
      }
    );
    keyboardShortcuts.addEventListener(
      InputEvents.MoveForward,
      ({ message: delta }) => {
        if (!this.keyboardTruckingEnabled) return;
        this.forward(0.02 * delta, true);
      }
    );
    keyboardShortcuts.addEventListener(
      InputEvents.MoveBackward,
      ({ message: delta }) => {
        if (!this.keyboardTruckingEnabled) return;
        this.forward(-0.02 * delta, true);
      }
    );
  }

  setConstraints(settings) {
    this.verticalDragToForward = true;
    this.maxDistance = 200;
    this.minDistance = 15;

    this.maxPolarAngle = (26 * Math.PI) / 64;
    this.minPolarAngle = (4 * Math.PI) / 64;
    this.maxAzimuthAngle = (24 * Math.PI) / 64;
    this.minAzimuthAngle = -(24 * Math.PI) / 64;
    this.truckSpeed = 1;
    this.cameraShake = new CameraShake(this, 500, 10, 1);
    this.dollyToCursor = true;

    this.constraints = {
      azi: [-14, -10, -4, 0, 4, 10, 14].map((x) => (x * Math.PI) / 64),
      pol: [4, 12, 20].map((x) => (x * Math.PI) / 64),
      fov: [22, 40, 65],
      dollyTo: [70, 30, 20],
      dollySpeed: [1, 0.5, 0.2],
      dampingFactor: [0.1, 0.075, 0.025],
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

  initNumpadControls() {
    const updateShot = (opts) => {
      const { azi, pol, fov, dollySpeed, dampingFactor, dollyTo } = opts;
      if (is(Number, azi) && is(Number, pol)) {
        this.rotateTo(azi, pol, false);
      }
      if (is(Number, fov)) {
        this._camera.fov = fov;
        this._camera.updateProjectionMatrix();
      }
      if (is(Number, dollySpeed)) {
        this.dollySpeed = dollySpeed;
      }
      if (is(Number, dampingFactor)) {
        this.dampingFactor = dampingFactor;
      }
      if (is(Number, dollyTo)) {
        this.dollyTo(dollyTo, false);
      }
    };

    const createShot = ({
      azi,
      pol,
      fov,
      dollySpeed,
      dampingFactor,
      dollyTo,
    }) => {
      return {
        azi:
          this.constraints.azi[azi + 3] !== undefined
            ? this.constraints.azi[azi + 3]
            : azi,
        pol:
          this.constraints.pol[pol] !== undefined
            ? this.constraints.pol[pol]
            : pol,
        fov:
          this.constraints.fov[fov] !== undefined
            ? this.constraints.fov[fov]
            : fov,
        dollySpeed:
          this.constraints.dollySpeed[dollySpeed] !== undefined
            ? this.constraints.dollySpeed[dollySpeed]
            : dollySpeed,
        dampingFactor:
          this.constraints.dampingFactor[dampingFactor] !== undefined
            ? this.constraints.dampingFactor[dampingFactor]
            : dampingFactor,
        dollyTo:
          this.constraints.dollyTo[dollyTo] !== undefined
            ? this.constraints.dollyTo[dollyTo]
            : dollyTo,
      };
    };

    const cycle = (v, min, max) => {
      if (v < min) {
        v = max;
      } else if (v > max) {
        v = min;
      }
      return v;
    };

    this.presets = {
      Numpad0: {
        azi: 0,
        pol: 0,
        fov: 0,
        dollyTo: 110,
      },
      Numpad1: {
        azi: 0,
        pol: 0,
        fov: 0,
        dollyTo: 50,
      },
      Numpad2: {
        azi: 0,
        pol: 2,
        fov: 1,
        dollyTo: 1,
      },
      Numpad3: {
        azi: 0,
        pol: 2,
        fov: 2,
        dollyTo: 2,
      },
      Numpad4: {
        azi: 0,
        pol: 0,
        fov: 0,
        dollyTo: 60,
      },
      Numpad5: {
        azi: 0,
        pol: 1,
        fov: 1,
        dollyTo: 1,
      },
      Numpad6: {
        azi: 0,
        pol: 1,
        fov: 2,
        dollyTo: 2,
      },
      Numpad7: {
        azi: 0,
        pol: 0,
        fov: 0,
        dollyTo: 80,
      },
      Numpad8: {
        azi: 0,
        pol: 0,
        fov: 1,
        dollyTo: 45,
      },
      Numpad9: {
        azi: 0,
        pol: 0,
        fov: 2,
        dollyTo: 25,
      },
    };

    this._keypressListener = (evt) => {
      const numpads = range(0, 10).map((n) => `Numpad${n}`);
      if (numpads.includes(evt.code)) {
        updateShot(createShot(this.presets[evt.code]));
      }
    };
    document.addEventListener("keypress", this._keypressListener);

    this._createShot = createShot;
    this._updateShot = updateShot;
    this._execNumpad = (code) => {
      updateShot(createShot(this.presets[code]));
    };
  }

  execNumpad(numpadKey) {
    this._execNumpad(`Numpad${numpadKey}`);
  }

  shake(strength) {
    if (this.cameraShake.isShaking) return;
    this.cameraShake.strength = strength;
    this.cameraShake.shake();
  }

  dispose() {
    document.removeEventListener("keypress", this._keypressListener);
    super.dispose();
  }
}

export default StandardCameraControls;
