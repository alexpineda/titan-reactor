uniform vec2 uFrame;
varying vec2 vFrame;

void mainSupport(const in vec2 uv) {

    float frame = floor(fract(time / 500.) * uFrame.x);

    vFrame = vec2(mod(frame, uFrame.x) / uFrame.x, floor(frame / uFrame.y) / uFrame.y);
}
