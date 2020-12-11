import { EventDispatcher } from "three";
import { KeyboardKeyHold } from "hold-event";

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
  TruckLeft: "TruckLeft",
  TruckRight: "TruckRight",
  MoveForward: "MoveForward",
  MoveBackward: "MoveBackward",
};

const KeyCode = {
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
  ESC: 27,
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
        // ["KeyE", k.ToggleReplayPosition],
        // ["KeyW", k.ToggleUnitSelection],
        // ["KeyQ", k.ToggleMinimap],
        // ["KeyR", k.ToggleProduction],
        // ["KeyT", k.ToggleResources],
        // ["KeyA", k.ToggleAll],
        ["KeyI", k.ToggleUnitInformation],
        ["F10", k.ToggleMenu],
      ].forEach(([key, event]) => e.code === key && dispatch(event));

      switch (e.keyCode) {
        case KeyCode.ESC:
          {
            dispatch(KeyboardEvents.ToggleMenu);
          }
          break;
      }
    };

    this.holdEvents = [
      [KeyCode.W, KeyboardEvents.MoveForward],
      [KeyCode.A, KeyboardEvents.TruckLeft],
      [KeyCode.S, KeyboardEvents.MoveBackward],
      [KeyCode.D, KeyboardEvents.TruckRight],
    ].map(([keyCode, eventType]) => {
      const key = new KeyboardKeyHold(keyCode, 100);
      const listener = (event) => {
        dispatch(eventType, event.deltaTime);
      };
      key.addEventListener("holding", listener);
      return () => {
        key.removeEventListener("holding", listener);
      };
    });

    document.addEventListener("keydown", this.keyDownListener);
  }

  dispose() {
    document.removeEventListener("keydown", this.keyDownListener);
    this.holdEvents.forEach((dispose) => dispose());
  }
}

export default KeyboardShortcuts;
