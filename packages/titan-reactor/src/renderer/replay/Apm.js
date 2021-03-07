import { gameSpeeds } from "titan-reactor-shared/utils/conversions";

export default class Apm {
  constructor(players) {
    this.players = players;
  }

  update(cmds, bwGameFrame) {
    for (let cmd of cmds) {
      this.players[cmd.player].totalActions++;
    }

    for (const player of this.players) {
      player.apm = Math.floor(
        player.totalActions / ((bwGameFrame * gameSpeeds.fastest) / (1000 * 60))
      );
    }
  }
}
