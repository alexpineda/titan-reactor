import createScmExtractor from "scm-extractor";
import Chk from "bw-chk";
import concat from "concat-stream";
import {PNG} from 'pngjs';

const fs = window.require("fs");

let width, height;

const canvas = document.createElement("canvas");
canvas.style.transformOrigin = "0 0";
canvas.style.transform = "scale(0.25)";

document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

console.log("bw-chk-test:start", new Date().toLocaleString());


canvas.addEventListener('click', ({offsetX, offsetY}) => {
  console.log(offsetX, offsetY, Math.floor(offsetX / 8), Math.floor(offsetY / 8), Math.floor(offsetX / 32), Math.floor(offsetY / 32))
  window.chk.getTileInfoFromXY(Chk.fsFileAccess("./bwdata"), width, height, offsetX, offsetY).then(data => console.log(data))
  
});


// const file = fs.createReadStream("./ladder/Season 7/(3)Reap the Storm.scx");
// const file = fs.createReadStream("./ladder/Season 7/(3)Neo_Sylphid_2.0.scx")
// const file = fs.createReadStream("./ladder/Season 7/(2)MatchPoint1.3.scx")
// const file = fs.createReadStream("./ladder/Season 7/(2)Eclipse_1.05.scx")
// const file = fs.createReadStream("./ladder/Season 7/(4)CircuitBreakers1.0.scx")
const file = fs.createReadStream("./ladder/Season 7/(4)Fighting Spirit.scx")
// const file = fs.createReadStream("./ladder/Season 7/(4)Polypoid 1.32.scx");
// const file = fs.createReadStream("./ladder/Season 6/(2)Hitchhiker 1.3[P].scx");
// const file = fs.createReadStream("./ladder/Season 6/(2)Neo Bloody Ridge 2.1.scx");
// const file = fs.createReadStream("./ladder/Season 6/(4)Escalade1.0.scx");
// const file = fs.createReadStream("./ladder/Season 6/(4)LaMancha1.1.scx");
// const file = fs.createReadStream("./ladder/Season 5/(2)Destination.scx");
// const file = fs.createReadStream("./ladder/Season 5/(2)Heartbreak Ridge 2.1.scx");
// const file = fs.createReadStream("./ladder/Season 5/(3)Whiteout1.2.scx");
// const file = fs.createReadStream("./ladder/Season 5/(4)Gladiator1.1.scx");
// const file = fs.createReadStream("./ladder/FrontierLeague2018/(3)Longinus 2.scx");
// const file = fs.createReadStream("./ladder/FrontierLeague2018/(3)Tau Cross.scx");
// const file = fs.createReadStream("./ladder/FrontierLeague2018/(3)Transistor1.2.scm");
// const file = fs.createReadStream("./ladder/FrontierLeague2017/(4)Jade.scx");
// const file = fs.createReadStream("./ladder/2019Season2/(2)Overwatch(n).scx");
// const file = fs.createReadStream("./ladder/2019Season2/(2)Tres Pass.scx");
// const file = fs.createReadStream("./ladder/2019Season2/(3)Power Bond.scx");
// const file = fs.createReadStream("./ladder/2019Season2/(4)BlockChainSE2.1.scx");
// const file = fs.createReadStream("./ladder/2019Season1/(2)Cross Game.scx");
// const file = fs.createReadStream("./ladder/2019Season1/(3)Medusa 2.2_iCCup.scx");
// const file = fs.createReadStream("./ladder/2019Season1/(4)Colosseum 2.0_iCCup.scx");
// const file = fs.createReadStream("./ladder/2019Season1/(4)Ground_Zero_2.0_iCCup.scx");
// const file = fs.createReadStream("./ladder/2018Season2/(2)Benzene 1.1_iCCup.scx");
// const file = fs.createReadStream("./ladder/2018Season2/(3)Aztec 2.1_iCCup.scx");
// const file = fs.createReadStream("./ladder/2018Season2/(4)In the Way of an Eddy.scx");
// const file = fs.createReadStream("./ladder/2018Season2/(4)Roadkill.scm");
// const file = fs.createReadStream("./ladder/2018Season1/(2)Polaris Rhapsody.scx");
// const file = fs.createReadStream("./ladder/(8)Big Game Hunters.scm");
// const file = fs.createReadStream("./ladder/(4)Blood Bath.scm");

// file.pipe(createScmExtractor())
//   .pipe(
//     concat((data) => {
//       const chk = new Chk(data);
//       console.log("mapInfo", chk);
//       window.chk = chk;

//       const width = chk.size[0] * 32;
//       const height = chk.size[1] * 32;
//       canvas.width = width;
//       canvas.height = height;
      
//           chk.image(Chk.fsFileAccess("./bwdata"), width, height, {
//             mode: 'displacement',
//             startLocations: false,
//             sprites: false
//           }).then((data) => {
            
//             writeToCanvas(ctx, data, width, height, false);
//             // drawGrid(ctx, width, height);
//             addDownloadLink();
//           }
//           )
       
//     })
//   );

file
  .pipe(createScmExtractor())
  .pipe(
    concat((data) => {
      const chk = new Chk(data);
      console.log("mapInfo", chk);
      window.chk = chk;

const width = chk.size[0] * 32;
      const height = chk.size[1] * 32;
canvas.width = width;
      canvas.height = height;
      chk
        .image(Chk.fsFileAccess("./bwdata"), width, height, {
          melee: false,
          startLocations: false,
          sprites: false
        })
        .then((data) => {

          chk.bitMapData = data;
          writeToCanvas(ctx, data, width, height);

          chk.image(Chk.fsFileAccess("./bwdata"), width, height, {
            mode: 'displacement'
          }).then((data) => {
            
            writeToCanvas(ctx, data, width, height, false);
            // drawGrid(ctx, width, height);
            addDownloadLink();
            
            
          }
          )
          

          // fs.writeFile("fs-new.bin", data, () => {})

        });
    })
  );

  function addDownloadLink() {
    var img = canvas.toDataURL("image/png");
    const a =  document.createElement("a")
    a.setAttribute("href", img);
    a.setAttribute("download", "download");
    a.innerText = "download";
    document.body.appendChild(a);
  }

  function drawGrid(ctx, width, height) {
    ctx.strokeStyle = '#999';
    ctx.globalAlpha = 0.5;
    for (let x = 0; x < width; x = x + 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y = y + 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    
  }
function writeToCanvas(ctx, data, width, height, blend = false) {
  const srcPixelWidth = "rgb".length;
  const dstPixelWidth = 4;

  const prevdata = ctx.getImageData(0, 0, width, height);
  const imagedata = ctx.createImageData(width, height);

  if (blend) {
  for (
    let src = 0, dst = 0;
    src < data.length;
    src += srcPixelWidth, dst += dstPixelWidth
  ) {
    imagedata.data[dst] = (data[src] + prevdata.data[dst]) /2 ;
    imagedata.data[dst + 1] = (data[src + 1]+ prevdata.data[dst+1])/2;
    imagedata.data[dst + 2] = (data[src + 2] + prevdata.data[dst+2])/2;
    imagedata.data[dst + 3] = srcPixelWidth === 4 ? data[src + 3] : 255;
  }
} else {
  for (
    let src = 0, dst = 0;
    src < data.length;
    src += srcPixelWidth, dst += dstPixelWidth
  ) {
    imagedata.data[dst] = data[src];
    imagedata.data[dst + 1] = data[src + 1];
    imagedata.data[dst + 2] = data[src + 2];
    imagedata.data[dst + 3] = srcPixelWidth === 4 ? data[src + 3] : 255;
  }
}

  ctx.putImageData(imagedata, 0, 0);
}
