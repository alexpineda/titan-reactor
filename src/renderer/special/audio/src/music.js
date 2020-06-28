export const getRandomLoadingSong = () => {
  const files = ["title.ogg", "prdyroom.ogg", "trdyroom.ogg", "zrdyroom.ogg"];
  return files[Math.floor(Math.random() * 4)];
};

export const getRandomSong = (race) => {
  const files = [
    `${race}1.ogg`,
    `${race}2.ogg`,
    `${race}3.ogg`,
    `${race}4.ogg`,
  ];
  return files[Math.floor(Math.random() * 4)];
};

export class Music {
  constructor(bwDataPath, document) {
    this.bwDataPath = bwDataPath;
  }

  play(file) {
    if (this.audio) {
      document.removeChild(audio);
    }
    this.audio = document.createElement("audio");
    this.audio.setAttribute("preload", "auto");
    this.audio.setAttribute("autoplay", "autoplay");
    this.audio.setAttribute("src", `${this.bwDataPath}/music/${file}`);
    document.body.appendChild(this.audio);

    // this.audio
    //   .play()
    //   .then((evt) => {
    //     console.log(evt);
    //   })
    //   .catch((err) => {
    //     console.error(err, file);
    //   });
  }

  volume(v) {
    this.audio.volume = v;
  }
}
