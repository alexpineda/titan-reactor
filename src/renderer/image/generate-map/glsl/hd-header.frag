precision highp isampler2D;
uniform vec2 quartileResolution;
uniform vec2 quartileOffset;
uniform vec2 invMapResolution;
uniform vec2 mapToCreepResolution;

uniform sampler2D creep;
uniform sampler2D creepTexture;
uniform vec2 creepResolution;
uniform vec2 mapToCreepEdgesResolution;

uniform sampler2D creepEdges;
uniform sampler2D creepEdgesTexture;
uniform vec2 creepEdgesResolution;

vec2 getCreepUv( vec2 uv, in float value, in vec2 res, in vec2 invRes ) {
    float creepS = (value - 1./255.) * 255./res.x ; 

    float tilex = mod(uv.x, invMapResolution.x)  * invRes.x + creepS;
    float tiley = mod(uv.y, invMapResolution.y) * invRes.y;

    return vec2(tilex, tiley);
}

vec4 getCreepColor( vec2 uv, vec2 mapUv, in sampler2D tex, in vec2 res, in vec2 invRes, in vec4 oColor) {
    float creepF = texture2D(tex, uv ).r;

    if (creepF > 0.) {
    vec2 creepUv = getCreepUv(mapUv, creepF, creepResolution, mapToCreepResolution);
    return texture2D(creepTexture,creepUv);
    }

    return oColor;
}