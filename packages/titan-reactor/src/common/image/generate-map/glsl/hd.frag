 #include <map_fragment>

//creep hd

//reposition the quartile y offset, yeah shits getting weird :S
vec2 qo = vec2(quartileOffset.x, (1. - quartileResolution.y) - quartileOffset.y);

vec2 creepUv = vUv * quartileResolution + qo;
float creepF = texture2D(creep, creepUv).r;
float creepEdge = texture2D(creepEdges, creepUv).r;

if (creepF > 0.) {
    vec4 creepColor = getSampledCreep(creepUv, vUv, creep, creepResolution, mapToCreepResolution);
    vec4 creepLinear = creepColor;
    diffuseColor =  creepLinear;
}

if (creepEdge > 0.) {
    vec2 creepUv = getCreepUv(vUv, creepEdge, creepEdgesResolution, mapToCreepEdgesResolution);
    vec4 creepEdgeColor = texture2D(creepEdgesTexture, creepUv);
    vec4 creepEdgeLinear = creepEdgeColor;
    diffuseColor = mix(diffuseColor, creepEdgeLinear, creepEdgeColor.a);
}