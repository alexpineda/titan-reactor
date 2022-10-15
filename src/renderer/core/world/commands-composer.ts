import CommandsStream from "@process-replay/commands/commands-stream";
import { World } from "./world";

export const createCommandsComposer = (
    world: World,
    commandsStream: CommandsStream
) => {
    let cmds = commandsStream.generate();
    const _commandsThisFrame: unknown[] = [];
    let cmd = cmds.next();

    world.events.on( "frame-reset", () => {
        cmds = commandsStream.generate();
        cmd = cmds.next();
    } );

    return {
        get commandsThisFrame() {
            return _commandsThisFrame;
        },
        onFrame( frame: number ) {
            _commandsThisFrame.length = 0;
            while ( cmd.done === false ) {
                if ( typeof cmd.value === "number" ) {
                    if ( cmd.value > frame ) {
                        break;
                    }
                    // only include past 5 game seconds (in case we are skipping frames)
                } else if ( frame - cmd.value.frame < 120 ) {
                    _commandsThisFrame.push( cmd.value );
                }
                cmd = cmds.next();
            }
        },
    };
};
