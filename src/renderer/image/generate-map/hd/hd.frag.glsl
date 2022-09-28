#include <map_fragment>


// read game data from the proper quartile
float creepF = texture2D(creep, qUv).r;
float creepE = texture2D(creepEdges, qUv).r;

// diffuseColor = vec4(triplanarMapping(map, vNormal, v_Position), diffuseColor.w);

diffuseColor = sampleCreep(diffuseColor, vUv, creepF, creepTexture, creepResolution, mapToCreepResolution);

diffuseColor = sampleCreep(diffuseColor, vUv, creepE, creepEdgesTexture, creepEdgesResolution, mapToCreepEdgesResolution);