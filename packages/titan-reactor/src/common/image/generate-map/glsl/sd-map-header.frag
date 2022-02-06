precision highp usampler2D;
precision highp isampler2D;
uniform sampler2D palette;
uniform usampler2D paletteIndices;
uniform ivec2 index1;
uniform ivec2 index2;
uniform ivec2 index3;
uniform int counter;


//sd creep
uniform vec2 invMapResolution;
uniform vec2 mapResolution;
uniform sampler2D creep;
uniform sampler2D creepTexture;
uniform vec2 creepResolution;
uniform vec2 mapToCreepResolution;

uniform sampler2D creepEdges;
uniform sampler2D creepEdgesTexture;
uniform vec2 mapToCreepEdgesResolution;
uniform vec2 creepEdgesResolution;

vec2 getCreepUv(in vec2 uv, in float value, in vec2 res, in vec2 invRes ) {
    float creepS = (value - 1./255.) * 255./res.x ; 

    float tilex = mod(uv.x, invMapResolution.x)  * invRes.x + creepS;
    float tiley = mod(uv.y, invMapResolution.y) * invRes.y;

    return vec2(tilex, tiley);
}

vec4 getCreepColor(in vec2 uv, in sampler2D tex, in vec2 res, in vec2 invRes, in vec4 oColor) {
    float creepF = texture2D(tex, uv ).r;

    // scale 0->13 0->1
    if (creepF > 0.) {
        vec2 creepUv = getCreepUv(uv, creepF, creepResolution, mapToCreepResolution);
        return texture2D(creepTexture,creepUv);
    }

    return oColor;
}
