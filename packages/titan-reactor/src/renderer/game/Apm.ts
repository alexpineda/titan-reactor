import { Player } from "../../common/types/player";
import { ReplayCommandType } from "../../common/types/replay";
import { gameSpeeds } from "../../common/utils/conversions";
import range from "../../common/utils/range";

export class Apm {
  framesPerMinute = (60 * 1000) / gameSpeeds.fastest;
  sampleRate = 4;
  sampledFPM = Math.floor(this.framesPerMinute / this.sampleRate);
  actions = range(0, 8).map(() => new Uint32Array(this.sampledFPM));
  apm = range(0, 8);
  _frame = 0;
  players: Player[] = [];

  constructor(players: Player[]) {
    this.players = players;
  }

  update(cmds: ReplayCommandType[], bwGameFrame: number) {
    for (let i = 0; i < 8; i++) {
      this.actions[i][this._frame] = 0;
    }

    if (cmds) {
      for (const cmd of cmds) {
        //@todo remove once we filter out commands
        if (!this.players[cmd.player]) continue;
        this.actions[this.players[cmd.player].id][this._frame]++;
      }

      for (const player of this.players) {
        let total = 0;
        for (const actions of this.actions[player.id]) {
          total += actions;
        }
        this.apm[player.id] = Math.floor(
          (total * this.framesPerMinute) /
            Math.min(bwGameFrame, this.sampledFPM)
        );
      }
    }

    this._frame = (this._frame + 1) % this.sampledFPM;
  }
}
export default Apm;
