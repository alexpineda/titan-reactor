#include <map_fragment>

// read game data from the proper quartile
float creepF = texture2D(creep, qUv).r;
float creepE = texture2D(creepEdges, qUv).r;

diffuseColor = sampleCreep(diffuseColor, vUv, creepF, creepTexture, creepResolution.x, mapToCreepResolution.xy);

diffuseColor = sampleCreep(diffuseColor, vUv, creepE, creepEdgesTexture, creepResolution.y, mapToCreepResolution.zy);

#ifdef USE_WATER_MASK

vec4 water = texture2D(waterMask, vUv);

diffuseColor = mix(diffuseColor, water, water.r);

#endif