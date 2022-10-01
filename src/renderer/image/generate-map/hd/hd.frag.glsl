#include <map_fragment>

// read game data from the proper quartile
float creepF = texture2D(creep, qUv).r;
float creepE = texture2D(creepEdges, qUv).r;

diffuseColor = sampleCreep(diffuseColor, vUv, creepF, creepTexture, creepResolution, mapToCreepResolution);

diffuseColor = sampleCreep(diffuseColor, vUv, creepE, creepEdgesTexture, creepEdgesResolution, mapToCreepEdgesResolution);

#ifdef USE_WATER_MASK

vec4 water = texture2D(waterMask, vUv);

diffuseColor = mix(diffuseColor, water, water.r);

#endif