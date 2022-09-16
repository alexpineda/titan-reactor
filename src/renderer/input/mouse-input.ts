
import { Vector2, Vector3 } from "three";
import Janitor from "../utils/janitor";
import { UserInputCallbacks } from "common/types";

const passive = { passive: true };

const clicked = new Vector3();
const released = new Vector3();

export class MouseInput {
    #_mouseWheelTimeout?: NodeJS.Timeout;
    #mouseWheelDelay = 200;
    #janitor = new Janitor();
    #screenDrag = new Vector2();
    #lookAt = new Vector2()
    #mouseScrollY = 0;
    #clicked?: Vector3;
    #released?: Vector3;
    #mouse = new Vector3(0, 0, -1);
    #modifiers = new Vector3(0, 0, 0);
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
        this.#janitor.mop(() => {
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

        const pointerDown = (evt: PointerEvent) => {
            this.#modifiers.set(evt.altKey ? 1 : 0, evt.ctrlKey ? 1 : 0, evt.shiftKey ? 1 : 0);

            this.#mouse.z = evt.button;
            this.#mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
            this.#mouse.y = - (evt.clientY / window.innerHeight) * 2 + 1;
            this.#clicked = clicked.copy(this.#mouse);
        }

        const pointerUp = () => {
            this.#screenDrag.set(0, 0);
            this.#released = released.copy(this.#mouse);
            this.#mouse.z = -1;
            this.#modifiers.set(0, 0, 0);
        }

        this.#janitor.addEventListener(domElement, "pointermove", onMouseMove, passive);
        this.#janitor.addEventListener(domElement, "pointerdown", pointerDown, passive);
        this.#janitor.addEventListener(domElement, "pointerup", pointerUp, passive);
        this.#janitor.addEventListener(domElement, "pointerleave", pointerUp, passive);

    }

    get released() {
        return this.#released;
    }

    get position() {
        return this.#mouse;
    }

    get clicked() {
        return this.#clicked;
    }

    update(delta: number, elapsed: number, callbacks: UserInputCallbacks) {

        callbacks.onCameraMouseUpdate(delta, elapsed, this.#mouseScrollY, this.#screenDrag, this.#lookAt, this.#mouse, this.#clientX, this.#clientY, this.#clicked, this.#modifiers);


    }

    reset() {
        this.#mouseScrollY = 0;
        this.#lookAt.x = 0;
        this.#lookAt.y = 0;
        this.#clicked = undefined;
        this.#released = undefined;
    }

    dispose() {
        this.#_mouseWheelTimeout && clearTimeout(this.#_mouseWheelTimeout);
        this.#janitor.dispose();
    }

}