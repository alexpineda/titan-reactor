import range from "common/utils/range";
import { CMDS } from "../process-replay/commands/commands";
import CommandsStream from "../process-replay/commands/commands-stream";

export const detectMeleeObservers = (cmds: CommandsStream) => {
    const buildCommands = range(0, 11).fill(0);

    let i = 0;
    for (const cmd of cmds.generate()) {
        if (typeof cmd === "number") {
            continue;
        }
        if (cmd.id === CMDS.BUILD.id) {
            buildCommands[cmd.player] += 1;
            i++;
        }
        if (i > 20) {
            break;
        }
    }

    return buildCommands.map((count, i) => count <= 5 ? i : null).filter(x => x !== null);
}