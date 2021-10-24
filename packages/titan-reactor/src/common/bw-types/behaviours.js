import invertObj from "../utils/invertObj";

export const behaviours = {
  flyAndDontFollowTarget: 0,
  flyAndFollowTarget: 1,
  appearOnTargetUnit: 2,
  persistOnTargetSite: 3,
  appearOnTargetSite: 4,
  appearOnAttacker: 5,
  attackAndSelfDestruct: 6,
  bounce: 7,
  attackTarget3x3Area: 8,
  goToMaxRange: 9,
};

export const behavioursId = invertObj(behaviours);
