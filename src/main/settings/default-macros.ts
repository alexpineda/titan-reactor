export const defaultMacros = [{
    "id": "b681a745-61fb-47ef-8e09-554d5f41d30d",
    "name": "Classic Tilt",
    "trigger": {
        "type": "Hotkey",
        "value": {
            "ctrlKey": false,
            "altKey": false,
            "shiftKey": false,
            "codes": [
                "KeyT"
            ],
            "onKeyUp": false
        }
    },
    "actions": [{
        "id": "5b680a39-7a8b-4915-a9f7-41f98f3f7824",
        "type": "ModifyPluginSettings",
        "field": [
            "tilt"
        ],
        "pluginName": "@titan-reactor-plugins/camera-standard",
        "effect": "SetToDefault"
    },
    {
        "id": "45bde67f-4017-47fb-a6f1-225715bda226",
        "type": "ModifyPluginSettings",
        "field": [
            "tilt"
        ],
        "pluginName": "@titan-reactor-plugins/camera-standard",
        "effect": "Min"
    }
    ],
    "enabled": true,
    "actionSequence": "SingleAlternate",
    "conditions": [{
        "id": "69305f74-f12a-4e01-969e-331e3af66802",
        "type": "AppSettingsCondition",
        "field": [
            "input",
            "sceneController"
        ],
        "value": "@titan-reactor-plugins/camera-standard",
        "comparator": "Equals"
    }]
},
{
    "id": "bb2e5255-6dbd-413b-84b5-628c79c3190b",
    "name": "Minimap Visible",
    "trigger": {
        "type": "Hotkey",
        "value": {
            "ctrlKey": false,
            "altKey": false,
            "shiftKey": false,
            "codes": [
                "KeyM"
            ],
            "onKeyUp": false
        }
    },
    "actions": [{
        "id": "00c35057-ba8f-4965-bf4e-efb21c8cd1d9",
        "type": "ModifyAppSettings",
        "field": [
            "minimap",
            "enabled"
        ],
        "effect": "Toggle"
    }],
    "enabled": true,
    "actionSequence": "AllSync",
    "conditions": []
},
{
    "id": "83edabea-2f2a-499c-bda7-14a915e64b3f",
    "name": "Default -> Battle Camera",
    "enabled": true,
    "trigger": {
        "type": "Mouse",
        "value": {
            "ctrlKey": false,
            "altKey": false,
            "shiftKey": false,
            "button": 2
        }
    },
    "actionSequence": "AllSync",
    "actions": [{
        "id": "ee3e90e1-8a5e-429b-9f1d-73ca952d2f9b",
        "type": "ModifyAppSettings",
        "field": [
            "input",
            "sceneController"
        ],
        "effect": "Set",
        "value": "@titan-reactor-plugins/camera-battle"
    }],
    "conditions": [{
        "id": "3ee4264e-484a-40f1-99c9-0153d689c049",
        "type": "AppSettingsCondition",
        "field": [
            "input",
            "sceneController"
        ],
        "value": "@titan-reactor-plugins/camera-standard",
        "comparator": "Equals"
    }]
},
{
    "id": "5260dc33-374f-40e6-a4db-c6070eabe566",
    "name": "Battle -> Default Camera",
    "enabled": true,
    "trigger": {
        "type": "Mouse",
        "value": {
            "ctrlKey": false,
            "altKey": false,
            "shiftKey": false,
            "button": 2
        }
    },
    "actionSequence": "AllSync",
    "actions": [{
        "id": "b0ac7739-63e0-4c6d-a130-5304d3d44400",
        "type": "ModifyAppSettings",
        "field": [
            "input",
            "sceneController"
        ],
        "effect": "Set",
        "value": "@titan-reactor-plugins/camera-standard"
    }],
    "conditions": [{
        "id": "69c4ba30-fd70-474e-9a0d-00b37e0a57c2",
        "type": "AppSettingsCondition",
        "field": [
            "input",
            "sceneController"
        ],
        "value": "@titan-reactor-plugins/camera-battle",
        "comparator": "Equals"
    }]
},
{
    "id": "ee4f7b6b-3a1b-4762-94ee-2843d7300a4d",
    "name": "Toggle Render Mode",
    "enabled": true,
    "trigger": {
        "type": "Hotkey",
        "value": {
            "ctrlKey": false,
            "altKey": false,
            "shiftKey": false,
            "codes": [
                "F5"
            ],
            "onKeyUp": false
        }
    },
    "actionSequence": "AllSync",
    "actions": [{
        "id": "f027f9f6-253e-44a9-927b-3896542f8a95",
        "type": "CallGameTimeApi",
        "value": "api.changeRenderMode();",
        "effect": "CallMethod"
    }],
    "conditions": []
},
{
    "id": "7d7c10a0-d644-40ac-8e76-4b6b262ac1d4",
    "name": "Audio: Toggle Music",
    "enabled": true,
    "trigger": {
        "type": "Hotkey",
        "value": {
            "ctrlKey": true,
            "altKey": false,
            "shiftKey": false,
            "codes": [
                "KeyS"
            ],
            "onKeyUp": false
        }
    },
    "actionSequence": "SingleAlternate",
    "actions": [{
        "id": "fdd33f41-73ef-4d2f-8c02-8048206ee177",
        "type": "ModifyAppSettings",
        "field": [
            "audio",
            "music"
        ],
        "effect": "SetToDefault"
    },
    {
        "id": "2017a6af-8dc1-431e-b64c-6aaab0358a6c",
        "type": "ModifyAppSettings",
        "field": [
            "audio",
            "music"
        ],
        "effect": "Min"
    }
    ],
    "conditions": []
},
{
    "id": "5c07af68-d1d6-446c-9f9c-e60b10122c6f",
    "name": "Audio: Toggle Sound",
    "enabled": true,
    "trigger": {
        "type": "Hotkey",
        "value": {
            "ctrlKey": false,
            "altKey": false,
            "shiftKey": false,
            "codes": [
                "KeyS"
            ],
            "onKeyUp": false
        }
    },
    "actionSequence": "SingleAlternate",
    "actions": [{
        "id": "a6c69337-8728-4b1b-91a5-e4a5b3317967",
        "type": "ModifyAppSettings",
        "field": [
            "audio",
            "sound"
        ],
        "effect": "SetToDefault"
    },
    {
        "id": "7c5076fc-16bd-4b10-9704-1dc0feea23af",
        "type": "ModifyAppSettings",
        "field": [
            "audio",
            "sound"
        ],
        "effect": "Min"
    }
    ],
    "conditions": []
},
{
    "id": "4c447649-4411-4244-9fea-a7626c163110",
    "name": "Replay: Pause",
    "enabled": true,
    "trigger": {
        "type": "Hotkey",
        "value": {
            "ctrlKey": false,
            "altKey": false,
            "shiftKey": false,
            "codes": [
                "KeyP"
            ],
            "onKeyUp": false
        }
    },
    "actionSequence": "AllSync",
    "actions": [{
        "id": "87dfc4b6-3689-4f3d-aeea-a7fcd08cc7a9",
        "type": "CallGameTimeApi",
        "effect": "CallMethod",
        "value": "api.togglePause(); \napi.simpleMessage(\"⏯️\")"
    }],
    "conditions": []
},
{
    "id": "7222026c-de7f-4c2a-ba56-355b5de989de",
    "name": "Replay: Speed Up",
    "enabled": true,
    "trigger": {
        "type": "Hotkey",
        "value": {
            "ctrlKey": false,
            "altKey": false,
            "shiftKey": false,
            "codes": [
                "KeyU"
            ],
            "onKeyUp": false
        }
    },
    "actionSequence": "AllSync",
    "actions": [{
        "id": "3eb3f21a-08ce-4ac0-87ef-5739a7f27aad",
        "type": "CallGameTimeApi",
        "effect": "CallMethod",
        "value": "const speed = api.speedUp(); \napi.simpleMessage(`🔼 ${speed}x`)"
    }],
    "conditions": []
},
{
    "id": "c4cd7c76-8c02-429d-8b94-a4cda8ea4504",
    "name": "Replay: Speed Down",
    "enabled": true,
    "trigger": {
        "type": "Hotkey",
        "value": {
            "ctrlKey": false,
            "altKey": false,
            "shiftKey": false,
            "codes": [
                "KeyD"
            ],
            "onKeyUp": false
        }
    },
    "actionSequence": "AllSync",
    "actions": [{
        "id": "ae987d9e-c555-4378-b874-0cfaa1652e52",
        "type": "CallGameTimeApi",
        "effect": "CallMethod",
        "value": "const speed = api.speedDown(); \napi.simpleMessage(`🔽 ${speed}x`)"
    }],
    "conditions": []
},
{
    "id": "ead3d08d-a2a6-41d7-92c3-e5935ef36feb",
    "name": "Replay: Skip Backwards",
    "enabled": true,
    "trigger": {
        "type": "Hotkey",
        "value": {
            "ctrlKey": false,
            "altKey": false,
            "shiftKey": false,
            "codes": [
                "BracketLeft"
            ],
            "onKeyUp": false
        }
    },
    "actionSequence": "AllSync",
    "actions": [{
        "id": "ceb12d9f-4122-4f54-88a1-d44f92ec0552",
        "type": "CallGameTimeApi",
        "effect": "CallMethod",
        "value": "api.skipBackward(); \napi.simpleMessage('⏪')"
    }],
    "conditions": []
},
{
    "id": "4f122a3a-c80a-4d0c-a3de-8f27b9e7a5f6",
    "name": "Replay: Skip Forwards",
    "enabled": true,
    "trigger": {
        "type": "Hotkey",
        "value": {
            "ctrlKey": false,
            "altKey": false,
            "shiftKey": false,
            "codes": [
                "BracketRight"
            ],
            "onKeyUp": false
        }
    },
    "actionSequence": "AllSync",
    "actions": [{
        "id": "8bda1f97-01e8-4160-ae8e-57c0ba6a41fd",
        "type": "CallGameTimeApi",
        "effect": "CallMethod",
        "value": "api.skipForward(); \napi.simpleMessage('⏩')"
    }],
    "conditions": []
},
{
    "id": "a8545069-82cc-4dd5-a869-bb686d775c0b",
    "name": "Replay: Go To Beginning",
    "enabled": true,
    "trigger": {
        "type": "Hotkey",
        "value": {
            "ctrlKey": false,
            "altKey": false,
            "shiftKey": true,
            "codes": [
                "BracketLeft"
            ],
            "onKeyUp": false
        }
    },
    "actionSequence": "AllSync",
    "actions": [{
        "id": "918f3bab-688c-4794-b523-cf841c142a1e",
        "type": "CallGameTimeApi",
        "effect": "CallMethod",
        "value": "api.skipBackward(100); \napi.simpleMessage('⏪')"
    }],
    "conditions": []
},
{
    "id": "2af3f80f-973c-485a-a520-b3667f91e5fc",
    "name": "Replay: Go To End",
    "enabled": true,
    "trigger": {
        "type": "Hotkey",
        "value": {
            "ctrlKey": false,
            "altKey": false,
            "shiftKey": true,
            "codes": [
                "BracketRight"
            ],
            "onKeyUp": false
        }
    },
    "actionSequence": "AllSync",
    "actions": [{
        "id": "5c6498b4-6365-4ffa-bd71-4db0a59d7499",
        "type": "CallGameTimeApi",
        "effect": "CallMethod",
        "value": "api.skipForward(100); \napi.simpleMessage('⏩')"
    }],
    "conditions": []
}
]