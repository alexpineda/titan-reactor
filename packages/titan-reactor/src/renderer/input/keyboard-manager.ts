import EventEmitter from "events";
import { InputEvents } from ".";
import { getSettings } from "../stores"
import { testKey } from "../utils/key-utils";

export class KeyboardManager extends EventEmitter {
    private _domElement: HTMLElement;
    private _keyDownListenerInstance: (e: KeyboardEvent) => void;

    constructor(domElement: HTMLElement) {
        super();
        this._domElement = domElement;
        this._keyDownListenerInstance = this._keyDownListener.bind(this);
        this._domElement.addEventListener("keydown", this._keyDownListenerInstance, {
            passive: true,
            capture: true,
        });
    }

    private _keyDownListener(e: KeyboardEvent) {
        const settings = getSettings();

        const visit: [string, string | undefined][] = [
            [InputEvents.TogglePlay, settings.controls.keyboard.replay.pause],
            [InputEvents.SpeedUp, settings.controls.keyboard.replay.speedUp],
            [InputEvents.SpeedDown, settings.controls.keyboard.replay.speedDown],
            [InputEvents.SkipForward, settings.controls.keyboard.replay.skipForward],
            [InputEvents.SkipBackwards, settings.controls.keyboard.replay.skipBackward],
        ]

        for (const [event, key] of visit) {
            if (testKey(e, key)) {
                this.emit(event);
                break;
            }
        }
    }

    dispose() {
        this._domElement.removeEventListener("keydown", this._keyDownListenerInstance);
    }
}