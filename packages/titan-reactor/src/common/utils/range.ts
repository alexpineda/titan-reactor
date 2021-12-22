const range = (start: number, stop: number) => {
  const count = stop - start;
  if (count < 0 || Number.isNaN(count)) {
    return [];
  }
  const res = [];
  for (let i = start; i < count + start; i++) {
    res.push(i);
  }
  return res;
};

export default range;
