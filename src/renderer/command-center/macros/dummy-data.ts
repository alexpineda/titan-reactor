// export default {
//     "version": "1.0.0",
//     "revision": 0,
//     "macros": [
//         {
//             "id": "79A32F27-6A14-48B7-B33B-F24A0E5D787A",
//             "name": "Switch Camera",
//             "enabled": true,
//             "trigger": {
//                 "type": "hotkey",
//                 "value": "Ctrl+Digit1"
//             },
//             "actionSequence": "AllSync",
//             "actions": [
//                 {
//                     "id": "A44545E2-6A28-44AD-9F49-83BF70577EAA",
//                     "target": 0,
//                     "effect": "CallMethod"
//                 }
//             ]
//         },
//         {
//             "id": "7F73C4D5-438B-47DD-80C2-AB487E09132A",
//             "name": "Toggle Music",
//             "enabled": true,
//             "trigger": {
//                 "type": "hotkey",
//                 "value": "KeyM"
//             },
//             "actionSequence": "SingleAlternate",
//             "actions": [
//                 {
//                     "id": "BE0537BD-E1CD-4B67-9461-5C706D7BB1A0",
//                     "target": 0,
//                     "field": [
//                         "audio",
//                         "music"
//                     ],
//                     "effect": "SetToDefault"
//                 },
//                 {
//                     "id": "0EDC45D7-E83E-4703-B548-83AFF96C6FD1",
//                     "target": 0,
//                     "field": [
//                         "audio",
//                         "music"
//                     ],
//                     "effect": "Min"
//                 }
//             ]
//         },
//         {
//             "id": "EC299588-D640-4C32-91A3-95327852C73C",
//             "name": "Toggle Sound",
//             "enabled": true,
//             "trigger": {
//                 "type": "hotkey",
//                 "value": "KeyS"
//             },
//             "actionSequence": "SingleAlternate",
//             "actions": [
//                 {
//                     "id": "2FE9A899-C8EB-4841-A2C7-3069E560D85A",
//                     "target": 0,
//                     "field": [
//                         "audio",
//                         "sound"
//                     ],
//                     "effect": "SetToDefault"
//                 },
//                 {
//                     "id": "F61AA148-7990-4F88-B777-4CD0FD27F3A7",
//                     "target": 0,
//                     "field": [
//                         "audio",
//                         "sound"
//                     ],
//                     "effect": "Min"
//                 }
//             ]
//         },
//         {
//             "id": "518F43DF-A21D-4CA9-8062-1816F8CF5443",
//             "name": "Replay: Pause",
//             "enabled": true,
//             "trigger": {
//                 "type": "hotkey",
//                 "value": "KeyP"
//             },
//             "actionSequence": "AllSync",
//             "actions": [
//                 {
//                     "id": "F499E3AF-41FD-4D4C-B175-A23A6462A044",
//                     "target": 1,
//                     "effect": "CallMethod",
//                     "value": "togglePause()"
//                 }
//             ]
//         },
//         {
//             "id": "07E4217A-3474-4F24-A76C-260D222A1B38",
//             "name": "Replay: Speed Up",
//             "enabled": true,
//             "trigger": {
//                 "type": "hotkey",
//                 "value": "KeyU"
//             },
//             "actionSequence": "AllSync",
//             "actions": [
//                 {
//                     "id": "C4C9A8D7-1E7C-44E0-B613-C78CDBA64101",
//                     "target": 1,
//                     "effect": "CallMethod",
//                     "value": "speedUp()"
//                 }
//             ]
//         },
//         {
//             "id": "B89E42D1-79C4-4DED-B474-65065F679844",
//             "name": "Replay: Speed Down",
//             "enabled": true,
//             "trigger": {
//                 "type": "hotkey",
//                 "value": "KeyD"
//             },
//             "actionSequence": "AllSync",
//             "actions": [
//                 {
//                     "id": "E17DCCB3-14CD-447D-90D6-62A6214E98CA",
//                     "target": 1,
//                     "effect": "CallMethod",
//                     "value": "speedDown()"
//                 }
//             ]
//         },
//         {
//             "id": "0EF185EB-3A10-413C-883A-4F93A3D5D07E",
//             "name": "Replay: Skip Backwards",
//             "enabled": true,
//             "trigger": {
//                 "type": "hotkey",
//                 "value": "BracketLeft"
//             },
//             "actionSequence": "AllSync",
//             "actions": [
//                 {
//                     "id": "19E54F61-E90C-476A-A343-DAD936351228",
//                     "target": 1,
//                     "effect": "CallMethod",
//                     "value": "skipBackward()"
//                 }
//             ]
//         },
//         {
//             "id": "BD9B722F-7D84-4038-9C2B-78B9821E6EC0",
//             "name": "Replay: Skip Forwards",
//             "enabled": true,
//             "trigger": {
//                 "type": "hotkey",
//                 "value": "BracketRight"
//             },
//             "actionSequence": "AllSync",
//             "actions": [
//                 {
//                     "id": "E51D3F8A-FBBB-40B7-B69B-D1867372ED08",
//                     "target": 1,
//                     "effect": "CallMethod",
//                     "value": "skipForward()"
//                 }
//             ]
//         },
//         {
//             "id": "CB6FD06B-4F25-4CCB-8F25-2727BF36D6B3",
//             "name": "Replay: Skip Backwards",
//             "enabled": true,
//             "trigger": {
//                 "type": "hotkey",
//                 "value": "Shift+BracketLeft"
//             },
//             "actionSequence": "AllSync",
//             "actions": [
//                 {
//                     "id": "12D9CB1D-83AA-40EC-BDDC-258FE0898B93",
//                     "target": 1,
//                     "effect": "CallMethod",
//                     "value": "skipBackward(Infinity)"
//                 }
//             ]
//         },
//         {
//             "id": "1C288312-50A6-45A9-A16E-F08B73E05218",
//             "name": "Replay: Skip Forwards",
//             "enabled": true,
//             "trigger": {
//                 "type": "hotkey",
//                 "value": "Shift+BracketRight"
//             },
//             "actionSequence": "AllSync",
//             "actions": [
//                 {
//                     "id": "9F6FA043-8A31-439E-BF54-8BFDAC8B68B5",
//                     "target": 1,
//                     "effect": "CallMethod",
//                     "value": "skipForward(Infinity)"
//                 }
//             ]
//         },
//         {
//             "id": "887D4F8C-9E39-43F6-A8D4-D96E0B09A81D",
//             "name": "Play Selected Unit Sounds",
//             "enabled": true,
//             "trigger": {
//                 "type": "hotkey",
//                 "value": "Shift+P"
//             },
//             "actionSequence": "AllSync",
//             "actions": [
//                 {
//                     "id": "4607AFD0-8222-469B-91AD-54B9B56F20F9",
//                     "target": 2,
//                     "targetId": "@titan-reactor-plugins/unit-sounds",
//                     "effect": "CallMethod",
//                     "field": [
//                         "onMacroPlaySelected"
//                     ]
//                 }
//             ]
//         },
//         {
//             "id": "7CE2027E-CB32-40E1-A9EF-8D2BB53B6710",
//             "name": "Toggle Visible",
//             "enabled": true,
//             "trigger": {
//                 "type": "hotkey",
//                 "value": "Shift+P"
//             },
//             "actionSequence": "AllSync",
//             "actions": [
//                 {
//                     "id": "09D6FF3E-4823-448A-B5AA-E7CF36DD57DE",
//                     "target": 2,
//                     "targetId": "@titan-reactor-plugins/production-bar",
//                     "effect": "Toggle",
//                     "field": [
//                         "toggleVisible"
//                     ]
//                 }
//             ]
//         }
//     ]
// }

import { generateUUID } from "three/src/math/MathUtils";
import { HotkeyTrigger, Macro, MacroActionEffect, MacroActionSequence, Macros, MacroTargetContext } from "../macros";

const macros = new Macros();
macros.add(
    new Macro(
      generateUUID(),
      "Switch Camera",
      new HotkeyTrigger(`Ctrl+Digit1`),
      [
        {
          id: generateUUID(),
          target: MacroTargetContext.Host,
          effect: MacroActionEffect.CallMethod,
          value: () => alert("hi"),
        },
      ]
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
          target: MacroTargetContext.Host,
          field: ["audio", "music"],
          effect: MacroActionEffect.SetToDefault,
        },
        {
          id: generateUUID(),
          target: MacroTargetContext.Host,
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
          target: MacroTargetContext.Host,
          field: ["audio", "sound"],
          effect: MacroActionEffect.SetToDefault,
        },
        {
          id: generateUUID(),
          target: MacroTargetContext.Host,
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
        target: MacroTargetContext.GameTimeApi,
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
        target: MacroTargetContext.GameTimeApi,
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
        target: MacroTargetContext.GameTimeApi,
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
          target: MacroTargetContext.GameTimeApi,
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
          target: MacroTargetContext.GameTimeApi,
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
      "Replay: Skip Backwards",
      new HotkeyTrigger("Shift+BracketLeft"),
      [
        {
          id: generateUUID(),
          target: MacroTargetContext.GameTimeApi,
          effect: MacroActionEffect.CallMethod,
          value: "skipBackward(Infinity)",
        },
      ]
    )
  );
  //     this.sendUIMessage("⏪");

  macros.add(
    new Macro(
      generateUUID(),
      "Replay: Skip Forwards",
      new HotkeyTrigger("Shift+BracketRight"),
      [
        {
          id: generateUUID(),
          target: MacroTargetContext.GameTimeApi,
          effect: MacroActionEffect.CallMethod,
          value: "skipForward(Infinity)",
        },
      ]
    )
  );

  macros.add(
    new Macro(
      generateUUID(),
      "Play Selected Unit Sounds",
      new HotkeyTrigger("Shift+P"),
      [
        {
          id: generateUUID(),
          target: MacroTargetContext.Plugin,
          targetId: "@titan-reactor-plugins/unit-sounds",
          effect: MacroActionEffect.CallMethod,
          field: ["onMacroPlaySelected"],
        },
      ]
    )
  );

  macros.add(
    new Macro(generateUUID(), "Toggle Visible", new HotkeyTrigger("Shift+P"), [
      {
        id: generateUUID(),
        target: MacroTargetContext.Plugin,
        targetId: "@titan-reactor-plugins/production-bar",
        effect: MacroActionEffect.Toggle,
        field: ["toggleVisible"],
      },
    ])
  );

  export default macros.serialize();