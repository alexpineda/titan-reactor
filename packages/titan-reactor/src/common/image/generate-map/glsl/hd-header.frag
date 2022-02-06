precision highp isampler2D;
uniform vec2 quartileResolution;
uniform vec2 quartileOffset;
uniform vec2 invMapResolution;
uniform vec2 mapToCreepResolution;

// creep
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

vec4 getSampledCreep(const in vec2 uv, vec2 mapUv, in sampler2D tex, in vec2 res, in vec2 invRes) {

    vec2 texelSize = vec2(1.0) / res * 128.;
    float r = 2.;

    float dx0 = -texelSize.x * r;
    float dy0 = -texelSize.y * r;
    float dx1 = texelSize.x * r;
    float dy1 = texelSize.y * r;
    vec4 oColor = getCreepColor(uv, mapUv, tex, res, invRes, vec4(0.));
    return (
    getCreepColor(uv + vec2(dx0, dy0), mapUv,  tex, res, invRes, oColor) +
    getCreepColor(uv + vec2(0.0, dy0), mapUv, tex, res, invRes, oColor) +
    getCreepColor(uv + vec2(dx1, dy0), mapUv, tex, res, invRes, oColor) +
    getCreepColor(uv + vec2(dx0, 0.0), mapUv, tex, res, invRes, oColor) +
    oColor +
    getCreepColor(uv + vec2(dx1, 0.0), mapUv, tex, res, invRes, oColor) +
    getCreepColor(uv + vec2(dx0, dy1), mapUv, tex, res, invRes, oColor) +
    getCreepColor(uv + vec2(0.0, dy1), mapUv, tex, res, invRes, oColor) +
    getCreepColor(uv + vec2(dx1, dy1), mapUv, tex, res, invRes, oColor)
    ) * (1.0 / 9.0);
    
}
