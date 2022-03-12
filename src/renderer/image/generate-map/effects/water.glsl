// modified from: https://github.com/saintofidiocy/SCR-Graphics/blob/main/shaders/water.txt

uniform sampler2D spriteTex;
uniform sampler2D maskTex; // Tile mask -- why would this be in a separate shader? Why, effect_mask.glsl, why?

//in vec2 mapCoord;  // large tiles
//in vec2 mapCoord2; // small tiles

uniform vec4 data;

uniform sampler2D sampleTex;  // normal 1 frame 1
uniform sampler2D sampleTex2; // normal 1 frame 2 (for interpolation)
uniform sampler2D sampleTex3; // normal detail frame 1
uniform sampler2D sampleTex4; // normal detail frame 2 (for interpolation)



vec4 scale(vec4 v)
{
    return (v * 2.0) - 1.0;
}

vec3 scale(vec3 v)
{
    return (v * 2.0) - 1.0;
}

vec2 scale(vec2 v)
{
    return (v * 2.0) - 1.0;
}


vec3 WaterSample(float time, float animTime)
{
    float t = time / 20.0;

    vec2 mappedUV1 = gl_TexCoord[0].xy; // mapCoord;
    mappedUV1.x -= (t / 2.0);
    mappedUV1.y += (t / 1.0);

    vec2 mappedUV2 = gl_TexCoord[1].xy; // mapCoord2;
    mappedUV2.x -= t * 2.0;
    mappedUV2.y += t * 1.8;

    vec3 normalFrameOne = texture2D(sampleTex, mappedUV1).rgb;
    vec3 normalFrameTwo = texture2D(sampleTex2, mappedUV1).rgb;
    vec3 normal = mix(normalFrameOne, normalFrameTwo, animTime);

    vec3 normal2FrameOne = texture2D(sampleTex3, mappedUV2).rgb;
    vec3 normal2FrameTwo = texture2D(sampleTex4, mappedUV2).rgb;
    vec3 normalDetail = mix(normal2FrameOne, normal2FrameTwo, animTime);

    float detailScale = 0.6;
    normal = scale(normal);
    normalDetail = scale(normalDetail) * detailScale;

    vec3 combined = normalize(vec3(vec2(normal.xy + normalDetail.xy) * detailScale, normal.z));

    return combined;
}

float WaterSpecPower(vec3 normal, vec2 uv, float gameX)
{
// scale uv to (-1, 1) so the center of the screen is { 0, 0 }
    vec2 specUV = scale(uv);
    // Show specular towards the middle of the screen
    float lightX = mix(-0.1, 0.1, 1.0 - clamp(gameX, 0.0, 1.0));
    float xDistance = clamp(1.0 - distance(specUV.x, lightX), 0, 1);
    float yDistance = clamp(1.0 - distance(specUV.y, -0.2), 0, 1);
    float spower = yDistance * pow(xDistance, 3.0);
    spower *= 0.6;
    return spower;
}

void main()
{
    float gameX       = data.x; // seems to be XScroll/mapWidth
    float textureFade = data.y; // 0.0 to 1.0 for interpolation between water animation frames
    float time        = data.z; // time since game start?

    vec4 tex = vec4(texture2D(spriteTex, gl_TexCoord[0].xy).rgb, texture2D(maskTex, gl_TexCoord[0].xy).r);
    vec3 groundColor = tex.rgb;

    vec3 normal = WaterSample(time, textureFade);
    vec2 uv = gl_TexCoord[0].xy;
    uv.x += normal.x * 0.019;
    uv.y += normal.y * 0.029;

    vec4 texColor = vec4(texture2D(spriteTex, uv).rgb, texture2D(maskTex, uv).r);
    float destMask = min(tex.a, texColor.a);
    float sourceMask = tex.a;

    vec3 result = mix(texColor.rgb, groundColor, 1.0 - destMask);

    float spower = WaterSpecPower(normal, gl_TexCoord[2].xy, gameX);
    float specValue = ((normal.x*1.2 + normal.y + normal.z) / 3.0) * spower;// length(normal);
    vec3 waterColor = result + specValue;

    // Put specular on the ground, even where distortion can't be applied
    groundColor = mix(groundColor, groundColor + specValue, sourceMask);

    gl_FragColor = vec4(vec3(mix(groundColor, waterColor, destMask)), 1.0);
}
