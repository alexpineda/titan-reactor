import { CommandsStream } from "process-replay";
import { World } from "./world";

/**
 * Mostly responsible for collecting recent commands into a bundle for consumption by plugins, limits to previous 5 seconds of game time.
 * 
 * @param world 
 * @param commandsStream 
 * @returns 
 */
export const createCommandsComposer = (
    world: World,
    commandsStream: CommandsStream
) => {
    let cmds = commandsStream.generate();
    const _commandsThisFrame: unknown[] = [];
    let cmd = cmds.next();

    const reset = () => {
        cmds = commandsStream.generate();
        cmd = cmds.next();
    }

    world.events.on( "frame-reset", reset );

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
        reset
    };
};
