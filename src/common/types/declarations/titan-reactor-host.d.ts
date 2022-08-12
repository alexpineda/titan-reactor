declare module "titan-reactor-host" {
        // events.ts

        export const UI_SYSTEM_READY = "system:ready";
        export const UI_SYSTEM_PLUGIN_CONFIG_CHANGED = "system:plugin-config-changed";
        export const UI_SYSTEM_MOUSE_CLICK = "system:mouse-click";
        export const UI_SYSTEM_CUSTOM_MESSAGE = "system:custom-message";
        export const UI_SYSTEM_FIRST_INSTALL = "system:first-install";
        export const UI_SYSTEM_OPEN_URL = "system:open-url";
        export const UI_SYSTEM_RUNTIME_READY = "system:runtime-ready";
        export const UI_SYSTEM_PLUGIN_DISABLED = "system:plugin-disabled";
        export const UI_SYSTEM_PLUGINS_ENABLED = "system:plugins-enabled";

        export const UI_STATE_EVENT_ON_FRAME = "frame";
        export const UI_STATE_EVENT_DIMENSIONS_CHANGED = "dimensions";
        export const UI_STATE_EVENT_SCREEN_CHANGED = "screen";
        export const UI_STATE_EVENT_WORLD_CHANGED = "world";
        export const UI_STATE_EVENT_UNITS_SELECTED = "units";
        export const UI_STATE_EVENT_PROGRESS = "progress";

        // minimap-dimensions.ts

        // keep this as a separate type instead of usign Result because
        // we will re-export this type in build-api-types for the plugin runtime
        export type MinimapDimensions = {
                minimapWidth: number;
                minimapHeight: number;
        };

        // D:/dev/titan-reactor/src/common/types/structs/thingy-struct.d.ts

        export interface ThingyStruct {
                hp: number;
                spriteIndex: number;
        }

        // D:/dev/titan-reactor/src/common/types/structs/flingy-struct.d.ts

        export interface FlingyStruct extends ThingyStruct {
                x: number;
                y: number;
                direction: number;
        }

        // D:/dev/titan-reactor/src/common/types/structs/unit-struct.d.ts

        export interface UnitStruct extends FlingyStruct {
                id: number;
                typeId: number;
                owner: number;
                energy: number;
                shields: number;
                statusFlags: number;
                remainingBuildTime: number;
                resourceAmount: number;
                order: number | null;
                kills: number;
                orderTargetAddr: number;
                orderTargetX: number;
                orderTargetY: number;
                orderTargetUnit: number;
                subunitId: number | null;
        }

        // units-dat.ts

        export type UnitDAT = {
                index: number;
                flingy: any;
                subUnit1: number;
                subUnit2: number;
                infestation: number[];
                constructionAnimation: any;
                direction: number;
                shieldsEnabled: boolean;
                shields: number;
                hp: number;
                elevationLevel: number;
                groundWeapon: number;
                airWeapon: number;
                sightRange: number;
                armorUpgrade: number;
                unitSize: number;
                armor: number;
                readySound: number;
                whatSound: number[];
                yesSound: number[];
                pissSound: number[];
                whatSoundStart: number;
                whatSoundEnd: number;
                yesSoundStart: number;
                yesSoundEnd: number;
                pissSoundStart: number;
                pissSoundEnd: number;
                placementWidth: number;
                placementHeight: number;
                addonHorizontal: number;
                addonVertical: number;
                unitSizeLeft: number;
                unitSizeUp: number;
                unitSizeRight: number;
                unitSizeDown: number;
                portrait: number;
                mineralCost: number;
                vespeneCost: number;
                buildTime: number;
                requirements: number;
                starEditGroupFlags: number;
                supplyProvided: number;
                supplyRequired: number;
                spaceRequired: number;
                spaceProvided: number;
                buildScore: number;
                destroyScore: number;
                starEditAvailabilityFlags: number;
        };
        // parse-replay-header.ts

        export type ReplayPlayer = {
                id: number;
                name: string;
                race: "zerg" | "terran" | "protoss" | "unknown";
                team: number;
                color: string;
                isComputer: boolean;
                isHuman: boolean;
                isActive: boolean;
        };
        // unit.ts

        export type Unit = UnitStruct & {
                extras: { recievingDamage: number; selected?: boolean; dat: UnitDAT };
        };
        // scene.ts

        export type SceneStateID =
                | "@home"
                | "@loading"
                | "@replay"
                | "@map"
                | "@iscriptah"
                | "@interstitial";
        // plugin-system-ui.ts

        export type PluginStateMessage = {
                language: string;
                dimensions: MinimapDimensions;
                screen: { screen: SceneStateID; error?: string | null };
                world: {
                        map: {
                                title: any;
                                description: any;
                                width: any;
                                height: any;
                                tileset: any;
                                tilesetName: any;
                        };
                        replay: {
                                isBroodwar: number;
                                gameName: any;
                                mapName: any;
                                gameType: number;
                                gameSubtype: number;
                                players: ReplayPlayer[];
                                frameCount: number;
                                randomSeed: number;
                                ancillary: {
                                        campaignId: number;
                                        commandByte: number;
                                        playerBytes: Buffer;
                                        unk1: number;
                                        playerName: Buffer;
                                        gameFlags: number;
                                        mapWidth: number;
                                        mapHeight: number;
                                        activePlayerCount: number;
                                        slotCount: number;
                                        gameSpeed: number;
                                        gameState: number;
                                        unk2: number;
                                        tileset: number;
                                        replayAutoSave: number;
                                        computerPlayerCount: number;
                                        unk3: number;
                                        unk4: number;
                                        unk5: number;
                                        unk6: number;
                                        victoryCondition: number;
                                        resourceType: number;
                                        useStandardUnitStats: number;
                                        fogOfWarEnabled: number;
                                        createInitialUnits: number;
                                        useFixedPositions: number;
                                        restrictionFlags: number;
                                        alliesEnabled: number;
                                        teamsEnabled: number;
                                        cheatsEnabled: number;
                                        tournamentMode: number;
                                        victoryConditionValue: number;
                                        startingMinerals: number;
                                        startingGas: number;
                                        unk7: number;
                                };
                        };
                };
                frame: {
                        frame: number;
                        playerData: Int32Array;
                        unitProduction: Int32Array[];
                        research: Int32Array[];
                        upgrades: Int32Array[];
                };
                progress: number;
                units: Unit[];
        };
}
