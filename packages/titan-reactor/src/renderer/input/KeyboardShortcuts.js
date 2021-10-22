import { EventDispatcher } from "three";
import InputEvents from "./InputEvents";

// manage hotkeys for controlling hud and several options
class KeyboardShortcuts extends EventDispatcher {
  constructor(domElement) {
    super();
    this.domElement = domElement;
    this.enabled = true;
    this._keyPressDelay = 500;

    const dispatch = (type, message) => this.dispatchEvent({ type, message });

    this.keyDownListener = (e) => {
      if (!this.enabled || this._keyPressTimeout) return;

      [
        ["KeyP", InputEvents.TogglePlay],
        ["KeyC", InputEvents.ToggleCursor],
        ["KeyE", InputEvents.ToggleElevation],
        ["F10", InputEvents.ToggleMenu],
        ["Escape", InputEvents.ToggleMenu],
      ].forEach(([key, event]) => e.code === key && dispatch(event));

      this._keyPressTimeout = setTimeout(() => {
        this._keyPressTimeout = null;
      }, this._keyPressDelay);
    };

    document.addEventListener("keydown", this.keyDownListener, {
      passive: true,
      capture: true,
    });
  }
}

export default KeyboardShortcuts;
