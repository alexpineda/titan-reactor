export class Players extends Array {
  constructor(players) {
    super();
    this.push(
      ...players.map((player) => ({
        name: player.name,
        minerals: 0,
        gas: 0,
        workers: 4,
        supply: 4,
        supplyMax: 8,
        race: player.race,
        apm: 0,
        color: player.color,
        units: [],
      }))
    );
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
