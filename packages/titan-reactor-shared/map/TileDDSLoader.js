import { CompressedTextureLoader, RGB_S3TC_DXT1_Format } from "three";

//stripped down version for dds tile reading

var dds = {
  mipmaps: [{}],
  width: 0,
  height: 0,
  format: null,
  mipmapCount: 1,
};

var TileDDSLoader = function (manager) {
  CompressedTextureLoader.call(this, manager);
};

TileDDSLoader.prototype = Object.assign(
  Object.create(CompressedTextureLoader.prototype),
  {
    constructor: TileDDSLoader,

    parse: function (buffer) {
      dds.format = RGB_S3TC_DXT1_Format;
      dds.mipmapCount = 1;
      dds.width = 128;
      dds.height = 128;

      // Extract mipmaps buffers
      dds.mipmaps[0].data = new Uint8Array(
        buffer.slice(
          128,
          128 +
            (((Math.max(4, dds.width) / 4) * Math.max(4, dds.height)) / 4) * 8
        )
      );

      dds.mipmaps[0].width = dds.width;
      dds.mipmaps[0].height = dds.height;

      return dds;
    },
  }
);

export { TileDDSLoader as DDSLoader };
