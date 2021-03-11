import { range } from "ramda";
import { gameSpeeds } from "titan-reactor-shared/utils/conversions";

export default class Apm {
  constructor(players) {
    this.players = players;
    this.framesPerMinute = (60 * 1000) / gameSpeeds.fastest;
    this.sampleRate = 1;
    this.sampledFPM = Math.floor(this.framesPerMinute / this.sampleRate);
    this.actions = range(0, 8).map(() => new Uint32Array(this.sampledFPM));
    this.apm = range(0, 8);
    this._frame = 0;
  }

  update(cmds, bwGameFrame) {
    // if (bwGameFrame % this.sampleRate) {
    //   return;
    // }

    for (let i = 0; i < 8; i++) {
      this.actions[i][this._frame] = 0;
    }

    for (let cmd of cmds) {
      this.actions[this.players[cmd.player].id][this._frame]++;
    }

    for (const player of this.players) {
      let total = 0;
      for (const actions of this.actions[player.id]) {
        total += actions;
      }
      this.apm[player.id] = Math.floor(
        (total * this.framesPerMinute) / Math.min(bwGameFrame, this.sampledFPM)
      );
    }

    this._frame = (this._frame + 1) % this.sampledFPM;
  }
}
