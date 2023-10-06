#include <map_fragment>

float creepF = texture2D(creep, qUv).r;
float creepE = texture2D(creepEdges, qUv).r;

diffuseColor = sampleCreep(diffuseColor, vMapUv, creepF, creepTexture, creepResolution.x, mapToCreepResolution.xy);

diffuseColor = sampleCreep(diffuseColor, vMapUv, creepE, creepEdgesTexture, creepResolution.y, mapToCreepResolution.zy);


#ifdef USE_WATER_MASK

float textureFade = fract(uTime);

vec2 mUv = fract(qUv * tileUnit.zw);

vec3 waterNormal = waterSample(uTime, textureFade, mUv , mUv / 4.0);

float water = texture2D(waterMask, vMapUv).r;

vec2 wUv = vMapUv + vec2(waterNormal.x * 0.019, waterNormal.y * 0.029);

vec3 waterColor = texture2D(map, wUv).rgb;
float waterDist = texture2D(waterMask, wUv).r;
float destWaterMask = min(water, waterDist);

diffuseColor = vec4(vec3(mix(diffuseColor.rgb, waterColor, destWaterMask)), 1.0);

#endif