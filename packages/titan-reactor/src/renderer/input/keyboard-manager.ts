import EventEmitter from "events";
import { InputEvents } from ".";
import { getSettings } from "../stores"

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

    private _testKey(e: KeyboardEvent, key: string | undefined) {
        if (!key) return false;
        return e.code === key.trim().slice(-e.code.length);
    }

    private _keyDownListener(e: KeyboardEvent) {
        const settings = getSettings();

        const visit: [string, string | undefined][] = [
            [InputEvents.TogglePlay, settings.controls.keyboard.pause],
            [InputEvents.SpeedUp, settings.controls.keyboard.speedUp],
            [InputEvents.SpeedDown, settings.controls.keyboard.speedDown],
            [InputEvents.SkipForward, settings.controls.keyboard.skipForward],
            [InputEvents.SkipBackwards, settings.controls.keyboard.skipBackward],
        ]

        for (const [event, key] of visit) {
            if (this._testKey(e, key)) {
                this.emit(event);
                break;
            }
        }
    }

    dispose() {
        this._domElement.removeEventListener("keydown", this._keyDownListenerInstance);
    }
}