import {
  Player,
  StartLocation,
} from "common/types";
import { Replay } from "renderer/process-replay/parse-replay";
import { Color } from "three";

const _pVision = (p: Player) => {
  return p.vision;
}

const _gFlags = (flags: number, { id }: Pick<Player, "id">) => {
  return (flags |= 1 << id);
}

export class Players extends Array<Player> {
  playersById: Record<number, Player> = {};

  constructor(
    players: Replay["header"]["players"],
    startLocations: StartLocation[],
    colors: Color[]
  ) {
    super();

    this.push(
      ...players.map((player, i) => ({
        color: colors[i],
        id: player.id,
        name: player.name,
        race: player.race,
        vision: true,
        startLocation: startLocations.find((u) => u.player == player.id)
      }))
    );

    for (const player of this) {
      this.playersById[player.id] = player;
    }
  }

  get(id: number) {
    return this.playersById[id];
  }

  static override get [Symbol.species]() {
    return Array;
  }

  getVisionFlag() {
    return this.filter(_pVision)
      .reduce(_gFlags, 0);
  }
}
