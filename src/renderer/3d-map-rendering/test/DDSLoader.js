import {
  CompressedTextureLoader,
  RGBAFormat,
  RGBA_S3TC_DXT3_Format,
  RGBA_S3TC_DXT5_Format,
  RGB_ETC1_Format,
  RGB_S3TC_DXT1_Format,
} from "three";

// Adapted from @toji's DDS utils
// https://github.com/toji/webgl-texture-utils/blob/master/texture-util/dds.js

// All values and structures referenced from:
// http://msdn.microsoft.com/en-us/library/bb943991.aspx/

var DDS_MAGIC = 0x20534444;

// var DDSD_CAPS = 0x1;
// var DDSD_HEIGHT = 0x2;
// var DDSD_WIDTH = 0x4;
// var DDSD_PITCH = 0x8;
// var DDSD_PIXELFORMAT = 0x1000;
var DDSD_MIPMAPCOUNT = 0x20000;
// var DDSD_LINEARSIZE = 0x80000;
// var DDSD_DEPTH = 0x800000;

// var DDSCAPS_COMPLEX = 0x8;
// var DDSCAPS_MIPMAP = 0x400000;
// var DDSCAPS_TEXTURE = 0x1000;

var DDSCAPS2_CUBEMAP = 0x200;
var DDSCAPS2_CUBEMAP_POSITIVEX = 0x400;
var DDSCAPS2_CUBEMAP_NEGATIVEX = 0x800;
var DDSCAPS2_CUBEMAP_POSITIVEY = 0x1000;
var DDSCAPS2_CUBEMAP_NEGATIVEY = 0x2000;
var DDSCAPS2_CUBEMAP_POSITIVEZ = 0x4000;
var DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x8000;
// var DDSCAPS2_VOLUME = 0x200000;

// var DDPF_ALPHAPIXELS = 0x1;
// var DDPF_ALPHA = 0x2;
var DDPF_FOURCC = 0x4;
// var DDPF_RGB = 0x40;
// var DDPF_YUV = 0x200;
// var DDPF_LUMINANCE = 0x20000;

function fourCCToInt32(value) {
  return (
    value.charCodeAt(0) +
    (value.charCodeAt(1) << 8) +
    (value.charCodeAt(2) << 16) +
    (value.charCodeAt(3) << 24)
  );
}

function int32ToFourCC(value) {
  return String.fromCharCode(
    value & 0xff,
    (value >> 8) & 0xff,
    (value >> 16) & 0xff,
    (value >> 24) & 0xff
  );
}

function loadARGBMip(buffer, dataOffset, width, height) {
  var dataLength = width * height * 4;
  var srcBuffer = new Uint8Array(buffer, dataOffset, dataLength);
  var byteArray = new Uint8Array(dataLength);
  var dst = 0;
  var src = 0;
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var b = srcBuffer[src];
      src++;
      var g = srcBuffer[src];
      src++;
      var r = srcBuffer[src];
      src++;
      var a = srcBuffer[src];
      src++;
      byteArray[dst] = r;
      dst++; //r
      byteArray[dst] = g;
      dst++; //g
      byteArray[dst] = b;
      dst++; //b
      byteArray[dst] = a;
      dst++; //a
    }
  }

  return byteArray;
}

var FOURCC_DXT1 = fourCCToInt32("DXT1");
var FOURCC_DXT3 = fourCCToInt32("DXT3");
var FOURCC_DXT5 = fourCCToInt32("DXT5");
var FOURCC_ETC1 = fourCCToInt32("ETC1");

var headerLengthInt = 31; // The header length in 32 bit ints

// Offsets into the header array

var off_magic = 0;

var off_size = 1;
var off_flags = 2;
var off_height = 3;
var off_width = 4;

var off_mipmapCount = 7;

var off_pfFlags = 20;
var off_pfFourCC = 21;
var off_RGBBitCount = 22;
var off_RBitMask = 23;
var off_GBitMask = 24;
var off_BBitMask = 25;
var off_ABitMask = 26;

// var off_caps = 27;
var off_caps2 = 28;
// var off_caps3 = 29;
// var off_caps4 = 30;

var dds = {
  mipmaps: [{}],
  width: 0,
  height: 0,
  format: null,
  mipmapCount: 1,
};

var DDSLoader = function (manager) {
  CompressedTextureLoader.call(this, manager);
};

DDSLoader.prototype = Object.assign(
  Object.create(CompressedTextureLoader.prototype),
  {
    constructor: DDSLoader,

    parse: function (buffer) {
      dds.format = RGB_S3TC_DXT1_Format;
      dds.mipmapCount = 1;
      dds.width = 128;
      dds.height = 128;

      // Extract mipmaps buffers
      dds.mipmaps[0].data = buffer.slice(
        128,
        128 + (((Math.max(4, dds.width) / 4) * Math.max(4, dds.height)) / 4) * 8
      );

      dds.mipmaps[0].width = dds.width;
      dds.mipmaps[0].height = dds.height;

      return dds;
    },
  }
);

export { DDSLoader };
