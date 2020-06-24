/*
	Include ThreeJS like normal
*/
THREE.SpriteSheetTexture = function (
  imageURL,
  framesX,
  framesY,
  frameDelay,
  _endFrame
) {
  var timer,
    frameWidth,
    frameHeight,
    x = (y = count = startFrame = 0),
    endFrame = _endFrame || framesX * framesY,
    CORSProxy = "https://cors-anywhere.herokuapp.com/",
    canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d"),
    canvasTexture = new THREE.CanvasTexture(canvas),
    img = new Image();

  img.crossOrigin = "Anonymous";
  img.onload = function () {
    canvas.width = frameWidth = img.width / framesX;
    canvas.height = frameHeight = img.height / framesY;
    timer = setInterval(nextFrame, frameDelay);
  };
  img.src = CORSProxy + imageURL;

  function nextFrame() {
    count++;

    if (count >= endFrame) {
      count = 0;
    }

    x = (count % framesX) * frameWidth;
    y = ((count / framesX) | 0) * frameHeight;

    ctx.clearRect(0, 0, frameWidth, frameHeight);
    ctx.drawImage(
      img,
      x,
      y,
      frameWidth,
      frameHeight,
      0,
      0,
      frameWidth,
      frameHeight
    );

    canvasTexture.needsUpdate = true;
  }

  return canvasTexture;
};

var width = window.innerWidth,
  height = window.innerHeight / 2;
var camera, scene, renderer, geometry, texture, mesh;

function init() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
  camera.position.z = 500;
  scene.add(camera);

  texture = new THREE.SpriteSheetTexture(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/68819/grid-sprite.jpg",
    4,
    4,
    100,
    16
  );

  var spriteMap = new THREE.TextureLoader().load(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/68819/grid-sprite.jpg"
  );
  var spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    color: 0xffffff,
  });
  var sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(200, 200, 1);
  scene.add(sprite);
}

function animate() {
  requestAnimationFrame(animate);
  //mesh.rotation.y += 0.01;
  renderer.render(scene, camera);
}

init();
animate();
