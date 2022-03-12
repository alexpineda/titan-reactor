 #include <map_fragment>

//reposition the quartile y offset, yeah shits getting weird :S
vec2 qo = vec2(quartileOffset.x, (1. - quartileResolution.y) - quartileOffset.y);

vec2 creepUv = vUv * quartileResolution + qo;
float creepF = texture2D(creep, creepUv).r;
float creepEdge = texture2D(creepEdges, creepUv).r;

diffuseColor = getCreepColor(creepUv, vUv, creep, creepResolution, mapToCreepResolution,diffuseColor);

if (creepEdge > 0.) {
    vec2 creepUv = getCreepUv(vUv, creepEdge, creepEdgesResolution, mapToCreepEdgesResolution);
    vec4 creepEdgeColor = texture2D(creepEdgesTexture, creepUv);
    diffuseColor = mix(diffuseColor, creepEdgeColor, creepEdgeColor.a);
}