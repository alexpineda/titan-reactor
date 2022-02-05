
import CameraControls from "camera-controls";
import Janitor from "../utils/janitor";
import { smoothDollyIn, smoothDollyOut } from "./camera-presets";

export class CameraMouse {
    private _mouseWheelTimeout?: NodeJS.Timeout;
    private _mouseWheelDelay = 500;
    private _janitor = new Janitor();
    enabled = true;

    constructor(control: CameraControls, domElement: HTMLElement) {

        const onWheel = (evt: WheelEvent) => {
            if (this._mouseWheelTimeout || !this.enabled) return;

            if (evt.deltaY < 0) {
                smoothDollyIn(control);
            } else {
                smoothDollyOut(control);
            }

            this._mouseWheelTimeout = setTimeout(() => {
                this._mouseWheelTimeout = undefined;
            }, this._mouseWheelDelay);
        };

        domElement.addEventListener("wheel", onWheel, { passive: true });
        this._janitor.callback(() => {
            domElement.removeEventListener("wheel", onWheel);
            this._mouseWheelTimeout && clearTimeout(this._mouseWheelTimeout);
        });
    }

    dispose() {
        this._janitor.mopUp();
    }

}