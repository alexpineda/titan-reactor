/// <reference types="node" />
/// <reference types="react" />
declare module "runtime" {
    import React from "react";
    import { DumpedUnit, PluginStateMessage, UIStateAssets } from "titan-reactor/host";
    type Component = {
        pluginId: string;
        id: number;
        order: number;
        messageHandler: EventTarget;
        JSXElement: React.FC<any>;
        snap: string;
        screen: string;
    };
    type StateMessage = Partial<PluginStateMessage> & {
        firstInstall?: boolean;
    };
    export const useLocale: () => string | undefined;
    export const useReplay: () => {
        isBroodwar: number;
        gameName: string;
        mapName: string;
        gameType: number;
        gameSubtype: number;
        players: import("titan-reactor/host").ReplayPlayer[];
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
    } | undefined;
    export const useMap: () => {
        title: string;
        description: string;
        width: number;
        height: number;
        tileset: number;
        tilesetName: string;
    } | undefined;
    export const useFrame: () => {
        frame: number;
        playerData: Int32Array;
        unitProduction: Int32Array[];
        research: Int32Array[];
        upgrades: Int32Array[];
    } | undefined;
    export const usePlayers: () => import("titan-reactor/host").ReplayPlayer[];
    export const usePlayerFrame: () => (id: number) => PlayerInfo;
    export const usePlayer: () => (playerId: number) => import("titan-reactor/host").ReplayPlayer | undefined;
    export const useSelectedUnits: () => DumpedUnit[];
    export const useProgress: () => number | never[];
    export const getUnitIcon: (unit: DumpedUnit) => any;
    export const useProduction: () => (((playerId: number) => ({
        typeId: number;
        icon: number;
        count: number;
        progress: number;
        isUnit: boolean;
    } | null)[]) | ((playerId: number) => {
        typeId: number;
        icon: number;
        level: number;
        isUpgrade: boolean;
        progress: number;
    }[]) | ((playerId: number) => {
        typeId: number;
        icon: number;
        progress: number;
        isResearch: boolean;
    }[]))[];
    export const getFriendlyTime: (frame: number) => string;
    export const openUrl: (url: string) => void;
    export let assets: UIStateAssets;
    export let enums: any;
    export const RollingNumber: ({ value, upSpeed, downSpeed, ...props }: {
        value: number;
        upSpeed: number;
        downSpeed: number;
    }) => JSX.Element;
    export class PlayerInfo {
        _struct_size: number;
        playerId: number;
        playerData: Required<StateMessage>["frame"]["playerData"];
        get _offset(): number;
        get minerals(): number;
        get vespeneGas(): number;
        get supply(): number;
        get supplyMax(): number;
        get workerSupply(): number;
        get armySupply(): number;
        get apm(): number;
    }
    export const useMessage: (cb?: ((event: any) => void) | undefined, deps?: never[]) => void;
    export const useSendMessage: () => (message: any) => void;
    export const usePluginConfig: () => any;
    export const useStyleSheet: (content: string, deps?: never[]) => void;
    export const proxyFetch: (url: string) => Promise<Response>;
    export const _rc: (pluginId: string, component: Component, JSXElement: React.FC<any>) => void;
}
