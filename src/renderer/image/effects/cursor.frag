uniform vec2 uCursorPosition;
uniform vec2 uArrowSize;
uniform sampler2D uArrowTex;
uniform vec2 uFrame;
uniform vec2 uResolution;
uniform vec2 uGraphicOffset;

varying vec2 vFrame;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

    vec2 res = uArrowSize / uResolution;
    vec2 aSize =  uArrowSize / uFrame;
    vec2 frameRes = res * (1./uFrame);

    vec2 uvCursor = 1. - (uCursorPosition + 1.) / 2. - uGraphicOffset;

    vec2 delta = uv - (1. - uvCursor);
    vec2 diff = 1. - step( frameRes / 2., abs(delta));




    // chunk space
    vec2 cUv = (mod(uv * uResolution, aSize) + mod(uvCursor * uResolution, aSize)) / aSize; 
    vec4 cColor = texture2D(uArrowTex, cUv / uFrame + vFrame);


    outputColor = mix(inputColor, cColor, cColor.a * diff.x * diff.y);

}

