import { generateUUID } from "three/src/math/MathUtils";
import { MacroActionEffect, MacroActionSequence, MacroActionType } from "common/types"
import { HotkeyTrigger, Macro, Macros } from "../macros";


export const createDefaultMacros = () => {

  const macros = new Macros(null!);

  macros.add(
    new Macro(
      generateUUID(),
      "Alternate Scenes",
      new HotkeyTrigger("Tab"),
      [{
        id: generateUUID(),
        type: MacroActionType.ModifyAppSettings,
        field: ["game", "sceneController"],
        effect: MacroActionEffect.IncreaseCycle
      }],
      MacroActionSequence.SingleAlternate
    )
  );

  macros.add(
    new Macro(
      generateUUID(),
      "Toggle Music",
  macros.add(
    new Macro(
      generateUUID(),
      "Scenes: Default",
      new HotkeyTrigger("Escape"),
      [
        {
          id: generateUUID(),
          type: MacroActionType.ModifyAppSettings,
          field: [
            "game",
            "sceneController"
          ],
          effect: MacroActionEffect.SetToDefault,
        }
      ], MacroActionSequence.AllSync
    )
  );

  macros.add(
    new Macro(
      generateUUID(),
      "Scenes: Battle",
      new HotkeyTrigger("F2"),
      [
        {
          id: generateUUID(),
          type: MacroActionType.ModifyAppSettings,
          field: [
            "game",
            "sceneController"
          ],
          effect: MacroActionEffect.Set,
          value: "@titan-reactor-plugins/camera-battle"
        }
      ], MacroActionSequence.AllSync
    )
  );

  macros.add(
    new Macro(
      generateUUID(),
      "Audio: Toggle Music",
      new HotkeyTrigger("KeyM"),
      [
        {
          id: generateUUID(),
          type: MacroActionType.ModifyAppSettings,
          field: ["audio", "music"],

          effect: MacroActionEffect.SetToDefault,

        },
        {
          id: generateUUID(),
          type: MacroActionType.ModifyAppSettings,
          field: ["audio", "music"],
          effect: MacroActionEffect.Min,
        },
      ],
      MacroActionSequence.SingleAlternate
    )
  );

  macros.add(
    new Macro(
      generateUUID(),
      "Audio: Toggle Sound",
      new HotkeyTrigger("KeyS"),
      [
        {
          id: generateUUID(),
          type: MacroActionType.ModifyAppSettings,
          field: ["audio", "sound"],
          effect: MacroActionEffect.SetToDefault,
        },
        {
          id: generateUUID(),
          type: MacroActionType.ModifyAppSettings,
          field: ["audio", "sound"],
          effect: MacroActionEffect.Min,
        },
      ],
      MacroActionSequence.SingleAlternate
    )
  );


  macros.add(
    new Macro(generateUUID(), "Replay: Pause", new HotkeyTrigger("KeyP"), [
      {
        id: generateUUID(),
        type: MacroActionType.CallGameTimeApi,
        effect: MacroActionEffect.CallMethod,
        value: `togglePause(); simpleMessage("⏯️")`,
      },
    ])
  );

  macros.add(
    new Macro(generateUUID(), "Replay: Speed Up", new HotkeyTrigger("KeyU"), [
      {
        id: generateUUID(),
        type: MacroActionType.CallGameTimeApi,
        effect: MacroActionEffect.CallMethod,
        value: "const speed = speedUp(); simpleMessage(`🔼 ${speed}x`)",
      },
    ])
  );

  macros.add(
    new Macro(generateUUID(), "Replay: Speed Down", new HotkeyTrigger("KeyD"), [
      {
        id: generateUUID(),
        type: MacroActionType.CallGameTimeApi,
        effect: MacroActionEffect.CallMethod,
        value: "const speed = speedDown(); simpleMessage(`🔽 ${speed}x`)",
      },
    ])
  );

  macros.add(
    new Macro(
      generateUUID(),
      "Replay: Skip Backwards",
      new HotkeyTrigger("BracketLeft"),
      [
        {
          id: generateUUID(),
          type: MacroActionType.CallGameTimeApi,
          effect: MacroActionEffect.CallMethod,
          value: "skipBackward(); simpleMessage('⏪')",
        },
      ]
    )
  );

  macros.add(
    new Macro(
      generateUUID(),
      "Replay: Skip Forwards",
      new HotkeyTrigger("BracketRight"),
      [
        {
          id: generateUUID(),
          type: MacroActionType.CallGameTimeApi,
          effect: MacroActionEffect.CallMethod,
          value: "skipForward(); simpleMessage('⏩')",
        },
      ]
    )
  );

  macros.add(
    new Macro(
      generateUUID(),
      "Replay: Go To Beginning",
      new HotkeyTrigger("Shift+BracketLeft"),
      [
        {
          id: generateUUID(),
          type: MacroActionType.CallGameTimeApi,
          effect: MacroActionEffect.CallMethod,
          value: "gotoFrame(0); simpleMessage('Replay Start')",
        },
      ]
    )
  );
  //     this.sendUIMessage("⏪");

  macros.add(
    new Macro(
      generateUUID(),
      "Replay: Go To End",
      new HotkeyTrigger("Shift+BracketRight"),
      [
        {
          id: generateUUID(),
          type: MacroActionType.CallGameTimeApi,
          effect: MacroActionEffect.CallMethod,
          value: "gotoFrame(replay.frameCount); simpleMessage('Replay End')",
        },
      ]
    )
  );

  return macros.serialize();
} 