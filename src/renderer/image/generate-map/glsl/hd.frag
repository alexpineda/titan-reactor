#include <map_fragment>

// normalize our uv depending on our quartile
vec2 qo = vec2(quartileOffset.x, (1. - quartileSize.y) - quartileOffset.y);
vec2 qUv = vUv * quartileSize + qo;

// read game data from the proper quartile
float creepF = texture2D(creep, qUv).r;
float creepEdge = texture2D(creepEdges, qUv).r;

// diffuseColor = vec4(triplanarMapping(map, vNormal, v_Position), diffuseColor.w);

// draw creep if it exists, otherwise draw the tile
diffuseColor = getCreepColor(qUv, vUv, creep, creepResolution, mapToCreepResolution, diffuseColor);

// draw creep edge if it exists
if (creepEdge > 0.) {
    vec2 qUv = getCreepUv(vUv, creepEdge, creepEdgesResolution, mapToCreepEdgesResolution);
    vec4 creepEdgeColor = texture2D(creepEdgesTexture, qUv);
    diffuseColor = mix(diffuseColor, creepEdgeColor, creepEdgeColor.a);
}
