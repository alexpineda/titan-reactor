import { Player } from "../../common/types/player";
import { ReplayCommandType } from "../../common/types/replay";

export class Apm {
  actions = new Array(8).fill(0);
  apm = new Array(8).fill(0);
  players: Player[] = [];

  constructor(players: Player[]) {
    this.players = players;
  }

  update(cmds: ReplayCommandType[], bwGameFrame: number) {
    if (cmds) {
      for (const cmd of cmds) {
        //@todo remove once we filter out commands
        if (!this.players[cmd.player]) continue;
        this.actions[this.players[cmd.player].id]++;
      }
      if (bwGameFrame < 200) {
        return;
      }
      for (const player of this.players) {
        this.apm[player.id] = Math.floor(
          this.actions[player.id] / bwGameFrame / 10
        );
      }
    }
  }
}
export default Apm;
