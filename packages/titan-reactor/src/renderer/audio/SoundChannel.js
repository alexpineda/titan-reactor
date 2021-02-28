/**
 * A representation of a sound channel
 */
export default class SoundChannel {
  assign(audio) {
    this.audio = audio;
    this.id = audio.sound.id;
    this.unitTypeId = audio.sound.unitTypeId;
    this.priority = audio.sound.priority;
    this.flags = audio.sound.flags;
  }

  get isPlaying() {
    return this.audio && this.audio.isPlaying;
  }
}
