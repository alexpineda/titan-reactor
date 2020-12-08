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
};

class KeyboardShortcuts extends EventDispatcher {
  constructor(domElement) {
    super();
    this.domElement = domElement;
    this.enabled = true;

    const dispatch = (type, message) => this.dispatchEvent({ type, message });

    this.keyDownListener = (e) => {
      if (!this.enabled) return;
      switch (e.code) {
        case "KeyP":
          {
            dispatch(KeyboardEvents.TogglePlay);
          }
          break;
        case "KeyG":
          {
            dispatch(KeyboardEvents.ToggleGrid);
          }
          break;

        case "KeyE":
          {
            dispatch(KeyboardEvents.ToggleReplayPosition);
          }
          break;
        case "KeyW":
          {
            dispatch(KeyboardEvents.ToggleUnitSelection);
          }
          break;
        case "KeyQ":
          {
            dispatch(KeyboardEvents.ToggleMinimap);
          }
          break;
        case "KeyR":
          {
            dispatch(KeyboardEvents.ToggleProduction);
          }
          break;
        case "KeyT":
          {
            dispatch(KeyboardEvents.ToggleResources);
          }
          break;
        case "KeyA":
          {
            dispatch(KeyboardEvents.ToggleAll);
          }
          break;
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
