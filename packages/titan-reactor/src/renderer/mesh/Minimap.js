import {
  BufferGeometry,
  DynamicDrawUsage,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Vector3,
} from "three";
import { MinimapLayer, MinimapUnitLayer } from "../camera/Layers";

export const createMiniMapPlane = (map, mapWidth, mapHeight) => {
  const geo = new PlaneBufferGeometry(
    mapWidth,
    mapHeight,
    Math.floor(mapWidth / 32),
    Math.floor(mapHeight / 32)
  );
  const mat = new MeshBasicMaterial({
    color: 0xffffff,
    map,
  });
  var mesh = new Mesh(geo, mat);
  mesh.rotateX(-0.5 * Math.PI);
  mesh.layers.set(MinimapLayer);
  return mesh;
};

export const createMinimapPoint = (color) => {
  const geometry = new PlaneBufferGeometry(1, 1);
  const material = new MeshBasicMaterial({ color });
  const plane = new Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  plane.layers.set(MinimapUnitLayer);
  plane.name = "MinimapPoint";
  return plane;
};

export class MinimapBox {
  constructor(
    color,
    { canvas, ctx },
    minimapBitmap,
    mapWidth,
    mapHeight,
    fogOfWar,
    units
  ) {
    this.color = color;
    this.canvas = canvas;
    this.ctx = ctx;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.fogOfWar = fogOfWar;
    this.units = units;
    this.minimapBitmap = minimapBitmap;
  }

  draw(view) {
    //@todo possibly refactor back to webgl rendering
    //update ImageData alpha for minimap
    if (!this._generatingMinimapFog) {
      this._generatingMinimapFog = true;
      createImageBitmap(this.fogOfWar.imageData).then((ib) => {
        this.fogBitmap = ib;
        this._generatingMinimapFog = false;
      });
    }

    if (!this._generatingUnits) {
      this._generatingUnits = true;
      createImageBitmap(this.units.imageData).then((ib) => {
        this.unitsBitmap = ib;
        this._generatingUnits = false;
      });
    }

    this.ctx.save();

    this.ctx.drawImage(
      this.minimapBitmap,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    if (this.unitsBitmap) {
      this.ctx.drawImage(
        this.unitsBitmap,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    }

    if (this.fogBitmap && this.fogOfWar.enabled) {
      this.ctx.drawImage(
        this.fogBitmap,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    }
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = 0.8;
    this.ctx.setTransform(
      this.canvas.width / this.mapWidth,
      0,
      0,
      this.canvas.height / this.mapHeight,
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    this.ctx.beginPath();
    this.ctx.moveTo(...view.tl);
    this.ctx.lineTo(...view.tr);
    this.ctx.lineTo(...view.br);
    this.ctx.lineTo(...view.bl);
    this.ctx.lineTo(...view.tl);
    this.ctx.stroke();
    this.ctx.restore();
  }
}
