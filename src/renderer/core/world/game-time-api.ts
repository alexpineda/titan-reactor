import Chk from "bw-chk";
import { Assets } from "@image/assets";
import { createSandboxApi } from "@openbw/sandbox-api";
import { OverlayComposerApi } from "./overlay-composer";
import { InputsComposerApi } from "./input-composer";
import { SceneComposerApi } from "./scene-composer";
import { SurfaceComposerApi } from "./surface-composer";
import { PostProcessingComposerApi } from "./postprocessing-composer";
import { ViewControllerComposerApi } from "./view-controller-composer";
import { OpenBwComposerApi } from "./openbw-composer";
import CommandsStream from "@process-replay/commands/commands-stream";
import {  GameLoopComposerApi } from "./game-loop-composer";
import { Replay } from "@process-replay/parse-replay";

/**
 * @public
 * The exposed api available to macros and plugins.
 */
export interface GameTimeApi
    extends OverlayComposerApi,
        InputsComposerApi,
        SceneComposerApi,
        SurfaceComposerApi,
        PostProcessingComposerApi,
        ViewControllerComposerApi,
        OpenBwComposerApi,
        GameLoopComposerApi
        {
    // & world composer api
    map: Chk;
    replay?: Replay;
    getCommands: () => CommandsStream;
    assets: Assets;
    exitScene(): void;
    sandboxApi: ReturnType<typeof createSandboxApi>;
    refreshScene(): void;
    simpleMessage( message: string ): void;
}
