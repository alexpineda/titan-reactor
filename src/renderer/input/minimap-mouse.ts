import { UserInputCallbacks } from "common/types";
import { MathUtils, Vector3 } from "three";
import { Surface } from "../image";
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
  #surface: Surface;

  #isDragStart = false;
  #isDragging = false;
  mouseButton?: number;

  #janitor = new Janitor();

  constructor(surface: Surface, mapWidth: number, mapHeight: number, onClick: (e: MouseEvent) => void) {
    super();
    this.#surface = surface;
    this.#mapWidth = mapWidth;
    this.#mapHeight = mapHeight;

    this.#janitor.addEventListener(surface.canvas, "mousedown", onClick);

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


    const onMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

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

  update(callbacks: UserInputCallbacks) {
    if (this.#isDragging || this.#isDragStart) {
      callbacks.onMinimapDragUpdate(pos, this.#isDragStart, this.mouseButton);
    }

    this.#isDragStart = false;

  }

  dispose() {
    this.#janitor.dispose();
  }
}

export default MinimapMouse;
