precision highp isampler2D;
precision highp sampler2D;

uniform vec4 tileUnit;
uniform sampler2D waterMask;

uniform sampler2D creep;
uniform sampler2D creepTexture;
uniform vec2 creepResolution;
uniform vec3 mapToCreepResolution;

uniform sampler2D creepEdges;
uniform sampler2D creepEdgesTexture;

uniform float uTime;
uniform vec2 uResolution;

varying vec2 qUv;

// //in vec2 mapCoord;  // large tiles
// //in vec2 mapCoord2; // small tiles

uniform sampler2D waterNormal1[2];
uniform sampler2D waterNormal2[2]; // normal detail

varying vec3 v_Position;

vec4 sampleCreep(in vec4 inColor, in vec2 uv, in float creepTile, in sampler2D tex, in float res, in vec2 invRes) {
    // creepTile 1 needs to be set back to 0 base for sampling.
    float creepS = (creepTile - 1./255.) * 255. / res; 

    // modulate uv by tile since we're scaling out to that unit at the end
    vec4 outColor = texture2D(tex, vec2(
        mod(uv.x, tileUnit.x) * invRes.x + creepS,
        mod(uv.y, tileUnit.y) * invRes.y
    ));

    return mix(inColor, outColor, outColor.a * step(0.001, creepTile));
}

vec3 blendNormal(vec3 normal){

    vec3 blending = abs(normal);
    blending = normalize(max(blending, 0.00001));
    blending /= vec3(blending.x + blending.y + blending.z);
    return blending;

}

vec3 triplanarMapping (sampler2D tex, vec3 normal, vec3 position) {

    vec3 normalBlend = blendNormal(normal);
    vec3 xColor = texture2D(tex, position.yz).rgb;
    vec3 yColor = texture2D(tex, position.xz).rgb;
    vec3 zColor = texture2D(tex, position.xy).rgb;

    return (xColor * normalBlend.x + yColor * normalBlend.y + zColor * normalBlend.z);

}

vec3 toNdc(vec3 v)
{
    return (v * 2.0) - 1.0;
}

vec2 toNdc(vec2 v)
{
    return (v * 2.0) - 1.0;
}

vec3 waterSample(float time, float animTime, vec2 mapCoord, vec2 mapCoord2)
{

    float t = time / 20.0;

    vec2 mappedUV1 = mapCoord + vec2( -t / 2.0, t / 1.0);
    vec2 mappedUV2 = mapCoord2 + vec2( -t * 2.0, t * 1.8);

    vec3 normalFrameOne = texture2D(waterNormal1[0], mappedUV1).rgb;
    vec3 normalFrameTwo = texture2D(waterNormal1[1], mappedUV1).rgb;
    vec3 normal = mix(normalFrameOne, normalFrameTwo, animTime);

    vec3 normal2FrameOne = texture2D(waterNormal2[0], mappedUV2).rgb;
    vec3 normal2FrameTwo = texture2D(waterNormal2[1], mappedUV2).rgb;
    vec3 normalDetail = mix(normal2FrameOne, normal2FrameTwo, animTime);

    float detailScale = 0.6;
    normal = toNdc(normal);
    normalDetail = toNdc(normalDetail) * detailScale;

    vec3 combined = normalize(vec3(vec2(normal.xy + normalDetail.xy) * detailScale, normal.z));

    return combined;

}