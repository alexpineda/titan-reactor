import { EventDispatcher } from "three";

import InputEvents from "./InputEvents";

// manage hotkeys for controlling hud and several options
class KeyboardShortcuts extends EventDispatcher {
  domElement:HTMLElement;
  enabled = true;
  _keyPressDelay = 500;
  _keyPressTimeout: NodeJS.Timeout | null = null;

  constructor(domElement:HTMLElement) {
    super();
    this.domElement = domElement;

    document.addEventListener("keydown", this.keyDownListener, {
      passive: true,
      capture: true,
    });
  }

  keyDownListener (e: KeyboardEvent) {
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
  };
}

export default KeyboardShortcuts
