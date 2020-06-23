import * as R from "ramda";

export const jungle = {
  water: {
    // todo 10255 - 10375
    mini: [].concat(
      R.range(639, 815),
      [10007],
      R.range(10013, 10034),
      R.range(10057, 10064),
      R.range(10270, 10277),
      R.range(10606, 10819)
    ),
    mega: [].concat(
      R.range(49, 60),
      R.range(1638, 1653),
      R.range(1660, 1670),
      R.range(1677, 1682),
      R.range(1694, 1714),
      R.range(1726, 1769),
      // todo 1800
      [5042, 5044, 5043, 5045]
    ),
  },
};
