/**
 * Using canvas draw operations to update minimap units, fog, resources and camera box
 */
export default class MinimapCanvasDrawer {
  constructor(
    color,
    { canvas, ctx },
    minimapBitmap,
    mapWidth,
    mapHeight,
    fogOfWar,
    creep,
    units
  ) {
    this.creep = creep;
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

    if (!this._generatingResources) {
      this._generatingResources = true;
      createImageBitmap(this.units.resourceImageData).then((ib) => {
        this.resourcesBitmap = ib;
        this._generatingResources = false;
      });
    }

    if (!this._generatingCreep) {
      this._generatingCreep = true;
      createImageBitmap(this.creep.creepImageData).then((ib) => {
        this.creepBitmap = ib;
        this._generatingCreep = false;
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

    if (this.creepBitmap) {
      this.ctx.drawImage(
        this.creepBitmap,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    }

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

    if (this.resourcesBitmap) {
      this.ctx.drawImage(
        this.resourcesBitmap,
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