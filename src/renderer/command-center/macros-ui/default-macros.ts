import { generateUUID } from "three/src/math/MathUtils";
import { MacroActionEffect, MacroActionSequence, MacroActionType, MacroConditionComparator, MacroConditionType } from "common/types"
import { HotkeyTrigger, Macro, Macros } from "@macros";
import { MouseTrigger } from "@macros/mouse-trigger";


export const createDefaultMacros = () => {

  const macros = new Macros();

  macros.add(
    new Macro(
      generateUUID(),
      "Default -> Battle Camera",
      new MouseTrigger({ ctrlKey: false, altKey: false, shiftKey: false, button: 2 }),
      [{
        id: generateUUID(),
        type: MacroActionType.ModifyAppSettings,
        field: [
          "game",
          "sceneController"
        ],
        effect: MacroActionEffect.Set,
        value: "@titan-reactor-plugins/camera-battle"
      }],
      MacroActionSequence.AllSync,
      [
        {
          id: generateUUID(),
          type: MacroConditionType.AppSettingsCondition,
          field: [
            "game",
            "sceneController"
          ],
          comparator: MacroConditionComparator.Equals,
          value: "@titan-reactor-plugins/camera-standard"
        }
      ]
    )
  );

  macros.add(
    new Macro(
      generateUUID(),
      "Battle -> Default Camera",
      new MouseTrigger({ ctrlKey: false, altKey: false, shiftKey: false, button: 2 }),
      [{
        id: generateUUID(),
        type: MacroActionType.ModifyAppSettings,
        field: [
          "game",
          "sceneController"
        ],
        effect: MacroActionEffect.Set,
        value: "@titan-reactor-plugins/camera-standard"
      }],
      MacroActionSequence.AllSync,
      [
        {
          id: generateUUID(),
          type: MacroConditionType.AppSettingsCondition,
          field: [
            "game",
            "sceneController"
          ],
          comparator: MacroConditionComparator.Equals,
          value: "@titan-reactor-plugins/camera-battle"
        }
      ]
    )
  );

  macros.add(
    new Macro(
      generateUUID(),
      "Toggle 3D",
      new HotkeyTrigger({
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        onKeyUp: false,
        codes: ["F5"]
      }),
      [{
        id: generateUUID(),
        type: MacroActionType.CallGameTimeApi,
        value: "changeRenderMode();",
        effect: MacroActionEffect.CallMethod
      }],
      MacroActionSequence.AllSync
    )
  );


  macros.add(
    new Macro(
      generateUUID(),
      "Alternate Scenes",
      new HotkeyTrigger({
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        onKeyUp: false,
        codes: ["Tab"]
      }),
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
      "Audio: Toggle Music",
      new HotkeyTrigger({
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        onKeyUp: false,
        codes: ["KeyM"]
      }),
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
      new HotkeyTrigger({
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        onKeyUp: false,
        codes: ["KeyS"]
      }),
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
    new Macro(generateUUID(), "Replay: Pause", new HotkeyTrigger({
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      onKeyUp: false,
      codes: ["KeyP"]
    }), [
      {
        id: generateUUID(),
        type: MacroActionType.CallGameTimeApi,
        effect: MacroActionEffect.CallMethod,
        value: `togglePause(); simpleMessage("⏯️")`,
      },
    ])
  );

  macros.add(
    new Macro(generateUUID(), "Replay: Speed Up", new HotkeyTrigger({
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      onKeyUp: false,
      codes: ["KeyU"]
    }), [
      {
        id: generateUUID(),
        type: MacroActionType.CallGameTimeApi,
        effect: MacroActionEffect.CallMethod,
        value: "const speed = speedUp(); simpleMessage(`🔼 ${speed}x`)",
      },
    ])
  );

  macros.add(
    new Macro(generateUUID(), "Replay: Speed Down", new HotkeyTrigger({
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      onKeyUp: false,
      codes: ["KeyD"]
    }), [
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
      new HotkeyTrigger({
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        onKeyUp: false,
        codes: ["BracketLeft"]
      }),
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
      new HotkeyTrigger({
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        onKeyUp: false,
        codes: ["BracketRight"]
      }),
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
      new HotkeyTrigger({
        ctrlKey: false,
        altKey: false,
        shiftKey: true,
        onKeyUp: false,
        codes: ["BracketLeft"]
      }),
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

  macros.add(
    new Macro(
      generateUUID(),
      "Replay: Go To End",
      new HotkeyTrigger({
        ctrlKey: false,
        altKey: false,
        shiftKey: true,
        onKeyUp: false,
        codes: ["BracketRight"]
      }),
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