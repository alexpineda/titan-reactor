import { AdditiveBlending } from 'three/src/constants';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Float32BufferAttribute } from 'three/src/core/BufferAttribute';
import { Points } from 'three/src/objects/Points';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { Box3, MathUtils } from 'three';

const fragmentShader = `
#ifdef USE_SPRITEMAP

uniform sampler2D diffuseTexture;
uniform vec2 uFrame;
varying vec2 vFrame;
varying vec2 vAngle;

#endif

varying vec4 vColor;

  void main() {

    gl_FragColor = vColor;

    #ifdef USE_SPRITEMAP

    vec2 coords = ((gl_PointCoord / uFrame + vFrame) - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
    gl_FragColor *= texture2D(diffuseTexture, coords);

    #endif
  }

`;

const vertexShader = `
uniform float scale;
attribute float size;
attribute vec4 color;
varying vec4 vColor;

#ifdef USE_SPRITEMAP

uniform vec2 uFrame;
attribute float angle;
attribute float frame;
varying vec2 vAngle;
varying vec2 vFrame;

#endif

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = scale * size;// * projectionMatrix[0][0];
  
  vColor = color;

  #ifdef USE_SPRITEMAP

  vAngle = vec2(cos(angle), sin(angle));
  vFrame = vec2(mod(frame, uFrame.x) / uFrame.x, 1. - floor(frame / uFrame.y) / uFrame.y);

  #endif


  #ifdef USE_SIZEATTENUATION
  
  gl_PointSize /= gl_Position.w;
  
  #endif
  
}
`;

export interface ParticleDefinition {
    position: THREE.Vector3;
    scale: number;
    color: THREE.Color;
    maxLife: number;
};

export interface Particle extends ParticleDefinition {
    currentSize: number;
    life: number;
    angle: number;
    alpha: number;
    frame: number;
    oldPosition: THREE.Vector3;
};

export interface ParticleSystemDefinition {
    id: string;
    count: number;
    sortParticles: boolean;
    sizeAttenuation: boolean;
    update: (t: number, delta: number, particle: Particle, opts: ParticleSystemDefinition) => void;
    spriteMap?: {
        tex: THREE.Texture;
        frameCount: number;
        width: number;
        height: number;
        loop: number;
    },
    emit: (opts: ParticleSystemDefinition) => ParticleDefinition;
    [key: string]: any;
}

export interface ParticleSystemState extends ParticleSystemDefinition {
    boundingBox: Box3;
}

type FnOrValue<T> = ((t: number, delta: number, particle: Particle) => T) | T;

const apply = (fnOrValue: FnOrValue<number>, t: number, delta: number, particle: Particle) => {
    if (typeof fnOrValue === 'function') {
        return fnOrValue(t, delta, particle);
    } else {
        return fnOrValue;
    }
}

const _velocityAdd = new Vector3;

export const defaultUpdate = ({ alpha, size, velocity }: { alpha: FnOrValue<number>, size: FnOrValue<number>, velocity: Vector3 }) =>
    (t: number, delta: number, p: Particle, opts: ParticleSystemDefinition) => {
        p.alpha = apply(alpha, t, delta, p);
        p.currentSize = p.scale * apply(size, t, delta, p);
        p.position.add(_velocityAdd.copy(velocity).multiplyScalar(delta / 1000));
        if (opts.spriteMap) {
            p.frame = Math.floor(opts.spriteMap.loop * t * opts.spriteMap.frameCount) % opts.spriteMap.frameCount;
        }
    }

export function createParticles<T extends ParticleSystemDefinition>(_opts: T) {
    const opts = _opts;
    const geom = new BufferGeometry();
    const material = new ShaderMaterial({
        blending: AdditiveBlending,
        transparent: true,
        vertexColors: false,
        depthTest: true,
        depthWrite: false,
        fragmentShader,
        vertexShader,
        uniforms: {
            scale: { value: 1 },
            diffuseTexture: { value: opts.spriteMap?.tex },
            uFrame: { value: new Vector2(opts.spriteMap?.width ?? 1, opts.spriteMap?.height ?? 1) }
        }
    });

    if (opts.spriteMap) {
        material.defines.USE_SPRITEMAP = 1;
    }

    if (opts.sizeAttenuation) {
        material.defines.USE_SIZEATTENUATION = 1;
    }

    const points = new Points(geom, material);
    points.frustumCulled = false;

    const onEmit = (particle: ParticleDefinition) => {
        const out = particle as Particle;
        out.life = particle.maxLife;
        out.angle = 0;
        out.frame = 0;
        out.oldPosition = (new Vector3()).copy(out.position);
        opts.update(0, 0, out, opts);
        return out;
    }

    let particles = new Array<Particle>();
    for (let i = 0; i < opts.count; i++) {
        particles.push(onEmit(opts.emit(opts)));
    }

    let gdfsghk = 0;
    const addParticles = (delta: number) => {
        if (!gdfsghk) {
            gdfsghk = 0.0;
        }
        gdfsghk += delta;
        const n = Math.floor(gdfsghk * opts.count);
        gdfsghk -= n / opts.count;
        for (let i = 0; i < n; i++) {
            particles.push(onEmit(opts.emit(opts)));
        }
    }

    const positions: number[] = [];
    const sizes: number[] = [];
    const colors: number[] = [];
    const angles: number[] = [];
    const frames: number[] = [];
    const updateGeometry = () => {
        positions.length = 0;
        sizes.length = 0;
        colors.length = 0;
        angles.length = 0;
        frames.length = 0;

        for (const particle of particles) {
            positions.push(
                particle.position.x,
                particle.position.y,
                particle.position.z
            );
            sizes.push(particle.currentSize);
            colors.push(particle.color.r, particle.color.g, particle.color.b, particle.alpha);
            angles.push(particle.angle);
            if (opts.spriteMap) {
                frames.push(particle.frame!);
            }
        }

        geom.setAttribute(
            'position',
            new Float32BufferAttribute(positions, 3)
        );
        geom.setAttribute(
            'size',
            new Float32BufferAttribute(sizes, 1)
        );
        geom.setAttribute(
            'color',
            new Float32BufferAttribute(colors, 4)
        );
        geom.setAttribute(
            'angle',
            new Float32BufferAttribute(angles, 1)
        );
        geom.setAttribute(
            'frame',
            new Float32BufferAttribute(frames, 1)
        );
        geom.attributes.position.needsUpdate = true;
        geom.attributes.size.needsUpdate = true;
        geom.attributes.color.needsUpdate = true;
        geom.attributes.angle.needsUpdate = true;
        geom.attributes.frame.needsUpdate = !!opts.spriteMap;
    };

    const updateParticles = (camera: THREE.Camera, delta: number) => {
        for (let p of particles) {
            p.life -= delta;
        }

        particles = particles.filter(p => {
            return p.life > 0.0;
        });

        for (let p of particles) {
            const t = 1.0 - p.life / p.maxLife;
            p.oldPosition.copy(p.position);
            opts.update(t, delta, p, opts);
        }

        if (opts.sortParticles) {
            particles.sort((a, b) => {
                const d1 = camera.position.distanceTo(a.position);
                const d2 = camera.position.distanceTo(b.position);
                return d2 - d1;
            });
        }

    }

    return {
        get opts() {
            return opts;
        },
        get object() {
            return points;
        },
        update(camera: THREE.PerspectiveCamera, delta: number) {
            const d = delta / 1000;
            material.uniforms.scale.value = Math.abs(window.innerHeight / (2 * Math.tan(MathUtils.degToRad(camera.getEffectiveFOV() * 0.5))));

            addParticles(d);
            updateParticles(camera, d);
            updateGeometry();

        }
    };
};

export type ParticleSystem = ReturnType<typeof createParticles>;