import * as THREE from "three";
import { handleResize } from "../../utils/resize";
// import { Music, getRandomLoadingSong, getRandomSong } from "./music";

console.log(new Date().toLocaleString());

// const music = new Music("./bwdata", document);

// music.play(getRandomLoadingSong());
// Start off by initializing a new context.
const context = new (window.AudioContext || window.webkitAudioContext)();

if (!context.createGain) context.createGain = context.createGainNode;
if (!context.createDelay) context.createDelay = context.createDelayNode;
if (!context.createScriptProcessor)
  context.createScriptProcessor = context.createJavaScriptNode;

// shim layer with setTimeout fallback
window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

function playSound(buffer, time) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source[source.start ? "start" : "noteOn"](time);
}

function loadSounds(obj, soundMap, callback) {
  // Array-ify
  var names = [];
  var paths = [];
  for (var name in soundMap) {
    var path = soundMap[name];
    names.push(name);
    paths.push(path);
  }
  const bufferLoader = new BufferLoader(context, paths, function (bufferList) {
    for (var i = 0; i < bufferList.length; i++) {
      var buffer = bufferList[i];
      var name = names[i];
      obj[name] = buffer;
    }
    if (callback) {
      callback();
    }
  });
  bufferLoader.load();
}

function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function (url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function () {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function (buffer) {
        if (!buffer) {
          alert("error decoding file data: " + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function (error) {
        console.error("decodeAudioData error", error);
      }
    );
  };

  request.onerror = function () {
    alert("BufferLoader: XHR error");
  };

  request.send();
};

BufferLoader.prototype.load = function () {
  for (var i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
};

function VolumeSample() {
  loadSounds(
    this,
    {
      buffer: "./bwdata/music/terran1.ogg",
    },
    onLoaded
  );
  function onLoaded() {
    var button = document.querySelector("button");
    button.removeAttribute("disabled");
    button.innerHTML = "Play/pause";
  }
  this.isPlaying = false;
}

VolumeSample.prototype.play = function () {
  this.gainNode = context.createGain();
  this.source = context.createBufferSource();
  this.source.buffer = this.buffer;

  // Connect source to a gain node
  this.source.connect(this.gainNode);
  // Connect gain node to destination
  this.gainNode.connect(context.destination);
  // Start playback in a loop
  this.source.loop = true;
  this.source[this.source.start ? "start" : "noteOn"](0);
};

VolumeSample.prototype.changeVolume = function (element) {
  var volume = element.value;
  var fraction = parseInt(element.value) / parseInt(element.max);
  // Let's use an x*x curve (x-squared) since simple linear (x) does not
  // sound as good.
  this.gainNode.gain.value = fraction * fraction;
};

VolumeSample.prototype.stop = function () {
  this.source[this.source.stop ? "stop" : "noteOff"](0);
};

VolumeSample.prototype.toggle = function () {
  this.isPlaying ? this.stop() : this.play();
  this.isPlaying = !this.isPlaying;
};

var sample = new VolumeSample();

function createFloor(mapWidth, mapHeight) {
  const w = mapWidth;
  const h = mapHeight;

  const geo = new THREE.PlaneGeometry(w, h, w, h);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: false,
    wireframeLinewidth: 10,
  });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.rotateX(-0.5 * Math.PI);
  return mesh;
}

function createStartLocation(mapX, mapY, color) {
  var geometry = new THREE.CircleGeometry(2, 32);
  var material = new THREE.MeshBasicMaterial({
    color,
  });
  var circle = new THREE.Mesh(geometry, material);
  circle.rotation.x = Math.PI / -2;
  circle.position.x = mapX;
  circle.position.z = mapY;
  circle.position.y = 0.01;
  return circle;
}

const scene = new THREE.Scene();

// @ts-ignore
window.scene = scene;

let renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("three-js"),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// instantiate a listener
var audioListener = new THREE.AudioListener();

// add the listener to the camera
camera.add(audioListener);

// instantiate audio object
var bgMusic = new THREE.Audio(audioListener);

// add the audio object to the scene
scene.add(bgMusic);

// new THREE.AudioLoader().load(
//   // resource URL
//   "./bwdata/sound/glue/bnetclick.wav",

//   // onLoad callback
//   function (audioBuffer) {
//     // set the audio object buffer to the loaded object
//     bgMusic.setBuffer(audioBuffer);

//     // play the audio
//     bgMusic.play();
//   },

//   // onProgress callback
//   function (xhr) {
//     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
//   },

//   // onError callback
//   function (err) {
//     console.log("An error happened");
//   }
// );

var axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const world = new THREE.Group();
const mapMesh = createFloor(128, 128, null);
const startPos = createStartLocation(-60, -60, 0xff0000);
const startPos2 = createStartLocation(60, 60, 0x0000ff);
const gridHelper = new THREE.GridHelper(128, 128);

camera.lookAt(mapMesh.position);

world.add(gridHelper);
world.add(mapMesh);
world.add(startPos);
world.add(startPos2);
scene.add(world);

const clock = new THREE.Clock(true);
let frames = 10;

let cameraTarget = new THREE.Vector3();

function gameLoop() {
  requestAnimationFrame(gameLoop);

  renderer.render(scene, camera);
}
handleResize(camera, renderer);
// window.document.body.appendChild(renderer.domElement)
requestAnimationFrame(gameLoop);
