int elevation = int(texture2D(elevations, vUv).r);

bool isWalkable = elevation == 1 || elevation == 3 || elevation == 5 || elevation == 7;

float elevationF = float(elevation) / 6.;

if (!isWalkable) {
    elevationF = 0.;
}

diffuseColor *= (texture2D(map, vUv));

if (drawMode == 1) {
    diffuseColor *= vec4(heatmapGradient(elevationF), 1.);
}