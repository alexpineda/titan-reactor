import { generateUUID } from "three/src/math/MathUtils";
import { MacroActionEffect, MacroActionSequence, MacroActionType } from "common/types"
import { HotkeyTrigger, Macro, Macros } from "../macros";


export const createDefaultMacros = () => {

  const macros = new Macros();

  macros.add(
    new Macro(
      generateUUID(),
      "Change Scene Controller / Viewports",
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
      "Toggle Sound",
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
        value: "togglePause()",
      },
    ])
  );
  //     this.sendUIMessage("⏯️");

  macros.add(
    new Macro(generateUUID(), "Replay: Speed Up", new HotkeyTrigger("KeyU"), [
      {
        id: generateUUID(),
        type: MacroActionType.CallGameTimeApi,
        effect: MacroActionEffect.CallMethod,
        value: "speedUp()",
      },
    ])
  );
  //     this.sendUIMessage(`🔼 ${speed}x`);

  macros.add(
    new Macro(generateUUID(), "Replay: Speed Down", new HotkeyTrigger("KeyD"), [
      {
        id: generateUUID(),
        type: MacroActionType.CallGameTimeApi,
        effect: MacroActionEffect.CallMethod,
        value: "speedDown()",
      },
    ])
  );
  //    this.sendUIMessage(`🔽 ${speed}x`);

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
          value: "skipBackward()",
        },
      ]
    )
  );
  //     this.sendUIMessage("⏪");

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
          value: "skipForward()",
        },
      ]
    )
  );
  //    this.sendUIMessage("⏩");

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
          value: "gotoFrame(0)",
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
          value: "gotoFrame(replay.frameCount);",
        },
      ]
    )
  );

  macros.add(
    new Macro(generateUUID(), "Toggle Production", new HotkeyTrigger("Shift+P"), [
      {
        id: generateUUID(),
        type: MacroActionType.ModifyPluginSettings,
        pluginName: "@titan-reactor-plugins/production-bar",
        effect: MacroActionEffect.Toggle,
        field: ["toggleVisible"],
      },
    ])
  );
  return macros.serialize();
} 