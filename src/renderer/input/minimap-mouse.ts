import { MathUtils, Vector3 } from "three";
import { CanvasTarget } from "../image";
import Janitor from "../utils/janitor";
import { Controls } from "../utils/camera-utils";
import CameraControls from "camera-controls";
import { PIP } from "./camera-mode";

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

export class MinimapMouse extends EventTarget {
  #mapWidth: number;
  #mapHeight: number;
  #surface: CanvasTarget;

  #isDragStart = false;
  #isDragging = false;
  #isPreviewing = false;
  #isPreviewStart = false;
  #mouseDown = false;

  #enabled = false;
  #janitor = new Janitor();

  set enabled(val: boolean) {
    this.#enabled = val;
    if (val === false) {
      this.#isPreviewing = false;
      this.#isDragging = false;
      this.#isDragStart = false;
    }
  }

  get enabled() {
    return this.#enabled;
  }

  constructor(surface: CanvasTarget, mapWidth: number, mapHeight: number) {
    super();
    this.#surface = surface;
    this.#mapWidth = mapWidth;
    this.#mapHeight = mapHeight;

    const max = Math.max(this.#mapWidth, this.#mapHeight);
    const wAspect = this.#mapWidth / max;
    const hAspect = this.#mapHeight / max;

    const getX = (mouseX: number) =>
      MathUtils.clamp(
        (mouseX - this.#surface.width / 2) / this.#surface.width / wAspect,
        -0.5,
        0.5
      ) * this.#mapWidth;

    const getY = (mouseY: number) =>
      MathUtils.clamp(
        (mouseY - this.#surface.height / 2) / this.#surface.height / hAspect,
        -0.5,
        0.5
      ) * this.#mapHeight;

    const onMouseDown = (e: MouseEvent) => {
      if (!this.enabled) return;
      e.preventDefault();
      e.stopPropagation();

      this.dispatchEvent(new Event("mousedown"));

      const x = getX(e.offsetX);
      const y = getY(e.offsetY);

      pos.set(x, 0, y);

      this.#mouseDown = true;

      if (e.button === LeftMouse) {
        this.#isDragging = true;
        this.#isDragStart = true;
      } else if (e.button === RightMouse) {
        this.#isPreviewStart = true;
      }
    };
    this.#surface.canvas.addEventListener("mousedown", onMouseDown);
    this.#janitor.callback(() => this.#surface.canvas.removeEventListener("mousedown", onMouseDown));


    const onMouseUp = (e: MouseEvent) => {
      if (!this.enabled) return;

      this.#mouseDown = false;
      this.#isDragging = false;

    };
    this.#surface.canvas.addEventListener("mouseup", onMouseUp);
    this.#janitor.callback(() => this.#surface.canvas.removeEventListener("mouseup", onMouseUp));

    this.#surface.canvas.addEventListener("mouseleave", onMouseUp);
    this.#janitor.callback(() => this.#surface.canvas.removeEventListener("mouseleave", onMouseUp));

    const onMouseMove = (e: MouseEvent) => {
      const x = getX(e.offsetX);
      const y = getY(e.offsetY);

      pos.set(x, 0, y);

    }
    this.#surface.canvas.addEventListener("mousemove", onMouseMove
    );
    this.#janitor.callback(() => this.#surface.canvas.removeEventListener("mousemove", onMouseMove));

  }

  update(orbit: CameraControls, pip: PIP) {
    if (!this.enabled) return;

    if (this.#isDragStart) {
      orbit.moveTo(pos.x, 0, pos.z, false);
      if (this.#isPreviewing && orbit.getTarget(_target).setY(pip.camera.position.y).distanceTo(pip.camera.position) < Proximity) {
        this.#isPreviewing = false;
      }
    } else if (this.#isDragging) {
      orbit.moveTo(pos.x, 0, pos.z, true);
      if (this.#isPreviewing && orbit.getTarget(_target).setY(pip.camera.position.y).distanceTo(pip.camera.position) < Proximity) {
        this.#isPreviewing = false;
      }
    } else if (this.#isPreviewStart) {
      if (this.#isPreviewing) {
        if (pos.setY(pip.camera.position.y).distanceTo(pip.camera.position) > Proximity) {
          this.#isPreviewing = false;
        }
      } else {
        this.#isPreviewing = true;
      }
      this.#isPreviewStart = false;
    } else if (this.#isPreviewing && this.#mouseDown) {
      pip.camera.position.set(pos.x, pip.camera.position.y, pos.z);
      pip.camera.lookAt(pos.x, 0, pos.z)
    }

    pip.enabled = this.#isPreviewing;
    this.#isDragStart = false;

  }

  dispose() {
    this.#janitor.mopUp();
  }
}

export default MinimapMouse;
