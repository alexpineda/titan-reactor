import invertObj from "../utils/invertObj";
export const damageTypes = {
  independent: 0,
  explosive: 1,
  concussive: 2,
  normal: 3,
  ignoreArmor: 4,
};

export const damageTypesById = invertObj(damageTypes);
