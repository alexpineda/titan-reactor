import { EventDispatcher } from "three";

import InputEvents from "./input-events";

// manage hotkeys for controlling hud and several options
export class KeyboardShortcuts extends EventDispatcher {
  enabled = true;
  private _keyPressDelay = 500;
  private _keyPressTimeout: NodeJS.Timeout | null = null;
  private _domElement: HTMLElement;

  constructor(domElement: HTMLElement) {
    super();
    this._domElement = domElement;

    domElement.addEventListener("keydown", this.keyDownListener, {
      passive: true,
      capture: true,
    });
  }

  keyDownListener(e: KeyboardEvent) {
    if (!this.enabled || this._keyPressTimeout) return;

    const dispatch = (type: string) => this.dispatchEvent({ type });

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
  }

  dispose() {
    this._domElement.removeEventListener("keydown", this.keyDownListener);
  }
}

export default KeyboardShortcuts;
