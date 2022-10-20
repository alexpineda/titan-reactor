import { Shader, ShaderChunk } from "three";
import vertShader from "./sprite-image-projection.vert.glsl?raw";

type Options = {
    pre?: string;
    post?: string;
    header?: string;
};

// similar to cheat-spherical except that it keeps the child (image) local matrix intact
export const extend_withSpriteImageProjection = ( shader: Shader, opts?: Options ) => {
    shader.vertexShader = shader.vertexShader.replace(
        "#include <project_vertex>",
        ShaderChunk.project_vertex.replace(
            "gl_Position = projectionMatrix * mvPosition;",
            `

          ${opts?.pre ?? ""}
    
          ${vertShader}          

          ${opts?.post ?? ""}
    
        `
        )
    );

    shader.vertexShader = `
  
    uniform mat4 uParentMatrix;
    uniform mat4 uLocalMatrix;

    ${opts?.header ?? ""}

    ${shader.vertexShader}

  `;
};

// similar to cheat-spherical except that it keeps the child (image) local matrix intact
export const spriteImageProjection = ( opts?: Options ) => {
    return `
  uniform mat4 uParentMatrix;
  uniform mat4 uLocalMatrix;
  attribute vec3 position;
  attribute vec2 uv;

  varying vec2 vUv;

  ${opts?.header ?? ""}


  void main() {

    vec3 transformed = position;

    ${opts?.pre ?? ""}

    ${vertShader}

    ${opts?.post ?? ""}

    vUv = uv;

  }
  `;
};
