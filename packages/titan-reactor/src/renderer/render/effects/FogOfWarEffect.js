import { Color, Matrix4, Uniform, Vector2, Vector4 } from "three";
import { Effect, EffectAttribute, BlendFunction } from "postprocessing";

const fragmentShader = `
uniform sampler2D fog;
uniform mat4 viewInverse;
uniform vec3 color;

uniform vec4 fogUvTransform;

uniform mat4 projectionInverse;
uniform vec2 fogResolution;
        
  vec3 computeWorldPosition(const in vec2 uv, const in float depth){
    // Convert screen coordinates to normalized device coordinates (NDC)
                    
    vec4 ndc = vec4(
        (uv.x - 0.5) * 2.0,
        (uv.y - 0.5) * 2.0,
        (depth - 0.5) * 2.0,
        1.0);
    
    vec4 clip = projectionInverse * ndc;
    vec3 result = (viewInverse* (clip / clip.w) ).xyz;
    
    return result;
  }
	     
  float sampleFog(const in vec2 uv){
    return texture2D( fog, uv ).r;
  }
	     
  float getFog(const in vec2 uv){
      vec2 texelSize = vec2( 1.0 ) / fogResolution;
    
      float r = 1.0;
      
      float dx0 = - texelSize.x * r;
			float dy0 = - texelSize.y * r;
			float dx1 = + texelSize.x * r;
			float dy1 = + texelSize.y * r;
			
			return (
				sampleFog( uv.xy + vec2( dx0, dy0 ) ) +
				sampleFog( uv.xy + vec2( 0.0, dy0 ) ) +
				sampleFog( uv.xy + vec2( dx1, dy0 ) ) +
				sampleFog( uv.xy + vec2( dx0, 0.0 ) ) +
				sampleFog( uv.xy) +
				sampleFog( uv.xy + vec2( dx1, 0.0 ) ) +
				sampleFog( uv.xy + vec2( dx0, dy1 ) ) +
				sampleFog( uv.xy + vec2( 0.0, dy1 ) ) +
				sampleFog( uv.xy + vec2( dx1, dy1 ) )
			) * ( 1.0 / 9.0 );
	     }

  void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {

  vec3 worldPosition = computeWorldPosition(uv, depth);
  
  vec2 fogUv = worldPosition.xz * fogUvTransform.zw + fogUvTransform.xy;
  
  float fogValue = getFog( fogUv );
  
  outputColor = vec4(inputColor.rgb * fogValue * color, inputColor.a);
}
`;

export default class FogOfWarEffect extends Effect {
  constructor(fog) {
    super("FogOfWarEffect", fragmentShader, {
      attributes: EffectAttribute.DEPTH,
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ["fog", new Uniform(null)],
        ["fogResolution", new Uniform(new Vector2(1, 1))],
        ["viewInverse", new Uniform(new Matrix4())],
        ["projectionInverse", new Uniform(new Matrix4())],
        ["color", new Uniform(new Color())],
        ["fogUvTransform", new Uniform(new Vector4(0, 0, 1, 1))],
      ]),
    });

    this.fog = fog;
  }

  get fog() {
    return this.uniforms.get("fog").value;
  }

  set fog(value) {
    this.uniforms.get("fog").value = value;
  }

  get fogResolution() {
    return this.uniforms.get("fogResolution").value;
  }

  set fogResolution(value) {
    this.uniforms.get("fogResolution").value = value;
  }

  get viewInverse() {
    return this.uniforms.get("viewInverse").value;
  }

  set viewInverse(value) {
    this.uniforms.get("viewInverse").value = value;
  }

  get projectionInverse() {
    return this.uniforms.get("projectionInverse").value;
  }

  set projectionInverse(value) {
    this.uniforms.get("projectionInverse").value = value;
  }

  get color() {
    return this.uniforms.get("color").value;
  }

  set color(value) {
    this.uniforms.get("color").value = value;
  }

  get fogUvTransform() {
    return this.uniforms.get("fogUvTransform").value;
  }

  set fogUvTransform(value) {
    this.uniforms.get("fogUvTransform").value = value;
  }
}
