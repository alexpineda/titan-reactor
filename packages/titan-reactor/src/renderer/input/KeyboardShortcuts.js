import { EventDispatcher } from "three";
import { KeyboardKeyHold } from "hold-event";
import { range } from "ramda";
import InputEvents from "./InputEvents";

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

const keyNumbers = range(48, 59);
const keyPadNumbers = range(96, 107);

class KeyboardShortcuts extends EventDispatcher {
  constructor(domElement) {
    super();
    this.domElement = domElement;
    this.enabled = true;

    const dispatch = (type, message) => this.dispatchEvent({ type, message });

    this.keyDownListener = (e) => {
      if (!this.enabled) return;
      const k = InputEvents;

      [
        ["KeyP", k.TogglePlay],
        ["KeyG", k.ToggleGrid],
        ["KeyA", k.AzimuthLeft],
        ["KeyD", k.AzimuthRight],
        ["KeyW", k.PolarUp],
        ["KeyS", k.PolarDown],
        ["KeyC", k.PolarDown],
        // ["KeyE", k.ToggleReplayPosition],
        // ["KeyW", k.ToggleUnitSelection],
        // ["KeyQ", k.ToggleMinimap],
        // ["KeyR", k.ToggleProduction],
        // ["KeyT", k.ToggleResources],
        // ["KeyA", k.ToggleAll],
        ["KeyI", k.ToggleUnitInformation],
        ["F10", k.ToggleMenu],
      ].forEach(([key, event]) => e.code === key && dispatch(event));

      [
        [KeyCode.ESC, k.ToggleMenu],
        ["KeyG", k.ToggleMenu],
      ].forEach(([key, event]) => e.keyCode === key && dispatch(event));
    };

    this.holdEvents = [
      [KeyCode.ArrowUp, InputEvents.MoveForward],
      [KeyCode.ArrowLeft, InputEvents.TruckLeft],
      [KeyCode.ArrowDown, InputEvents.MoveBackward],
      [KeyCode.ArrowRight, InputEvents.TruckRight],
    ].map(([keyCode, eventType]) => {
      const key = new KeyboardKeyHold(keyCode, 10);
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
