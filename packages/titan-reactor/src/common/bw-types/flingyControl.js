import invertObj from "../utils/invertObj";

export const flingyControl = {
  flingy: 0,
  partiallyMobile: 1,
  iscript: 2,
};

export const flingyControlById = invertObj(flingyControl);
