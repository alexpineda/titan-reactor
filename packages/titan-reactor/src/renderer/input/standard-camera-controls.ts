import CameraControls from "camera-controls";
import * as THREE from "three";
import CameraShake from "../camera/camera-shake";
import InputEvents from "./input-events";
import range from "../../common/utils/range";
import { PerspectiveCamera } from "three";
import KeyboardShortcuts from "./keyboard-shortcuts";
import PreviewCamera from "../camera/preview-camera";

CameraControls.install({ THREE });

type ShotOptions = {
  azi: number;
  pol: number;
  fov: number;
  dollyTo: number;
};

type NumpadKeys =
  | "Numpad0"
  | "Numpad1"
  | "Numpad2"
  | "Numpad3"
  | "Numpad4"
  | "Numpad5"
  | "Numpad6"
  | "Numpad7"
  | "Numpad8"
  | "Numpad9";

const NUMPAD_PRESETS = {
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

export class StandardCameraControls extends CameraControls {
  _mouseWheelTimeout: NodeJS.Timeout | null = null;
  _mouseWheelDelay = 500;
  cameraShake?: CameraShake;
  //@todo make this a getter/setter and unsubscribe on false
  keyboardTruckingEnabled = true;
  numpadControlEnabled = false;
  presets = NUMPAD_PRESETS;

  private _onWheel: (evt: WheelEvent) => void;
  private constraints: {
    azi: number[];
    pol: [number, number, number];
    fov: [number, number, number];
    dollyTo: [number, number, number];
    dollySpeed: [number, number, number];
    dampingFactor: [number, number, number];
  };
  constructor(
    camera: PerspectiveCamera,
    domElement: HTMLElement,
    keyboardShortcuts: KeyboardShortcuts,
    freeControl = false
  ) {
    super(camera, domElement);

    if (camera instanceof PreviewCamera) {
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

    this._onWheel = (evt: WheelEvent) => {
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

    this.constraints = {
      azi: [-14, -10, -4, 0, 4, 10, 14].map((x) => (x * Math.PI) / 64),
      // https://github.com/microsoft/TypeScript/issues/44309
      pol: [8, 12, 18].map((x) => (x * Math.PI) / 64) as [
        number,
        number,
        number
      ],
      fov: [22, 40, 55],
      dollyTo: [70, 30, 20],
      dollySpeed: [1, 0.5, 0.2],
      dampingFactor: [0.1, 0.075, 0.025],
    };
  }

  setConstraints() {
    this.verticalDragToForward = true;

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
    this.draggingDampingFactor = 1;
  }

  private createShot({ azi, pol, fov, dollyTo }: ShotOptions) {
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
      dollyTo:
        this.constraints.dollyTo[dollyTo] !== undefined
          ? this.constraints.dollyTo[dollyTo]
          : dollyTo,
    };
  }

  updateShot(opts: ShotOptions) {
    const { azi, pol, fov, dollyTo } = opts;
    if (azi && pol) {
      this.rotateTo(azi, pol, false);
    }
    if (fov) {
      (this._camera as PerspectiveCamera).fov = fov;
      this._camera.updateProjectionMatrix();
    }
    if (dollyTo) {
      this.dollyTo(dollyTo, false);
    }
  }

  private _keypressListener(evt: KeyboardEvent) {
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

    if (!this.numpadControlEnabled) return;
    const numpads = range(0, 10).map((n) => `Numpad${n}`);
    if (numpads.includes(evt.code)) {
      this.updateShot(this.createShot(this.presets[evt.code as NumpadKeys]));
    }
  }

  initNumpadControls() {
    this.numpadControlEnabled = true;

    document.addEventListener("keyup", this._keypressListener, {
      passive: true,
    });
  }

  execNumpad(numpadKey: number) {
    const numpadKeyCode = `Numpad${numpadKey}`;
    this.updateShot(this.createShot(this.presets[numpadKeyCode as NumpadKeys]));
  }

  shake(strength: number) {
    if (!this.cameraShake || this.cameraShake.isShaking) return;
    this.cameraShake.strength = strength;
    this.cameraShake.shake();
  }

  override dispose() {
    // document.removeEventListener("keypress", this._keypressListener);
    this._domElement.addEventListener("wheel", this._onWheel);
    super.dispose();
  }
}

export default StandardCameraControls;
