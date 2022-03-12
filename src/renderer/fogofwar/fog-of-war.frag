// shader ported from meep(https://github.com/Usnul/meep)
uniform sampler2D fog;
uniform mat4 viewInverse;
uniform vec3 color;

uniform vec4 fogUvTransform;

uniform mat4 projectionInverse;
uniform vec2 fogResolution;

vec3 computeWorldPosition(const in vec2 uv, const in float depth) {

	// Convert screen coords to normalized device coordinates.
	vec4 ndc = vec4(
		(uv - 0.5) * 2.0,
		(depth - 0.5) * 2.0,
		1.0
	);

	vec4 clip = projectionInverse * ndc;
	vec3 result = (viewInverse* (clip / clip.w)).xyz;

	return result;

}

float sampleFog(const in vec2 uv) {

	return texture2D(fog, uv).r;

}

float getFog(const in vec2 uv) {

	vec2 texelSize = vec2(1.0)/ fogResolution;
	float r = 1.0;

	float dx0 = -texelSize.x * r;
	float dy0 = -texelSize.y * r;
	float dx1 = texelSize.x * r;
	float dy1 = texelSize.y * r;
  
	return (
		sampleFog(uv + vec2(dx0, dy0)) +
		sampleFog(uv + vec2(0.0, dy0)) +
		sampleFog(uv + vec2(dx1, dy0)) +
		sampleFog(uv + vec2(dx0, 0.0)) +
		sampleFog(uv) +
		sampleFog(uv + vec2(dx1, 0.0)) +
		sampleFog(uv + vec2(dx0, dy1)) +
		sampleFog(uv + vec2(0.0, dy1)) +
		sampleFog(uv + vec2(dx1, dy1))
	) * (1.0 / 9.0);
    
}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {

	vec3 worldPosition = computeWorldPosition(uv, depth);
  vec2 fogUv = worldPosition.xz * fogUvTransform.wz + fogUvTransform.xy;
	float fogValue = getFog(fogUv);

  outputColor = vec4(color, 1.-fogValue);


}