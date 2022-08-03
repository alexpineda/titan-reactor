#include <map_fragment>

// normalize our uv depending on our quartile
vec2 qo = vec2(quartileOffset.x, (1. - quartileSize.y) - quartileOffset.y);
vec2 qUv = vUv * quartileSize + qo;

// read game data from the proper quartile
float creepF = texture2D(creep, qUv).r;
float creepE = texture2D(creepEdges, qUv).r;

// diffuseColor = vec4(triplanarMapping(map, vNormal, v_Position), diffuseColor.w);

diffuseColor = sampleCreep(diffuseColor, vUv, creepF, creepTexture, creepResolution, mapToCreepResolution);

diffuseColor = sampleCreep(diffuseColor, vUv, creepE, creepEdgesTexture, creepEdgesResolution, mapToCreepEdgesResolution);