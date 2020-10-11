export default class WithListeners {
  constructor() {
    this.listeners = [];
  }

  onChange(cb) {
    this.listeners.push(cb);
    this._listenersDone = () => {};
  }

  removeListener(cb) {
    this.listeners.indexOf(cb) >= 0 &&
      this.listeners.splice(this.listeners.indexOf(cb), 1);
  }

  _changed() {
    this.listeners.forEach((cb) => cb(this));
    this._listenersDone && this._listenersDone(this.listeners);
  }
}

export const withListeners = () => {};
