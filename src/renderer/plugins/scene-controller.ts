import { SceneInputHandler } from "common/types";
import { GameViewPort } from "renderer/camera/game-viewport";
import { PluginBase } from "./plugin-base";

export interface SceneController extends PluginBase, SceneInputHandler {
    viewports: GameViewPort[];
};

export class SceneController extends PluginBase {
    override isSceneController = true;
    viewports: GameViewPort[] = [];
    override get viewport() {
        return this.viewports[0];
    }
    override get secondViewport() {
        return this.viewports[1];
    }
}