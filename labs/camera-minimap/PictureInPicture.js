class PictureInPicture {
  constructor(camera, x, y, width, height) {
    this.camera = camera;
    this.viewport = { x, y, width, height };
  }

  setViewport(x, y, width, height) {
    this.viewport = { x, y, width, height };
  }

  _renderFn(renderer, scene) {
    renderer.setViewport(
      viewport.x,
      viewport.y,
      viewport.width,
      viewport.height
    );
    renderer.render(scene, this.camera);
  }

  _emptyFn() {}

  enable() {
    this.render = this._renderFn;
  }

  disable() {
    this.render = this._emptyFn;
  }

  render() {
    this.render();
  }

  dispose() {
    this.camera.dispose();
  }
}
