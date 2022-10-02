import { UnitSelectionStatus } from "@input";
import { Assets } from "@image/assets";
import { ShaderMaterial, Texture, Vector2 } from "three";
import { LegacyGRP } from "..";

export class CursorMaterial extends ShaderMaterial {
    #assets: Assets;

    constructor(assets: Assets) {

        super();

        this.#assets = assets;

        this.vertexShader = `

            varying vec2 vUv;
            varying vec2 vFrame;
            uniform vec2 uCursorPosition;

            uniform vec2 uArrowSize;
            uniform vec2 uResolution;
            uniform float uCursorSize;
            
            uniform vec2 uFrame;
            uniform float uTime;

            void main() {

                vUv = uv;

                float frame = floor(fract(uTime / 500.) * uFrame.x);

                vFrame = vec2(mod(frame, uFrame.x) / uFrame.x, floor(frame / uFrame.y) / uFrame.y);

                vec2 res = (uArrowSize / uResolution) / uFrame;
                vec2 pos2d = position.xy * res * uCursorSize + uCursorPosition;

                gl_Position = vec4(pos2d, position.z, 1.);

            }
        `;


        this.fragmentShader = ` 
            uniform sampler2D uArrowTex;
            uniform vec2 uFrame;
            varying vec2 vUv;
            varying vec2 vFrame;
            
            void main() {
            
                gl_FragColor = texture2D(uArrowTex, vUv / uFrame + vFrame);
            
            }
        `

        this.transparent = true;

    }

    update(delta: number, mousePosition: { x: number, y: number }, selectionStatus: UnitSelectionStatus) {
        this.uniforms.uTime.value += delta;

        this.uniforms.uCursorPosition.value.set(mousePosition.x, mousePosition.y);

        if (selectionStatus === UnitSelectionStatus.Dragging) {
            this.drag();
        } else if (selectionStatus === UnitSelectionStatus.Hovering) {
            this.hover();
        } else {
            this.pointer();
        }
    }

    override uniforms = {
        uArrowTex: { value: new Texture() },
        uArrowSize: { value: new Vector2() },
        uResolution: { value: new Vector2() },
        uCursorPosition: { value: new Vector2() },
        uFrame: { value: new Vector2() },
        uGraphicOffset: { value: new Vector2() },
        uTime: { value: 0 },
        uCursorSize: { value: 1 },
    }

    #setCursor(cursor: LegacyGRP) {
        if (cursor.texture !== this.uniforms.uArrowTex.value) {
            this.uniforms.uArrowTex.value = cursor.texture;
            this.uniforms.uArrowSize.value.set(cursor.texture.image.width, cursor.texture.image.height);
            this.uniforms.uFrame.value.set(cursor.frames!.length!, 1);
        }
    }

    pointer() {
        this.#setCursor(this.#assets.arrowIconsGPU);
    }

    hover() {
        this.#setCursor(this.#assets.hoverIconsGPU);
    }

    drag() {
        this.#setCursor(this.#assets.dragIconsGPU);
    }

}