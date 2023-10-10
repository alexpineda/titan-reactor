import Chk from "bw-chk";
import { Assets } from "@image/assets";
import { createSandboxApi } from "@openbw/sandbox-api";
import { OverlayComposerApi } from "./overlay-composer";
import { InputsComposerApi } from "./input-composer";
import { SceneComposerApi } from "./scene-composer";
import { SurfaceComposerApi } from "./surface-composer";
import { PostProcessingComposerApi } from "./postprocessing-composer";
import { ViewControllerComposerApi } from "./view-composer";
import { OpenBwComposerApi } from "./openbw-composer";
import CommandsStream from "@process-replay/commands/commands-stream";

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
        OpenBwComposerApi {
    // & world composer api
    map: Chk;
    getCommands: () => CommandsStream;
    assets: Assets;
    exitScene(): void;
    sandboxApi: ReturnType<typeof createSandboxApi>;
    refreshScene(): void;
    simpleMessage( message: string ): void;
}
