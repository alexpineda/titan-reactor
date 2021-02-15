/*
bool **player_position_is_visible**(int owner, **xy** position) const {

  return (**tile_visibility**(position) & (1 << owner)) != 0;
  
  }
  
  bool **player_position_is_explored**(int owner, **xy** position) const {
  
  return (**tile_explored**(position) & (1 << owner)) != 0;
  
  }
*/
export default class TilesBW {
  static get Flags() {
    return {
      HasCreep: 0x40,
      CreepReceding: 0x1000,
      TemporaryCreep: 0x4000,
    };
  }

  static hasCreep(tile) {
    return (tile.flags & TilesBW.Flags.HasCreep) != 0;
  }

  static hasCreepReceding(tile) {
    return (tile.flags & TilesBW.Flags.CreepReceding) != 0;
  }

  static hasTemporaryCreep(tile) {
    return (tile.flags & TilesBW.Flags.TemporaryCreep) != 0;
  }
}
