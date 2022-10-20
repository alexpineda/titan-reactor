
mat4 mm = uParentMatrix;

vec4 pos = vec4( transformed, 1.0 );

// have the sprite look at the camera, then apply local image position to the sprite

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

gl_Position = projectionMatrix * mv * uLocalMatrix * pos;