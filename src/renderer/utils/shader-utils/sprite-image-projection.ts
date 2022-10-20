import { Shader, ShaderChunk } from "three";
import vertShader from "./spherical-projection.vert.glsl?raw";

// similar to cheat-spherical except that it keeps the child (image) local matrix intact
export const spriteImageProjection = ( shader: Shader, additionalInsert = "" ) => {
    shader.vertexShader = shader.vertexShader.replace(
        "#include <project_vertex>",
        ShaderChunk.project_vertex.replace(
            "gl_Position = projectionMatrix * mvPosition;",
            `
    
          ${vertShader}          

          ${additionalInsert}
    
        `
        )
    );

    shader.vertexShader = `
  
    uniform mat4 uParentMatrix;
    uniform mat4 uLocalMatrix;

    ${shader.vertexShader}

  `;
};
