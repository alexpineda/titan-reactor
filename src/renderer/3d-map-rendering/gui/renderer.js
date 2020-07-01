import { fromPairs, unnest, compose } from "ramda";

export const renderOptions = () => ({
  gamma: 2.2,
  toneMapping: "NoToneMapping",
  toneMappingExposure: 1,
  fogColor: "#080820",
});

const createField = (add, name, ...args) => {
  return [name, add(name, ...args)];
};

export const addRendererFields = (add, addColor) => {
  return compose(fromPairs, [
    createField(add, "gamma"),
    createField(add, "toneMapping", [
      "NoToneMapping",
      "LinearToneMapping",
      "ReinhardToneMapping",
      "CineonToneMapping",
      "ACESFilmicToneMapping",
    ]),
    createField(add, "toneMappingExposure"),
    createField(addColor, "fogColor"),
  ]);
};
