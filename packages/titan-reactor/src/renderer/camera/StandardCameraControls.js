import CameraControls from "camera-controls";
import { is, range } from "ramda";
import * as THREE from "three";
import CameraShake from "./CameraShake";
import InputEvents from "../input/InputEvents";

CameraControls.install({ THREE });

class StandardCameraControls extends CameraControls {
  constructor(camera, domElement, keyboardShortcuts, freeControl = false) {
    super(camera, domElement);

    if (camera.isPreviewCamera) {
      this.mouseButtons.wheel = CameraControls.ACTION.NONE;
      this.mouseButtons.left = CameraControls.ACTION.NONE;
      this.mouseButtons.right = CameraControls.ACTION.NONE;
      this.mouseButtons.middle = CameraControls.ACTION.ROTATE;
    } else if (camera.isPerspectiveCamera) {
      this.mouseButtons.wheel = freeControl
        ? CameraControls.ACTION.DOLLY
        : CameraControls.ACTION.NONE;
      this.mouseButtons.left = CameraControls.ACTION.NONE;
      this.mouseButtons.right = CameraControls.ACTION.TRUCK;
      this.mouseButtons.middle = freeControl
        ? CameraControls.ACTION.ROTATE
        : CameraControls.ACTION.NONE;
    } else {
      this.mouseButtons.right = CameraControls.ACTION.TRUCK;
      this.mouseButtons.left = CameraControls.ACTION.ROTATE;
      this.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
    }

    this._mouseWheelTimeout;
    this._mouseWheelDelay = 500;

    this._onWheel = (evt) => {
      if (this._mouseWheelTimeout || !this.enabled || freeControl) return;

      this.dampingFactor = 0.05;

      if (evt.deltaY < 0) {
        if (!evt.altKey) {
          this.dolly(10, true);
        }
        if (!evt.ctrlKey) {
          this.rotate(0, (2 * Math.PI) / 64, true);
        }
      } else {
        if (!evt.altKey) {
          this.dolly(-10, true);
        }
        if (!evt.ctrlKey) {
          this.rotate(0, -(2 * Math.PI) / 64, true);
        }
      }

      this._mouseWheelTimeout = setTimeout(() => {
        this._mouseWheelTimeout = null;
      }, this._mouseWheelDelay);
    };

    domElement.addEventListener("wheel", this._onWheel, { passive: true });

    //@todo make this a getter/setter and unsubscribe on false
    this.keyboardTruckingEnabled = true;
    this.numpadControlEnabled = false;

    keyboardShortcuts.addEventListener(
      InputEvents.TruckLeft,
      ({ message: delta }) => {
        if (!this.keyboardTruckingEnabled) return;
        this.truck(-0.01 * delta, 0, true);
      }
    );
    keyboardShortcuts.addEventListener(
      InputEvents.TruckRight,
      ({ message: delta }) => {
        if (!this.keyboardTruckingEnabled) return;

        this.truck(0.01 * delta, 0, true);
      }
    );
    keyboardShortcuts.addEventListener(
      InputEvents.MoveForward,
      ({ message: delta }) => {
        if (!this.keyboardTruckingEnabled) return;
        this.forward(0.01 * delta, true);
      }
    );
    keyboardShortcuts.addEventListener(
      InputEvents.MoveBackward,
      ({ message: delta }) => {
        if (!this.keyboardTruckingEnabled) return;
        this.forward(-0.01 * delta, true);
      }
    );
  }

  setConstraints(freeControl) {
    this.verticalDragToForward = true;

    this.constraints = {
      azi: [-14, -10, -4, 0, 4, 10, 14].map((x) => (x * Math.PI) / 64),
      pol: [8, 12, 18].map((x) => (x * Math.PI) / 64),
      fov: [22, 40, 55],
      dollyTo: [70, 30, 20],
      dollySpeed: [1, 0.5, 0.2],
      dampingFactor: [0.1, 0.075, 0.025],
    };

    // if (freeControl) return;

    this.maxDistance = 200;
    this.minDistance = 15;

    this.maxPolarAngle = (26 * Math.PI) / 64;
    this.minPolarAngle = (4 * Math.PI) / 64;
    this.maxAzimuthAngle = (24 * Math.PI) / 64;
    this.minAzimuthAngle = -(24 * Math.PI) / 64;
    this.truckSpeed = 2;

    this.cameraShake = new CameraShake(this, 500, 10, 1);
    this.dollyToCursor = true;
    this.zoomFactor = 40;
    this.draggingDampingFactor = 1;
  }

  initNumpadControls() {
    this.numpadControlEnabled = true;
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
        if (this._camera.isPerspectiveCamera) {
          this.dollyTo(dollyTo, false);
        } else {
          this.zoomTo(dollyTo * this.zoomFactor, false);
        }
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

    this.presets = {
      Numpad0: {
        azi: 0,
        pol: 0,
        fov: 0,
        dollyTo: 100,
      },
      Numpad1: {
        azi: 0,
        pol: 0,
        fov: 0,
        dollyTo: 40,
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
        dollyTo: 50,
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
      if (this._camera.isPerspectiveCamera) {
        if (evt.code === "NumpadDivide") {
          this.rotate(-(2 * Math.PI) / 64, 0, true);
        } else if (evt.code === "NumpadMultiply") {
          this.rotate((2 * Math.PI) / 64, 0, true);
        }

        if (evt.code === "NumpadAdd") {
          if (!evt.altKey) {
            this.dolly(10, true);
          }
          if (!evt.ctrlKey) {
            this.rotate(0, (2 * Math.PI) / 64, true);
          }
        } else if (evt.code === "NumpadSubtract") {
          if (!evt.altKey) {
            this.dolly(-10, true);
          }
          if (!evt.ctrlKey) {
            this.rotate(0, -(2 * Math.PI) / 64, true);
          }
        }
      }

      if (!this.numpadControlEnabled) return;
      const numpads = range(0, 10).map((n) => `Numpad${n}`);
      if (numpads.includes(evt.code)) {
        updateShot(createShot(this.presets[evt.code]));
      }
    };
    document.addEventListener("keyup", this._keypressListener, {
      passive: true,
    });

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
    this._domElement.addEventListener("wheel", this._onWheel);
    super.dispose();
  }
}

export default StandardCameraControls;
