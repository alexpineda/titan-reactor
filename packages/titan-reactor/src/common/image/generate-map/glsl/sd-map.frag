int index = int(texture2D(paletteIndices, vUv).r);

#ifdef ROTATE_1
    if (index >= index1.x && index < index1.x + index1.y) {
    index = index1.x + ((index - index1.x + counter) % index1.y);
    }
#endif

#ifdef ROTATE_2
    if (index >= index2.x && index < index2.x + index2.y) {
    index = index2.x + ((index - index2.x + counter) % index2.y);
    }
#endif

#ifdef ROTATE_3
    if (index >= index3.x && index < index3.x + index3.y) {
    index = index3.x + ((index - index3.x + counter) % index3.y);
    }
#endif

// float indexF = float(index);
// vec4 paletteColor = texture2D(palette, vec2(indexF/256.,0));

// vec4 texelColor = mapTexelToLinear(paletteColor);
// vec4 texelColor = paletteColor;
vec4 texelColor = texture2D(map, vUv);

diffuseColor *= texelColor;

//sd creep
float creepF = texture2D(creep, vUv ).r;
float creepEdge = texture2D(creepEdges, vUv).r ;

if (creepF > 0.) {
    vec4 creepColor = getCreepColor(vUv, creep, creepResolution, mapToCreepResolution, vec4(0.));
    vec4 creepLinear = creepColor;
    diffuseColor =  creepLinear;
}

if (creepEdge > 0.) {
    vec2 creepUv = getCreepUv(vUv, creepEdge, creepEdgesResolution, mapToCreepEdgesResolution);
    vec4 creepEdgeColor = texture2D(creepEdgesTexture, creepUv);
    vec4 creepEdgeLinear = creepEdgeColor;
    diffuseColor = mix(diffuseColor, creepEdgeLinear, creepEdgeColor.a);
}