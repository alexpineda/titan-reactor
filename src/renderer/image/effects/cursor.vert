uniform vec2 uFrame;
varying vec2 vFrame;

void mainSupport(const in vec2 uv) {

    float frame = floor(fract(time / 1000.) * uFrame.x);

    vFrame = vec2(mod(frame, uFrame.x) / uFrame.x, floor(frame / uFrame.y) / uFrame.y);
}
