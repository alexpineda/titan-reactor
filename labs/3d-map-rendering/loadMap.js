// const {
//     Worker, isMainThread, parentPort, workerData
//   } = require('worker_threads');


//   const toDataTexture = ({data, width, height}) => new THREE.DataTexture(data, width, height, THREE.RGBFormat);

//   if (isMainThread) {
//     module.exports = function loadMap(map) {
//       return new Promise((resolve, reject) => {
//         const worker = new Worker(__filename, {
//           workerData: {
//               map
//           }
//         });
//         worker.on('message', resolve);
//         worker.on('error', reject);
//         worker.on('exit', (code) => {
//           if (code !== 0)
//             reject(new Error(`Worker stopped with exit code ${code}`));
//         });
//       });
//     };
//   } else {
//     const { map } = workerData;

//     const mapDetailsLoader = new Promise((res, rej) => {
//         fs.createReadStream(`./maps/${map}`)
//           .pipe(createScmExtractor())
//           .pipe(
//             concat((data) => {
//               res(generateMapDetails(data))
//             }))
//           })
      
    
//       const mapLoader = new Promise((res, rej) => {
//         fs.createReadStream(`./maps/${map}`)
//         .pipe(createScmExtractor())
//         .pipe(
//           concat((data) => {
//             generateMap("./bwdata", data).then(data => res(toDataTexture(data)), rej
//             );
//           })
//         );
//       })
    
//       const bgLoader = new Promise((res, rej) => {
//         fs.createReadStream(`./maps/${map}`)
//         .pipe(createScmExtractor())
//         .pipe(
//           concat((data) => {
//             generateMap("./bwdata", data, 0.25, 32).then(data => res(toDataTexture(data)), rej
//             );
//           })
//         );
//       })
    
//       const displaceLoader = new Promise((res, rej) => {
    
//         fs.createReadStream(`./maps/${map}`)
//         .pipe(createScmExtractor())
//         .pipe(
//           concat((data) => {
//             generateDisplacementMap("./bwdata", data).then(data => res(toDataTexture(data)), rej
//             );
//           })
//         );
//       });
    
    
//       const roughnessLoader = new Promise((res, rej) => {
//         fs.createReadStream(`./maps/${map}`)
//         .pipe(createScmExtractor())
//         .pipe(
//           concat((data) => {
//             generateRoughnessMap("./bwdata", data).then(data => res(toDataTexture(data)), rej
//             );
//           })
//         );
//       })
    
//       Promise.all([mapDetailsLoader, mapLoader, bgLoader, displaceLoader, roughnessLoader]).then(([mapDetails, map, bg, displace, roughness]) => {
//         map.encoding = THREE.sRGBEncoding;
//         bg.encoding = THREE.sRGBEncoding;
//         // map.flipY = false;
//         // bg.flipY = false;
//         // displace.flipY = false;
//         // roughness.flipY = false;
        
//         parentPort.postMessage(generateMapMeshes(mapDetails.size[0], mapDetails.size[1], map, bg, displace,roughness))
    
//       })
//   }


    
    
      
    