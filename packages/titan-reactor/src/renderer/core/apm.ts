import { Player } from "../../common/types/player";
import { ReplayCommand } from "../../common/types/replay";

type PlayerId = Pick<Player, "id">;
type ReplayCommandPlayer = Pick<ReplayCommand, "player">;

export const MIN_APM_CALCULATION_FRAME = Math.floor(20_000 / 42);

export class Apm {
  actions: number[] = new Array(8).fill(0);
  apm: number[] = new Array(8).fill(0);
  players: PlayerId[] = [];

  constructor(players: PlayerId[]) {
    this.players = players;
  }

  update(cmds: ReplayCommandPlayer[], bwGameFrame: number) {
    if (cmds) {
      for (const cmd of cmds) {
        //@todo remove once we filter out commands
        if (!this.players[cmd.player]) continue;
        this.actions[this.players[cmd.player].id]++;
      }
      if (bwGameFrame < MIN_APM_CALCULATION_FRAME) {
        return;
      }
      for (const player of this.players) {
        this.apm[player.id] = Math.floor(
          this.actions[player.id] / ((bwGameFrame * 42) / 60000)
        );
      }
    }
  }
}
export default Apm;
