//https://stackoverflow.com/questions/3895478/does-javascript-have-a-method-like-range-to-generate-a-range-within-the-supp
export default (startAt, size) => {
  return [...Array(size).keys()].map((i) => i + startAt);
};
