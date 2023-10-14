uniform sampler2D fogBitmap;
uniform sampler2D unitsBitmap;
uniform sampler2D resourcesBitmap;
uniform sampler2D creepBitmap;
uniform sampler2D terrainBitmap;

uniform float fogOfWarOpacity;
uniform float uOpacity;
uniform float uSoftEdges;

uniform vec2 uCameraBoundsBL;
uniform vec2 uCameraBoundsTR;
uniform vec2 uCameraBoundsBR;
uniform vec2 uCameraBoundsTL;

uniform float u2Enabled;
uniform vec2 u2CameraBoundsBL;
uniform vec2 u2CameraBoundsTR;
uniform vec2 u2CameraBoundsBR;
uniform vec2 u2CameraBoundsTL;

varying vec2 vUv;
varying vec2 mapUv;
varying vec2 mapAspect;
varying vec2 bounds;

// half vector
const vec2 hv = vec2(0.5, -0.5);

// Function to calculate the area of a triangle given three 2D points
float triangleArea(vec2 A, vec2 B, vec2 C) {
    return abs((A.x*(B.y - C.y) + B.x*(C.y - A.y) + C.x*(A.y - B.y)) / 2.0);
}

// Function to check if a point is inside a quadrilateral
bool isPointInQuadrilateral(vec2 P, vec2 A, vec2 B, vec2 C, vec2 D) {
    float quadArea = triangleArea(A, B, C) + triangleArea(C, D, A);
    float areaSum = 0.0;
    areaSum += triangleArea(P, A, B);
    areaSum += triangleArea(P, B, C);
    areaSum += triangleArea(P, C, D);
    areaSum += triangleArea(P, D, A);
    
    return abs(quadArea - areaSum) < 0.001;
}

// Function to calculate the distance from point P to line segment AB
float pointToLineDistance(vec2 A, vec2 B, vec2 P) {
    vec2 PA = P - A, BA = B - A;
    float h = clamp(dot(PA, BA) / dot(BA, BA), 0.0, 1.0);
    return length(PA - h * BA);
}

void main() {
    
    vec4 minimapTerrainColor = texture2D(terrainBitmap, mapUv);
    vec4 creepColor = texture2D(creepBitmap, mapUv);
    vec4 unitsColor = texture2D(unitsBitmap, mapUv);
    vec4 fogColor = texture2D(fogBitmap, mapUv);
    vec4 resourcesColor = texture2D(resourcesBitmap, mapUv);

    vec4 result = vec4(minimapTerrainColor.rgb, uOpacity * uOpacity);

    result = mix(result, creepColor, creepColor.a * uOpacity * uOpacity);

    // intensify unit color on lower opacity
    unitsColor = vec4(unitsColor.rgb + vec3(1.0 - uOpacity) * 0.25, unitsColor.a);

    result = mix(result, unitsColor, unitsColor.a * uOpacity);
    result = mix(result, fogColor, fogColor.a * fogOfWarOpacity * uOpacity * 1.2);
    result = mix(result, resourcesColor, resourcesColor.a * uOpacity * uOpacity);

    result = mix(
        vec4(0.0, 0.0, 0.0, result.a),
        result,
        step(bounds.x, vUv.x) *
            step(bounds.y, vUv.y) *
            step(bounds.x, 1.0 - vUv.x) *
            step(bounds.y, 1.0 - vUv.y)
    );
    // TODO; multiply 0.1 (edge distance) by aspect ratio
    // also, make unit opacity taper more slowly than everything else
    result.a = mix(
        uOpacity,
        uOpacity *
            smoothstep(bounds.x, bounds.x + 0.1, vUv.x) *
            smoothstep(bounds.y, bounds.y + 0.1, vUv.y) *
            smoothstep(bounds.x, bounds.x + 0.1, 1.0 - vUv.x) *
            smoothstep(bounds.y, bounds.y + 0.1, 1.0 - vUv.y),
        uSoftEdges
    );



    gl_FragColor = result.rgba;


    // main viewport bounds
    // Calculate the minimum distance from the current pixel to any of the edges
    float minDist = min(
        min(pointToLineDistance(uCameraBoundsBL + hv, uCameraBoundsBR + hv, mapUv), pointToLineDistance(uCameraBoundsBR + hv, uCameraBoundsTR + hv, mapUv)),
        min(pointToLineDistance(uCameraBoundsTR + hv, uCameraBoundsTL + hv, mapUv), pointToLineDistance(uCameraBoundsTL + hv, uCameraBoundsBL + hv, mapUv))
    );

    // Threshold for edge thickness, you may need to adjust this
    float threshold = 0.005;  // Adjust based on your coordinate system
    float alpha = 0.8;

    // If within the edge thickness, color the pixel
    if (minDist < threshold) {
        gl_FragColor = mix(gl_FragColor, vec4(1.0, 1.0, 1.0, alpha), 0.1); 
    }

    // secondary viewport bounds
    // Calculate the minimum distance from the current pixel to any of the edges
    float minDist2 = min(
        min(pointToLineDistance(u2CameraBoundsBL + hv, u2CameraBoundsBR + hv, mapUv), pointToLineDistance(u2CameraBoundsBR + hv, u2CameraBoundsTR + hv, mapUv)),
        min(pointToLineDistance(u2CameraBoundsTR + hv, u2CameraBoundsTL + hv, mapUv), pointToLineDistance(u2CameraBoundsTL + hv, u2CameraBoundsBL + hv, mapUv))
    );

    float threshold2 = 0.004;  
    float alpha2 = 0.5;

    // If within the edge thickness, color the pixel
    if (minDist2 < threshold2) {
        gl_FragColor = mix(gl_FragColor, vec4(1.0, 1.0, 1.0, alpha2), 0.1 * u2Enabled); 
    }
}
