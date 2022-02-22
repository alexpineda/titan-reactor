import { MathUtils, Vector3 } from "three";
import { CanvasTarget } from "../../common/image";
import Janitor from "../utils/janitor";
import { CameraMode, Controls } from "./camera-mode";

const LeftMouse = 0;
const RightMouse = 2;
const Proximity = 8;

export interface MinimapEvent {
  e: MouseEvent;
  pos: Vector3;
}
export interface MinimapPreviewEvent extends MinimapEvent {
  isPreviewing: boolean;
}

const pos = new Vector3();
const _target = new Vector3();

// manages and dispatches minimap drag and click events
export class MinimapMouse {
  mapWidth: number;
  mapHeight: number;
  surface: CanvasTarget;

  _isDragStart = false;
  _isDragging = false;
  _isPreviewing = false;
  _isPreviewStart = false;
  _mouseDown = false;

  private _enabled = false;
  private janitor = new Janitor();

  set enabled(val: boolean) {
    this._enabled = val;
    if (val === false) {
      this._isPreviewing = false;
      this._isDragging = false;
    }
  }

  get enabled() {
    return this._enabled;
  }

  constructor(surface: CanvasTarget, mapWidth: number, mapHeight: number) {
    this.surface = surface;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;

    const max = Math.max(this.mapWidth, this.mapHeight);
    const wAspect = this.mapWidth / max;
    const hAspect = this.mapHeight / max;

    const getX = (mouseX: number) =>
      MathUtils.clamp(
        (mouseX - this.surface.width / 2) / this.surface.width / wAspect,
        -0.5,
        0.5
      ) * this.mapWidth;

    const getY = (mouseY: number) =>
      MathUtils.clamp(
        (mouseY - this.surface.height / 2) / this.surface.height / hAspect,
        -0.5,
        0.5
      ) * this.mapHeight;

    const onMouseDown = (e: MouseEvent) => {
      if (!this.enabled) return;

      const x = getX(e.offsetX);
      const y = getY(e.offsetY);

      pos.set(x, 0, y);

      this._mouseDown = true;

      if (e.button === LeftMouse) {
        this._isDragging = true;
        this._isDragStart = true;
      } else if (e.button === RightMouse) {
        this._isPreviewStart = true;
      }
    };
    this.surface.canvas.addEventListener("mousedown", onMouseDown);
    this.janitor.callback(() => this.surface.canvas.removeEventListener("mousedown", onMouseDown));

    const onMouseUp = (e: MouseEvent) => {
      if (!this.enabled) return;


      this._mouseDown = false;
      this._isDragging = false;

      // if (e.button === LeftMouse) {
      //   const x = getX(e.offsetX);
      //   const y = getY(e.offsetY);
      //   this._start = pos.set(x, 0, y);
      // }
    };
    this.surface.canvas.addEventListener("mouseup", onMouseUp);
    this.janitor.callback(() => this.surface.canvas.removeEventListener("mouseup", onMouseUp));

    const onMouseMove = (e: MouseEvent) => {
      if (!this.enabled) return;

      const x = getX(e.offsetX);
      const y = getY(e.offsetY);

      pos.set(x, 0, y);

    }
    this.surface.canvas.addEventListener("mousemove", onMouseMove
    );
    this.janitor.callback(() => this.surface.canvas.removeEventListener("mousemove", onMouseMove));

  }

  update(controls: Controls) {
    if (!this.enabled) return;

    if (this._isDragStart) {
      controls.keys.onToggleCameraMode(CameraMode.Default);
      controls.standard.moveTo(pos.x, 0, pos.z, false);
      if (this._isPreviewing && controls.standard.getTarget(_target).setY(controls.PIP.camera.position.y).distanceTo(controls.PIP.camera.position) < Proximity) {
        this._isPreviewing = false;
      }
    } else if (this._isDragging) {
      controls.standard.moveTo(pos.x, 0, pos.z, true);
      if (this._isPreviewing && controls.standard.getTarget(_target).setY(controls.PIP.camera.position.y).distanceTo(controls.PIP.camera.position) < Proximity) {
        this._isPreviewing = false;
      }
    } else if (this._isPreviewStart) {
      if (this._isPreviewing) {
        if (pos.setY(controls.PIP.camera.position.y).distanceTo(controls.PIP.camera.position) > Proximity) {
          this._isPreviewing = false;
        }
      } else {
        this._isPreviewing = true;
      }
      this._isPreviewStart = false;
    } else if (this._isPreviewing && this._mouseDown) {
      controls.PIP.camera.position.set(pos.x, controls.PIP.camera.position.y, pos.z);
      controls.PIP.camera.lookAt(pos.x, 0, pos.z)
    }

    controls.PIP.enabled = this._isPreviewing;
    this._isDragStart = false;

  }

  dispose() {
    this.janitor.mopUp();
  }
}

export default MinimapMouse;
