import { Shader, ShaderChunk } from "three";

export const flatProjection = (shader: Shader) => {
    shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", ShaderChunk.project_vertex.replace(
        "gl_Position = projectionMatrix * mvPosition;",
        `
          mat4 mv = modelViewMatrix;
  
          mv[0][0] = modelMatrix[0][0];
          mv[0][1] = 0.;
          mv[0][2] = 0.;
          mv[1][0] = 0.;
          mv[1][1] = modelMatrix[1][1];
          mv[1][2] = 0.;
          mv[2][0] = 0.;
          mv[2][1] = 0.;
          mv[2][2] = modelMatrix[2][2];
  
          gl_Position = projectionMatrix * mv * vec4(transformed, 1.);
    
        `
    ));
}