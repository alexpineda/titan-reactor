varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uMapResolution;

varying vec2 mapUv;
varying vec2 mapAspect;
varying vec2 bounds;

void main() {

    float screenAspectF = uResolution.x / uResolution.y;
    float mapAspectF = uMapResolution.x / uMapResolution.y;
    
    vec2 aspect = vec2(screenAspectF > 1.0 ? 1.0 / screenAspectF : 1.0, screenAspectF < 1.0 ? screenAspectF : 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    mapAspect = vec2(mapAspectF > 1.0 ? 1.0 / mapAspectF : 1.0, mapAspectF < 1.0 ? mapAspectF : 1.0);

    bounds = vec2(0.5) - 0.5 * mapAspect.yx;

    vUv = uv;

    mapUv = (uv - bounds) / mapAspect.yx;
    
}