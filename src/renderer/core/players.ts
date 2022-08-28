import worldStore, { useWorldStore } from "@stores/world-store";
import Janitor from "@utils/janitor";
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
  #janitor = new Janitor();

  constructor(
    players: Replay["header"]["players"],
    startLocations: StartLocation[],
  ) {
    super();

    const makeColors = (replay: Replay) => replay.header.players.map(
      ({ color }) =>
        new Color().setStyle(color).convertSRGBToLinear()
    );

    this.#janitor.add(useWorldStore.subscribe(world => {
      if (world.replay) {
        const colors = makeColors(world.replay);
        for (let i = 0; i < players.length; i++) {
          this[i].color = colors[i];
        }
      }
    }));

    const colors = makeColors(worldStore().replay!);

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

  dispose() {
    this.#janitor.dispose();
  }
}
