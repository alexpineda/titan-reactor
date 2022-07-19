import { CameraController } from "common/types";
import { MathUtils, Vector3 } from "three";
import { CanvasTarget } from "../image";
import Janitor from "../utils/janitor";

export interface MinimapEvent {
  e: MouseEvent;
  pos: Vector3;
}
export interface MinimapPreviewEvent extends MinimapEvent {
  isPreviewing: boolean;
}

const pos = new Vector3();

export class MinimapMouse extends EventTarget {
  #mapWidth: number;
  #mapHeight: number;
  #surface: CanvasTarget;

  #isDragStart = false;
  #isDragging = false;
  mouseButton?: number;

  #enabled = false;
  #janitor = new Janitor();

  set enabled(val: boolean) {
    this.#enabled = val;
    if (val === false) {
      this.#isDragging = false;
      this.#isDragStart = false;
      this.mouseButton = undefined;
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

    // const max = Math.max(this.#mapWidth, this.#mapHeight);
    // const wAspect = this.#mapWidth / max;
    // const hAspect = this.#mapHeight / max;

    const getX = (mouseX: number) =>
      MathUtils.clamp(
        (mouseX - this.#surface.width / 2) / this.#surface.width,
        -0.5,
        0.5
      ) * this.#mapWidth;

    const getY = (mouseY: number) =>
      MathUtils.clamp(
        (mouseY - this.#surface.height / 2) / this.#surface.height,
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

      this.mouseButton = e.button;
      this.#isDragging = true;
      this.#isDragStart = true;

    };
    this.#surface.canvas.addEventListener("mousedown", onMouseDown);
    this.#janitor.callback(() => this.#surface.canvas.removeEventListener("mousedown", onMouseDown));


    const onMouseUp = () => {
      if (!this.enabled) return;

      this.mouseButton = undefined;
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

  update(cameraController: CameraController) {
    if (!this.enabled) return;

    cameraController.isActiveCameraMode && cameraController.onMinimapDragUpdate && cameraController.onMinimapDragUpdate(pos, this.#isDragStart, this.#isDragging, this.mouseButton);

    this.#isDragStart = false;

  }

  dispose() {
    this.#janitor.mopUp();
  }
}

export default MinimapMouse;
