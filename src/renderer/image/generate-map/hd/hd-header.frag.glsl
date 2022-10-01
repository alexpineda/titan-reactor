precision highp isampler2D;
precision highp sampler2D;

uniform vec2 tileUnit;
uniform sampler2D waterMask;


uniform sampler2D creep;
uniform sampler2D creepTexture;
uniform vec2 creepResolution;
uniform vec3 mapToCreepResolution;

uniform sampler2D creepEdges;
uniform sampler2D creepEdgesTexture;

varying vec2 qUv;


// // water / effects uniforms
// uniform sampler2D spriteTex;
// uniform sampler2D maskTex; // Tile mask -- why would this be in a separate shader? Why, effect_mask.glsl, why?

// //in vec2 mapCoord;  // large tiles
// //in vec2 mapCoord2; // small tiles
// uniform vec4 data;

uniform sampler2D waterNormal1_0;  // normal 1 frame 1
uniform sampler2D waterNormal1_1; // normal 1 frame 2 (for interpolation)
uniform sampler2D waterNormal2_0; // normal detail frame 1
uniform sampler2D waterNormal2_1; // normal detail frame 2 (for interpolation)


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


// vec3 WaterSample(float time, float animTime)
// {
//     float t = time / 20.0;

//     vec2 mappedUV1 = gl_TexCoord[0].xy; // mapCoord;
//     mappedUV1.x -= (t / 2.0);
//     mappedUV1.y += (t / 1.0);

//     vec2 mappedUV2 = gl_TexCoord[1].xy; // mapCoord2;
//     mappedUV2.x -= t * 2.0;
//     mappedUV2.y += t * 1.8;

//     vec3 normalFrameOne = texture2D(sampleTex, mappedUV1).rgb;
//     vec3 normalFrameTwo = texture2D(sampleTex2, mappedUV1).rgb;
//     vec3 normal = mix(normalFrameOne, normalFrameTwo, animTime);

//     vec3 normal2FrameOne = texture2D(sampleTex3, mappedUV2).rgb;
//     vec3 normal2FrameTwo = texture2D(sampleTex4, mappedUV2).rgb;
//     vec3 normalDetail = mix(normal2FrameOne, normal2FrameTwo, animTime);

//     float detailScale = 0.6;
//     normal = toNdc(normal);
//     normalDetail = toNdc(normalDetail) * detailScale;

//     vec3 combined = normalize(vec3(vec2(normal.xy + normalDetail.xy) * detailScale, normal.z));

//     return combined;
// }

// float WaterSpecPower(vec3 normal, vec2 uv, float gameX)
// {
//     vec2 specUV = toNdc(uv);
//     // Show specular towards the middle of the screen
//     float lightX = mix(-0.1, 0.1, 1.0 - clamp(gameX, 0.0, 1.0));
//     float xDistance = clamp(1.0 - distance(specUV.x, lightX), 0, 1);
//     float yDistance = clamp(1.0 - distance(specUV.y, -0.2), 0, 1);
//     float spower = yDistance * pow(xDistance, 3.0);
//     spower *= 0.6;
//     return spower;
// }