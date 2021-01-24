import * as THREE from "three";

import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xff00000);

const renderer = new THREE.WebGLRenderer();

const map = new DDSLoader().load(
  "http://s000.tinyupload.com/index.php?file_id=87654837631901930879"
);
const material = new THREE.SpriteMaterial({ map: map });

const sprite = new THREE.Sprite(material);
scene.add(sprite);

document.body.append(renderer.domElement);
