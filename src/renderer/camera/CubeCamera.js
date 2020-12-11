const { CubeCamera, WebGLCubeRenderTarget } = require("three");

export class TerrainCubeCamera extends CubeCamera {
  constructor(context, map) {
    const cubeRenderTargetGenerator = new WebGLCubeRenderTarget(128, {});

    const renderTarget = cubeRenderTargetGenerator.fromEquirectangularTexture(
      context.renderer,
      map
    );
    cubeRenderTargetGenerator.dispose();
    super(1, 100000, renderTarget);

    this.userData = {
      context,
      map,
    };
  }

  onRestoreContext() {
    this.renderTarget.dispose();
    this.renderTarget = this._createRenderTarget();
    //@todo update env maps
  }

  _createRenderTarget() {
    const cubeRenderTargetGenerator = new WebGLCubeRenderTarget(128, {});

    const renderTarget = cubeRenderTargetGenerator.fromEquirectangularTexture(
      this.userData.context.renderer,
      this.userData.map
    );
    cubeRenderTargetGenerator.dispose();
    return renderTarget;
  }

  updateEnvMap(obj) {
    obj.material.envMap = this.renderTarget.texture;
  }

  update(scene, camera) {
    this.position.copy(camera.position);
    this.rotation.copy(camera.rotation);
    this.update(this.userData.context.renderer, scene);
  }

  dispose() {
    this.renderTarget.dispose();
  }
}
