System.register("types/grp", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("utils/range", [], function (exports_2, context_2) {
    "use strict";
    var range;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            range = (start, stop) => {
                // in this case use start as the count and start = 0
                if (typeof stop === "undefined") {
                    if (start < 0 || Number.isNaN(start)) {
                        return [];
                    }
                    return [...Array(start).keys()].map((value) => value);
                }
                const count = stop - start;
                if (count < 0 || Number.isNaN(count)) {
                    return [];
                }
                return [...Array(count).keys()].map((value) => value + start);
            };
            exports_2("default", range);
        }
    };
});
System.register("image/formats/anim", ["bl", "utils/range"], function (exports_3, context_3) {
    "use strict";
    var bl_1, range_1, versionSD, versionHD, versionHD2, Version, Anim;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (bl_1_1) {
                bl_1 = bl_1_1;
            },
            function (range_1_1) {
                range_1 = range_1_1;
            }
        ],
        execute: function () {
            versionSD = Symbol("sd");
            versionHD = Symbol("h");
            versionHD2 = Symbol("hd2");
            Version = {
                0x0101: versionSD,
                0x0202: versionHD2,
                0x0204: versionHD,
            };
            exports_3("Anim", Anim = (buf) => {
                const bl = new bl_1.default(buf);
                const header = bl.shallowSlice(0, 12 + 10 * 32);
                const magic = header.slice(0, 4).toString();
                const version = Version[header.readUInt16LE(4)];
                const numLayers = header.readUInt16LE(8);
                const numEntries = header.readUInt16LE(10);
                header.consume(12);
                const layerNames = range_1.default(0, 10)
                    .map((i) => header.slice(i * 32, i * 32 + 32).toString())
                    .map((str, i) => {
                    const res = str.substr(0, str.indexOf("\u0000"));
                    if (!res) {
                        return `layer_${i}`;
                    }
                    return res;
                });
                if (magic !== "ANIM") {
                    throw new Error("not an anim file");
                }
                if (version !== versionSD && numEntries != 1) {
                    throw new Error("hd must have only 1 entry");
                }
                let lastOffset = version == versionSD ? 0x14c + 999 * 4 : 0x14c;
                const parseSprite = () => {
                    const data = bl.shallowSlice(lastOffset);
                    const numFrames = data.readUInt16LE(0);
                    // sprite reference
                    if (numFrames === 0) {
                        const refId = data.readInt16LE(2);
                        data.consume(4);
                        lastOffset = lastOffset + 4 + 8;
                        return {
                            refId,
                        };
                    }
                    const w = data.readUInt16LE(4);
                    const h = data.readUInt16LE(6);
                    const framesOffset = data.readUInt32LE(8);
                    data.consume(12);
                    const maps = parseTextures(data);
                    const frames = parseFrames(numFrames, framesOffset);
                    lastOffset = framesOffset + numFrames * 16;
                    return {
                        w,
                        h,
                        maps,
                        frames,
                    };
                };
                const parseTextures = (texture) => range_1.default(0, numLayers).reduce((tex, i) => {
                    const ddsOffset = texture.readUInt32LE(0);
                    const size = texture.readUInt32LE(4);
                    const width = texture.readUInt16LE(8);
                    const height = texture.readUInt16LE(10);
                    texture.consume(12);
                    if (ddsOffset > 0) {
                        // @ts-ignore
                        tex[layerNames[i]] = {
                            ddsOffset,
                            size,
                            width,
                            height,
                        };
                    }
                    return tex;
                }, {});
                const parseFrames = (numFrames, o) => {
                    return range_1.default(0, numFrames).map((frame) => {
                        const frames = bl.shallowSlice(o + frame * 16);
                        const x = frames.readUInt16LE(0);
                        const y = frames.readUInt16LE(2);
                        const xoff = frames.readInt16LE(4);
                        const yoff = frames.readInt16LE(6);
                        const w = frames.readUInt16LE(8);
                        const h = frames.readUInt16LE(10);
                        return {
                            x,
                            y,
                            xoff,
                            yoff,
                            w,
                            h,
                        };
                    });
                };
                const sprites = range_1.default(0, numEntries).map(() => parseSprite());
                const sprite = sprites[0];
                return {
                    sprite,
                    sprites,
                    version,
                    numEntries,
                };
            });
        }
    };
});
System.register("image/formats/anim_new", ["utils/range"], function (exports_4, context_4) {
    "use strict";
    var range_2, versionSD, versionHD, versionHD2, Version, parseLayerNames, parseSprite, parseTextures, parseFrames;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (range_2_1) {
                range_2 = range_2_1;
            }
        ],
        execute: function () {
            versionSD = Symbol("sd");
            versionHD = Symbol("h");
            versionHD2 = Symbol("hd2");
            Version = {
                0x0101: versionSD,
                0x0202: versionHD2,
                0x0204: versionHD,
            };
            parseLayerNames = (layers) => {
                const layerNames = [];
                for (const i of range_2.default(0, 10)) {
                    const str = layers.slice(i * 32, i * 32 + 32).toString();
                    const res = str.substring(0, str.indexOf("\u0000"));
                    layerNames[i] = res || `layer_${i}`;
                }
                return layerNames;
            };
            parseSprite = (buf, numLayers, layerNames, lastOffset) => {
                const data = buf.slice(lastOffset);
                const numFrames = data.readUInt16LE(0);
                // sprite reference
                if (numFrames === 0) {
                    const refId = data.readInt16LE(2);
                    return {
                        sprite: { refId },
                        lastOffset: lastOffset + 12,
                    };
                }
                const w = data.readUInt16LE(4);
                const h = data.readUInt16LE(6);
                const framesOffset = data.readUInt32LE(8);
                const textures = data.slice(12);
                const maps = parseTextures(textures, numLayers, layerNames);
                const frames = parseFrames(buf, numFrames, framesOffset);
                return {
                    sprite: {
                        w,
                        h,
                        maps,
                        frames,
                    },
                    lastOffset: framesOffset + numFrames * 16,
                };
            };
            parseTextures = (texture, numLayers, layerNames) => {
                const tex = {};
                for (const layer of range_2.default(0, numLayers)) {
                    const ddsOffset = texture.readUInt32LE(layer * 12);
                    if (ddsOffset === 0) {
                        continue;
                    }
                    const size = texture.readUInt32LE(layer * 12 + 4);
                    const width = texture.readUInt32LE(layer * 12 + 8);
                    const height = texture.readUInt32LE(layer * 12 + 10);
                    tex[layerNames[layer]] = {
                        ddsOffset,
                        size,
                        width,
                        height,
                    };
                }
                return tex;
            };
            parseFrames = (buf, numFrames, o) => {
                const result = [];
                for (const frame of range_2.default(0, numFrames)) {
                    const frames = buf.slice(o + frame * 16);
                    const x = frames.readUInt16LE(0);
                    const y = frames.readUInt16LE(2);
                    const xoff = frames.readInt16LE(4);
                    const yoff = frames.readInt16LE(6);
                    const w = frames.readUInt16LE(8);
                    const h = frames.readUInt16LE(10);
                    result[frame] = {
                        x,
                        y,
                        xoff,
                        yoff,
                        w,
                        h,
                    };
                }
                return result;
            };
            exports_4("default", (buf) => {
                const header = buf.slice(0, 12 + 10 * 32);
                const magic = header.slice(0, 4).toString();
                const version = Version[header.readUInt16LE(4)];
                const numLayers = header.readUInt16LE(8);
                const numEntries = header.readUInt16LE(10);
                const layers = header.slice(12);
                const layerNames = parseLayerNames(layers);
                if (magic !== "ANIM") {
                    throw new Error("not an anim file");
                }
                if (version !== versionSD && numEntries != 1) {
                    throw new Error("hd must have only 1 entry");
                }
                let _lastOffset = version == versionSD ? 0x14c + 999 * 4 : 0x14c;
                const sprites = [];
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                for (const _ of range_2.default(0, numEntries)) {
                    const { sprite, lastOffset } = parseSprite(buf, numLayers, layerNames, _lastOffset);
                    _lastOffset = lastOffset;
                    sprites.push(sprite);
                }
                return sprites;
            });
        }
    };
});
System.register("image/formats/tests/anim.test", ["image/formats/anim", "image/formats/anim_new", "fs"], function (exports_5, context_5) {
    "use strict";
    var anim_1, anim_new_1, fs_1, animTimes, newTimes;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (anim_1_1) {
                anim_1 = anim_1_1;
            },
            function (anim_new_1_1) {
                anim_new_1 = anim_new_1_1;
            },
            function (fs_1_1) {
                fs_1 = fs_1_1;
            }
        ],
        execute: function () {
            animTimes = [];
            newTimes = [];
            for (let i = 0; i < 999; i++) {
                let buf;
                try {
                    buf = fs_1.default.readFileSync(`./anim/main_${`00${i})}`.slice(-3)}.anim`);
                }
                catch (e) {
                    continue;
                }
                let start = performance.now();
                anim_1.Anim(buf);
                animTimes.push(start);
                start = performance.now();
                anim_new_1.default(buf);
                newTimes.push(start);
            }
            console.log(`
      old-anim: ${animTimes.reduce((a, b) => a + b, 0) / animTimes.length} 
      new-anim: ${newTimes.reduce((a, b) => a + b, 0) / newTimes.length}
    `);
        }
    };
});
