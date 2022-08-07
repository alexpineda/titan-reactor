import { MeshPhysicalMaterial, MeshStandardMaterial } from "three";

export const upgradeStandardMaterial = (source: MeshStandardMaterial) => {
    const dest = new MeshPhysicalMaterial;

    dest.color.copy(source.color);
    dest.roughness = source.roughness;
    dest.metalness = source.metalness;

    dest.map = source.map;

    dest.lightMap = source.lightMap;
    dest.lightMapIntensity = source.lightMapIntensity;

    dest.aoMap = source.aoMap;
    dest.aoMapIntensity = source.aoMapIntensity;

    dest.emissive.copy(source.emissive);
    dest.emissiveMap = source.emissiveMap;
    dest.emissiveIntensity = source.emissiveIntensity;

    dest.bumpMap = source.bumpMap;
    dest.bumpScale = source.bumpScale;

    dest.normalMap = source.normalMap;
    dest.normalMapType = source.normalMapType;
    dest.normalScale.copy(source.normalScale);

    dest.displacementMap = source.displacementMap;
    dest.displacementScale = source.displacementScale;
    dest.displacementBias = source.displacementBias;

    dest.roughnessMap = source.roughnessMap;

    dest.metalnessMap = source.metalnessMap;

    dest.alphaMap = source.alphaMap;

    dest.envMap = source.envMap;
    dest.envMapIntensity = source.envMapIntensity;

    dest.wireframe = source.wireframe;
    dest.wireframeLinewidth = source.wireframeLinewidth;
    dest.wireframeLinecap = source.wireframeLinecap;
    dest.wireframeLinejoin = source.wireframeLinejoin;

    dest.flatShading = source.flatShading;

    dest.fog = source.fog;

    return dest;
}