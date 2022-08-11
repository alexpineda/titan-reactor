import * as THREE from 'three';
import { Vector3 } from 'three';

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
uniform float pointMultiplier;
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
  gl_PointSize = pointMultiplier * size;
  
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

export type Particle = {
    position: THREE.Vector3;
    size: number;
    currentSize: number;
    color: THREE.Vector4;
    life: number;
    maxLife: number;
    angle: number;
    velocity: THREE.Vector3;
    frame?: number;
    maxFrame?: number;
};

export type ParticleSystemOptions = {
    count: number;
    size: (t: number) => number;
    alpha: (t: number) => number;
    coordScale: number;
    sortParticles: boolean;
    sizeAttenuation: boolean;
    spriteMap?: {
        tex: THREE.Texture;
        frameCount: number;
        width: number;
        height: number;
    },
    particleTemplate: (opts: ParticleSystemOptions) => Particle;
}

export function createParticles<T extends ParticleSystemOptions>(_opts: T) {
    const opts = _opts;
    const geom = new THREE.BufferGeometry();
    const material = new THREE.ShaderMaterial({
        blending: THREE.AdditiveBlending,
        transparent: true,
        vertexColors: false,
        depthTest: true,
        depthWrite: false,
        fragmentShader,
        vertexShader,
        uniforms: {
            pointMultiplier: { value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0)) },
            diffuseTexture: { value: opts.spriteMap?.tex },
            uFrame: { value: new THREE.Vector2(opts.spriteMap?.width ?? 1, opts.spriteMap?.height ?? 1) }
        }
    });

    if (opts.spriteMap) {
        material.defines.USE_SPRITEMAP = 1;
    }

    if (opts.sizeAttenuation) {
        material.defines.USE_SIZEATTENUATION = 1;
    }

    const points = new THREE.Points(geom, material);
    points.frustumCulled = false;

    let particles = new Array<Particle>();

    for (let i = 0; i < opts.count; i++) {
        particles.push(opts.particleTemplate(opts));
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

            particles.push(opts.particleTemplate(opts));
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
            colors.push(particle.color.x, particle.color.y, particle.color.z, particle.color.w);
            angles.push(particle.angle);
            if (opts.spriteMap) {
                frames.push(particle.frame!);
            }
        }

        geom.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        );
        geom.setAttribute(
            'size',
            new THREE.Float32BufferAttribute(sizes, 1)
        );
        geom.setAttribute(
            'color',
            new THREE.Float32BufferAttribute(colors, 4)
        );
        geom.setAttribute(
            'angle',
            new THREE.Float32BufferAttribute(angles, 1)
        );
        geom.setAttribute(
            'frame',
            new THREE.Float32BufferAttribute(frames, 1)
        );
        geom.attributes.position.needsUpdate = true;
        geom.attributes.size.needsUpdate = true;
        geom.attributes.color.needsUpdate = true;
        geom.attributes.angle.needsUpdate = true;
        geom.attributes.frame.needsUpdate = !!opts.spriteMap;
    };

    const _velocityAdd = new Vector3;

    const updateParticles = (camera: THREE.Camera, delta: number) => {
        for (let p of particles) {
            p.life -= delta;
        }

        particles = particles.filter(p => {
            return p.life > 0.0;
        });

        for (let p of particles) {
            const t = 1.0 - p.life / p.maxLife;
            p.color.w = opts.alpha(t);
            p.currentSize = p.size * opts.size(t);
            p.position.add(_velocityAdd.copy(p.velocity).multiplyScalar(delta / 1000));
            if (opts.spriteMap) {
                p.frame = Math.floor(t * p.maxFrame!);
            }
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
        update(camera: THREE.Camera, delta: number) {
            const d = delta / 1000;
            addParticles(d);
            updateParticles(camera, d);
            updateGeometry();
        }
    };
};

export type ParticleSystem = ReturnType<typeof createParticles>;