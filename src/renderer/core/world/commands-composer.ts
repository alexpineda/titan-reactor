import CommandsStream from "@process-replay/commands/commands-stream";

export const createCommandsComposer = (commandsStream: CommandsStream) => {

    let cmds = commandsStream.generate();
    const _commandsThisFrame: any[] = [];
    let cmd = cmds.next();

    return {
        get commandsThisFrame() {
            return _commandsThisFrame;
        },
        onFrame(frame: number) {

            _commandsThisFrame.length = 0;
            while (cmd.done === false) {

                if (
                    typeof cmd.value === "number"
                ) {
                    if (cmd.value > frame) {
                        break;
                    }
                    // only include past 5 game seconds (in case we are skipping frames)
                } else if (frame - cmd.value.frame < 120) {
                    _commandsThisFrame.push(cmd.value);
                }
                cmd = cmds.next();

            }
        },
        onFrameReset() {
            cmds = commandsStream.generate();
            cmd = cmds.next();
        }
    }
}