import {
  Euler,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  PlaneHelper,
  Quaternion,
  Scene,
  Vector3,
} from "three";
import { Minimap } from "../Minimap";
import { Cameras } from "../Cameras";
import { Context } from "../../Context";
import { MinimapLayer } from "../Layers";

const context = new Context(window);
context.initRenderer();
document.body.append(context.getGameCanvas());
document.body.append(context.getMinimapCanvas());

const scene = new Scene();
const w = 128;
const h = 128;
const minimap = new Minimap(context.getMinimapCanvas(), w, h);
const cameras = new Cameras(context, null, minimap);
cameras.control.update();

const terrain = (() => {
  const geo = new PlaneBufferGeometry(
    w,
    h,
    Math.floor(w / 32),
    Math.floor(h / 32)
  );
  const mat = new MeshBasicMaterial({
    color: 0x990000,
  });
  var mesh = new Mesh(geo, mat);
  const rotScaleTranslation = new Matrix4();
  const rotation = new Quaternion();
  rotation.setFromEuler(new Euler(-0.5 * Math.PI, 0, 0));
  rotScaleTranslation.compose(new Vector3(), rotation, new Vector3(1, 1, 1));

  mesh.applyMatrix4(rotScaleTranslation);
  return mesh;
})();

const minimapTerrain = (() => {
  const geo = new PlaneBufferGeometry(
    w,
    h,
    Math.floor(w / 32),
    Math.floor(h / 32)
  );
  const mat = new MeshBasicMaterial({
    color: 0x777766,
  });
  var mesh = new Mesh(geo, mat);
  mesh.rotateX(-0.5 * Math.PI);
  mesh.layers.set(MinimapLayer);
  return mesh;
})();

scene.add(terrain);
scene.add(minimapTerrain);
scene.add(cameras.minimapCameraHelper);

var helper = new PlaneHelper(cameras.minimapCameraHelper.mapPlane, 1, 0xffff00);

scene.add(helper);

let f = 0;
scene.add(cameras.minimapCameraHelper.mapIndicator);

const gameLoop = () => {
  f++;
  cameras.control.update();
  if (f % 200 === 0) {
    cameras.minimapCameraHelper.update();
    cameras.minimapCameraHelper.mapIndicator.position.copy(
      cameras.minimapCameraHelper.mapIntersect
    );
  }

  context.renderer.clear();
  context.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  context.renderer.render(scene, cameras.main);

  context.renderer.clearDepth();
  context.renderer.setScissor(minimap.viewport);
  context.renderer.setScissorTest(true);
  context.renderer.setViewport(minimap.viewport);
  context.renderer.render(scene, minimap.camera); //minimap.camera);
  context.renderer.setScissorTest(false);
};

context.renderer.setAnimationLoop(gameLoop);
