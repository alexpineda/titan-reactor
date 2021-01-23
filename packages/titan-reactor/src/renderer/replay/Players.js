export class Players extends Array {
  constructor(players, startLocations) {
    super();
    this.push(
      ...players.map((player) => ({
        id: player.id,
        name: player.name,
        minerals: 0,
        gas: 0,
        workers: 4,
        supply: 4,
        supplyMax: 8,
        race: player.race,
        totalActions: 0,
        apm: 0,
        color: player.color,
        units: [],
        showActions: false,
        showPov: false,
        hideVision: false,
        startLocation: startLocations.find((u) => u.player == player.id),
      }))
    );
    this.activePovs = 0;
  }

  static get [Symbol.species]() {
    return Array;
  }

  updateResources(game) {
    this[0].supply = game.supplyTaken[0];
    this[1].supply = game.supplyTaken[1];
    this[0].supplyMax = game.supplyProvided[0];
    this[1].supplyMax = game.supplyProvided[1];
    this[0].workers = game.getWorkerCount(0);
    this[1].workers = game.getWorkerCount(1);
  }
}
