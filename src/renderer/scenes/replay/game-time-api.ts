import { Terrain } from "@core/terrain";
import { Unit } from "@core/unit";
import { GetTerrainY } from "@image/generate-map";
import { ReplayHeader, ReplayPlayer } from "@process-replay/parse-replay-header";
import BaseScene from "@render/base-scene";
import { Assets, PxToGameUnit, Settings } from "common/types";
import { GameViewPort } from "renderer/camera/game-viewport";
import { Color, Scene, Vector3 } from "three";


export interface GameTimeApi {
    type: "replay",
    viewport: GameViewPort;
    secondViewport: GameViewPort
    simpleMessage(message: string): void;
    cameraMovementSpeed: Settings["game"]["movementSpeed"];
    cameraRotateSpeed: Settings["game"]["rotateSpeed"];
    cameraZoomLevels: Settings["game"]["zoomLevels"];
    scene: BaseScene;
    cssScene: Scene;
    assets: Assets;
    toggleFogOfWarByPlayerId(playerId: number): void;
    unitsIterator(): IterableIterator<Unit>;
    skipForward(seconds: number): void;
    skipBackward(seconds: number): void;
    speedUp(): number;
    speedDown(): number;
    togglePause(setPaused?: boolean): boolean;
    readonly gameSpeed: number;
    setGameSpeed(speed: number): void;
    refreshScene(): void;
    pxToGameUnit: PxToGameUnit;
    mapWidth: number;
    mapHeight: number;
    tileset: number;
    tilesetName: string;
    getTerrainY: GetTerrainY;
    terrain: Terrain;
    readonly currentFrame: number;
    readonly maxFrame: number;
    gotoFrame(frame: number): void;
    exitScene(): void;
    setPlayerColors(colors: string[]): void;
    getPlayerColor(playerId: number): Color;
    getOriginalColors(): readonly string[];
    setPlayerNames(names: { name: string, id: number }[]): void;
    getOriginalNames(): readonly { name: string, id: number }[];
    getPlayers(): ReplayPlayer[];
    replay: ReplayHeader;
    readonly followedUnitsPosition: Vector3 | undefined | null;
    selectUnits(units: number[]): void;
    selectedUnits: Unit[];
    playSound(typeId: number, volumeOrX?: number, y?: number, unitTypeId?: number): void;
    togglePointerLock(val: boolean): void;
    readonly pointerLockLost: boolean;
    mouseCursor: boolean;
    minimap: {
        enabled: boolean;
        scale: number;
    },
    changeRenderMode(renderMode3D: boolean): void
}