import { EventDispatcher } from "three";

import InputEvents from "./input-events";

// manage hotkeys for controlling hud and several options
export class KeyboardShortcuts extends EventDispatcher {
  domElement: Document;
  enabled = true;
  _keyPressDelay = 500;
  _keyPressTimeout: NodeJS.Timeout | null = null;

  constructor(domElement: Document) {
    super();
    this.domElement = domElement;

    document.addEventListener("keydown", this.keyDownListener, {
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
}

export default KeyboardShortcuts;
