
import { Vector2, Vector3 } from "three";
import Janitor from "../utils/janitor";
import { UserInputCallbacks } from "common/types";

const passive = { passive: true };

const clicked = new Vector3();


export class CameraMouse {
    #_mouseWheelTimeout?: NodeJS.Timeout;
    #mouseWheelDelay = 200;
    #janitor = new Janitor();
    #screenDrag = new Vector2();
    #lookAt = new Vector2()
    #mouseScrollY = 0;
    #clicked?: Vector3;
    #mouse = new Vector3(0, 0, -1)
    #clientX = 0;
    #clientY = 0;


    direction = new Vector3();

    constructor(domElement: HTMLElement) {
        const onWheel = (evt: WheelEvent) => {
            if (this.#_mouseWheelTimeout) return;
            this.#mouseScrollY = evt.deltaY;
            this.#_mouseWheelTimeout = setTimeout(() => {
                this.#_mouseWheelTimeout = undefined;
            }, this.#mouseWheelDelay);
        };

        domElement.addEventListener("wheel", onWheel, passive);
        this.#janitor.callback(() => {
            domElement.removeEventListener("wheel", onWheel);
            this.#_mouseWheelTimeout && clearTimeout(this.#_mouseWheelTimeout);
        });

        const onMouseMove = (evt: MouseEvent) => {
            const x = evt.clientX / window.innerWidth;
            const y = evt.clientY / window.innerHeight;

            this.#clientX = evt.clientX;
            this.#clientY = evt.clientY;

            if (x < 0.01 && x > -0.01) {
                this.#screenDrag.x = -1;
            } else if (x > 0.99 && x < 1.01) {
                this.#screenDrag.x = 1;
            } else {
                this.#screenDrag.x = 0;
            }

            if (y < 0.01 && y > -0.01) {
                this.#screenDrag.y = 1;
            } else if (y > 0.99 && y < 1.01) {
                this.#screenDrag.y = -1;
            } else {
                this.#screenDrag.y = 0;
            }

            this.#lookAt.x = evt.movementX;
            this.#lookAt.y = evt.movementY;

            this.#mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
            this.#mouse.y = - (evt.clientY / window.innerHeight) * 2 + 1;
        }
        domElement.addEventListener("pointermove", onMouseMove, passive);
        this.#janitor.callback(() => {
            domElement.removeEventListener("pointermove", onMouseMove);
        });

        const pointerDown = (evt: PointerEvent) => {
            this.#mouse.z = evt.button;
        }
        domElement.addEventListener("pointerdown", pointerDown, passive);
        this.#janitor.callback(() => {
            domElement.removeEventListener("pointerdown", pointerDown);
        });

        const pointerUp = (evt: PointerEvent) => {
            this.#screenDrag.set(0, 0);
            this.#clicked = clicked.copy(this.#mouse);
            this.#clicked.z = evt.button;
            this.#mouse.z = -1;
        }
        domElement.addEventListener("pointerup", pointerUp, passive);
        this.#janitor.callback(() => {
            domElement.removeEventListener("pointerup", pointerUp);
        }
        );
        this.#janitor.addEventListener(domElement, "pointerup", pointerUp, passive);
        this.#janitor.addEventListener(domElement, "pointerleave", pointerUp, passive);

    }

    update(delta: number, elapsed: number, callbacks: UserInputCallbacks) {

        callbacks.onCameraMouseUpdate(delta, elapsed, this.#mouseScrollY, this.#screenDrag, this.#lookAt, this.#mouse, this.#clientX, this.#clientY, this.#clicked);

        this.#mouseScrollY = 0;
        this.#lookAt.x = 0;
        this.#lookAt.y = 0;
        this.#clicked = undefined;
    }

    dispose() {
        this.#_mouseWheelTimeout && clearTimeout(this.#_mouseWheelTimeout);
        this.#janitor.mopUp();
    }

}