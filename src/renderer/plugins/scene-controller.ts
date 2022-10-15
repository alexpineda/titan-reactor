import { SceneInputHandler } from "common/types";
import { GameViewPort } from "renderer/camera/game-viewport";
import { Vector3 } from "three";
import { PluginBase } from "./plugin-base";

export class SceneController extends PluginBase implements SceneInputHandler {
    override isSceneController = true;
    viewports: GameViewPort[] = [];
    gameOptions = { audio: "stereo" as const };
    override get viewport() {
        return this.viewports[0];
    }
    override get secondViewport() {
        return this.viewports[1];
    }

    onEnterScene( prevData: unknown ) {
        return Promise.resolve( prevData );
    }

    onUpdateAudioMixerLocation( target: Vector3, position: Vector3 ) {
        return position.lerp(
            target,
            this.settings.session.audioListenerDistance() as number
        );
    }
}
