export const loadTerrainPreset = (tileset) => {
  return JSON.parse(localStorage.getItem(tileset));
};
