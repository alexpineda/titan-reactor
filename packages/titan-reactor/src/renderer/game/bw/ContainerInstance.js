//@todo: refactor out once I know how I want things structured
export default class ContainerInstance {
  constructor(items) {
    this._items = items;
  }

  items() {
    return this._items;
  }

  reverse() {}
}
