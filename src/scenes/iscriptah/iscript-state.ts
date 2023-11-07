import { ImageDAT, IScriptAnimation, IScriptProgram } from "common/types";

type Commands = IScriptAnimation & { header?: number };

export class IScriptState {
    iscript: IScriptProgram;
    imageDesc: ImageDAT;

    alreadyRun: Record<number, boolean> = {};
    commandIndex = 0;
    commands: Commands = [];
    callStack?: {
        commands: any;
        commandIndex: number;
    };

    waiting = 0;
    terminated = false;
    lifted = false;
    noBrkCode = false;
    ignoreRest = false;
    frameset = 0;
    frame = 0;
    frameOffset = 0;
    prevFrame = -1;
    //FIXME: refactor to exclude flip
    flip = false;
    prevFlip: boolean | null = null;
    //forced flip frame
    flipState = false;
    direction = 0;
    offset = {
        x: 0,
        y: 0,
    };
    flDirect = false;

    dbg: {
        prevAnimBlock?: {
            commands: any;
            commandIndex: number;
        };
    } = {};

    constructor( iscript: IScriptProgram, imageDesc: ImageDAT ) {
        this.iscript = iscript;
        this.imageDesc = imageDesc;

        if ( this.imageDesc.gfxTurns ) {
            this.frameset = 0;
        }
    }

    debugStorePreviousCommands() {
        this.dbg.prevAnimBlock = {
            commands: this.commands,
            commandIndex: this.commandIndex,
        };
    }
}
