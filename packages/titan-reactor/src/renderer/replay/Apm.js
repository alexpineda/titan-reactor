import { gameSpeeds } from "titan-reactor-shared/utils/conversions";

export default class Apm {
  constructor(players) {
    this.players = players;
    //1 minute of frames at fastest
    //@todo add sampling
    this.maxFrames = 1428;
    this.maxFramesFactor = (this.maxFrames * gameSpeeds.fastest) / (1000 * 60);
  }

  update(cmds, bwGameFrame) {
    const frame = bwGameFrame % this.maxFrames;

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
        total * (this.maxFrames / Math.min(bwGameFrame, this.maxFrames))
      );
    }
  }
}
