import { Shader, ShaderChunk } from "three";

export const flatProjection = (shader: Shader, additionalInsert = "") => {
  shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", ShaderChunk.project_vertex.replace(
    "gl_Position = projectionMatrix * mvPosition;",
    `
    
          vec4 pos = vec4( transformed, 1.0 );
          mat4 mm = modelMatrix;

          #ifdef USE_INSTANCING
            mm = modelMatrix * instanceMatrix;
          #endif

          #ifndef USE_INSTANCING
          mat4 mv = viewMatrix * mm;
  
          mv[0][0] = mm[0][0];
          mv[0][1] = 0.;
          mv[0][2] = 0.;
          mv[1][0] = 0.;
          mv[1][1] = mm[1][1];
          mv[1][2] = 0.;
          mv[2][0] = 0.;
          mv[2][1] = 0.;
          mv[2][2] = mm[2][2];

          gl_Position = projectionMatrix * mv * pos;
          #endif

          ${additionalInsert}
    
        `
  ));
}

export const flatProjectionGroup = (shader: Shader, additionalInsert = "") => {
  shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", ShaderChunk.project_vertex.replace(
    "gl_Position = projectionMatrix * mvPosition;",
    `
    
          vec4 pos = vec4( transformed, 1.0 );
          mat4 mv = viewMatrix * uParentMatrix;
  
          // mv[0][0] = mm[0][0];
          // mv[0][1] = 0.;
          // mv[0][2] = 0.;
          // mv[1][0] = 0.;
          // mv[1][1] = mm[1][1];
          // mv[1][2] = 0.;
          // mv[2][0] = 0.;
          // mv[2][1] = 0.;
          // mv[2][2] = mm[2][2];

          gl_Position = projectionMatrix * mv * pos;

          ${additionalInsert}
    
        `
  ));

  shader.vertexShader = `
  
    uniform mat4 uParentMatrix;
    uniform mat4 uLocalMatrix;

    ${shader.vertexShader}

  `
}