import { SceneInputHandler } from "common/types";
import { GameViewPort } from "renderer/camera/game-viewport";
import { Vector3 } from "three";
import { PluginBase } from "./plugin-base";

export interface SceneController extends PluginBase, SceneInputHandler {
    viewports: GameViewPort[];
}

export class SceneController extends PluginBase {
    override isSceneController = true;
    viewports: GameViewPort[] = [];
    override get viewport() {
        return this.viewports[0];
    }
    override get secondViewport() {
        return this.viewports[1];
    }

    onUpdateAudioMixerLocation(target: Vector3, position: Vector3) {
        return position.lerp(target, this.settings.session.audioListenerDistance());
    }
}