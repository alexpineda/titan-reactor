precision highp isampler2D;
precision highp sampler2D;

uniform vec2 quartileSize;
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

varying vec3 v_Position;


vec2 getCreepUv( vec2 uv, in float value, in vec2 res, in vec2 invRes ) {
    float creepS = (value - 1./255.) * 255./res.x ; 

    float tilex = mod(uv.x, invMapResolution.x) * invRes.x + creepS;
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