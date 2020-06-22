onmessage = ({command, data}) => {
    if (command === 'load-map') {
        console.log('loading:start ' + data);
        const map = data;
        const mapDetailsLoader = new Promise((res, rej) => {
            fs.createReadStream(`./maps/${map}`)
              .pipe(createScmExtractor())
              .pipe(
                concat((data) => {
                  res(generateMapDetails(data))
                }))
              })
          
        
          const mapLoader = new Promise((res, rej) => {
            fs.createReadStream(`./maps/${map}`)
            .pipe(createScmExtractor())
            .pipe(
              concat((data) => {
                generateMap("./bwdata", data).then(data => res(toDataTexture(data)), rej
                );
              })
            );
          })
        
          const bgLoader = new Promise((res, rej) => {
            fs.createReadStream(`./maps/${map}`)
            .pipe(createScmExtractor())
            .pipe(
              concat((data) => {
                generateMap("./bwdata", data, 0.25, 32).then(data => res(toDataTexture(data)), rej
                );
              })
            );
          })
        
          const displaceLoader = new Promise((res, rej) => {
        
            fs.createReadStream(`./maps/${map}`)
            .pipe(createScmExtractor())
            .pipe(
              concat((data) => {
                generateDisplacementMap("./bwdata", data).then(data => res(toDataTexture(data)), rej
                );
              })
            );
          });
        
        
          const roughnessLoader = new Promise((res, rej) => {
            fs.createReadStream(`./maps/${map}`)
            .pipe(createScmExtractor())
            .pipe(
              concat((data) => {
                generateRoughnessMap("./bwdata", data).then(data => res(toDataTexture(data)), rej
                );
              })
            );
          })
        
          Promise.all([mapDetailsLoader, mapLoader, bgLoader, displaceLoader, roughnessLoader]).then(([mapDetails, map, bg, displace, roughness]) => {
            map.encoding = THREE.sRGBEncoding;
            bg.encoding = THREE.sRGBEncoding;
            // map.flipY = false;
            // bg.flipY = false;
            // displace.flipY = false;
            // roughness.flipY = false;
            
            postMessage({
                command,
                err: null,
                data: {
                    width: mapDetails.size[0],
                    height: mapDetails.size[1],
                    meshes: generateMapMeshes(mapDetails.size[0], mapDetails.size[1], map, bg, displace,roughness)
                }
            })
        
          })
    }
}