import { EventDispatcher } from "three";

export const KeyboardEvents = {
  TogglePlay: "TogglePlay",
  ToggleGrid: "ToggleGrid",
  ToggleMenu: "ToggleMenu",
  ToggleReplayPosition: "ToggleReplayPosition",
  ToggleUnitSelection: "ToggleUnitSelection",
  ToggleMinimap: "ToggleMinimap",
  ToggleResources: "ToggleResources",
  ToggleProduction: "ToggleProduction",
  ToggleAll: "ToggleAll",
  ToggleUnitInformation: "ToggleUnitInformation",
};

class KeyboardShortcuts extends EventDispatcher {
  constructor(domElement) {
    super();
    this.domElement = domElement;
    this.enabled = true;

    const dispatch = (type, message) => this.dispatchEvent({ type, message });

    this.keyDownListener = (e) => {
      if (!this.enabled) return;
      const k = KeyboardEvents;

      [
        ["KeyP", k.TogglePlay],
        ["KeyG", k.ToggleGrid],
        ["KeyE", k.ToggleReplayPosition],
        ["KeyW", k.ToggleUnitSelection],
        ["KeyQ", k.ToggleMinimap],
        ["KeyR", k.ToggleProduction],
        ["KeyT", k.ToggleResources],
        ["KeyA", k.ToggleAll],
        ["KeyI", k.ToggleUnitInformation],
      ].forEach(([key, event]) => e.code === key && dispatch(event));

      switch (e.code) {
      }

      switch (e.keyCode) {
        case 27:
          {
            dispatch(KeyboardEvents.ToggleMenu);
          }
          break;
      }
    };

    document.addEventListener("keydown", this.keyDownListener);
  }

  dispose() {
    document.removeEventListener("keydown", this.keyDownListener);
  }
}

export default KeyboardShortcuts;
