import { BasePlayer } from "@core/players";
import BaseScene from "@render/base-scene";
import Chk from "bw-chk";
import { Assets } from "common/types";
import { PxToWorld } from "common/utils/conversions";
import { GameViewPort } from "renderer/camera/game-viewport";
import { Color, Scene } from "three";
import { createSandboxApi } from "@openbw/sandbox-api";

export interface GameTimeApi {
    type: "replay" | "game" | "live",
    sandboxApi: ReturnType<typeof createSandboxApi> | undefined,
    viewport: GameViewPort;
    secondViewport: GameViewPort
    simpleMessage(message: string): void;
    scene: BaseScene;
    cssScene: Scene;
    assets: Assets;
    map: Chk;
    toggleFogOfWarByPlayerId(playerId: number): void;
    skipForward(seconds: number): void;
    skipBackward(seconds: number): void;
    speedUp(): number;
    speedDown(): number;
    togglePause(setPaused?: boolean): boolean;
    readonly gameSpeed: number;
    setGameSpeed(speed: number): void;
    refreshScene(): void;
    pxToWorld: PxToWorld;
    readonly currentFrame: number;
    gotoFrame(frame: number): void;
    exitScene(): void;
    setPlayerColors(colors: string[]): void;
    getPlayerColor(playerId: number): Color;
    getOriginalColors(): readonly string[];
    setPlayerNames(names: { name: string, id: number }[]): void;
    getOriginalNames(): readonly { name: string, id: number }[];
    getPlayers(): BasePlayer[];
    playSound(typeId: number, volumeOrX?: number, y?: number, unitTypeId?: number): void;
    togglePointerLock(val: boolean): void;
    readonly pointerLockLost: boolean;
    changeRenderMode(renderMode3D: boolean): void
}