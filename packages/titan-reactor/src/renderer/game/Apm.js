import { gameSpeeds } from "titan-reactor-shared/utils/conversions";

export default class Apm {
  constructor(players) {
    this.players = players;
    this.framesPerMinute = (60 * 1000) / gameSpeeds.fastest;
    this.sampleRate = 1;
    this.sampledFPM = Math.floor(this.framesPerMinute / this.sampleRate);
  }

  update(cmds, bwGameFrame) {
    if (bwGameFrame % this.sampleRate) {
      return;
    }

    const frame = Math.floor(
      (bwGameFrame % this.framesPerMinute) / this.sampleRate
    );

    for (const player of this.players) {
      player.actions[frame] = 0;
    }

    for (let cmd of cmds) {
      this.players[cmd.player].actions[frame]++;
    }

    for (const player of this.players) {
      let total = 0;
      for (const actions of player.actions) {
        total += actions;
      }
      player.apm = Math.floor(
        total * (this.framesPerMinute / Math.min(bwGameFrame, this.sampledFPM))
      );
    }
  }
}
