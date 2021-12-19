const range = (start: number, stop: number) => {
  // in this case use start as the count and start = 0
  if (typeof stop === "undefined") {
    if (start < 0 || Number.isNaN(start)) {
      return [];
    }
    return [...Array(start).keys()].map((value) => value);
  }

  const count = stop - start;
  if (count < 0 || Number.isNaN(count)) {
    return [];
  }
  return [...Array(count).keys()].map((value) => value + start);
};

export default range;
